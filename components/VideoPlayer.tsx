import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  Sliders,
  Camera,
  PictureInPicture,
  Tv,
  AlertCircle,
  ZoomIn,
  RefreshCw,
  ExternalLink,
  Layers
} from 'lucide-react';
import { QualityLevel, PanOffset, PlayerStats, StreamItem } from '../types/player';
import ZoomRadar from './ZoomRadar';
import StatsForNerds from './StatsForNerds';
import SettingsMenu from './SettingsMenu';

export interface VideoPlayerRef {
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  play: () => void;
  pause: () => void;
  reload: () => void;
}

interface VideoPlayerProps {
  stream: StreamItem;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  onResetZoom: () => void;
  theaterMode: boolean;
  onToggleTheaterMode: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      stream,
      zoomLevel,
      onZoomChange,
      onResetZoom,
      theaterMode,
      onToggleTheaterMode,
      onToggleFullscreen,
      isFullscreen,
      onTimeUpdate,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const controlsTimerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [bufferedEnd, setBufferedEnd] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [audioBoost, setAudioBoost] = useState(1.0);
    const [isLiveSynced, setIsLiveSynced] = useState(true);

    // Stream status
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Visibility controls
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showStats, setShowStats] = useState(false);

    // Quality state
    const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
    const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1);
    const [currentBitrate, setCurrentBitrate] = useState<string>('Auto');

    // Pan & Zoom
    const [pan, setPan] = useState<PanOffset>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });

    // Broadcast HUD action badge
    const [hudNotice, setHudNotice] = useState<string | null>(null);
    const hudTimerRef = useRef<number | null>(null);

    const triggerHud = (message: string) => {
      setHudNotice(message);
      if (hudTimerRef.current) window.clearTimeout(hudTimerRef.current);
      hudTimerRef.current = window.setTimeout(() => setHudNotice(null), 1200);
    };

    // Seek scrub bar hover
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosPercent, setHoverPosPercent] = useState<number>(0);
    const scrubBarRef = useRef<HTMLDivElement>(null);

    // Technical Diagnostics
    const [stats, setStats] = useState<PlayerStats>({
      resolution: '1920x1080',
      fps: 30,
      currentBitrate: '2.5 Mbps',
      bufferLength: 0,
      droppedFrames: 0,
      zoomLevel: 1.0,
      panX: 0,
      panY: 0,
      audioBoost: 1.0,
      playbackRate: 1.0,
      latencyToLive: 0,
      codec: 'avc1.640028, mp4a.40.2',
    });

    const initHlsStream = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      setHasError(false);
      setErrorMessage(null);
      setIsLoading(true);
      setIsPlaying(false);
      setQualityLevels([]);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const isHls = stream.url.includes('.m3u8');

      if (isHls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsRef.current = hls;

        hls.loadSource(stream.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          setIsLoading(false);
          setHasError(false);
          if (data.levels && data.levels.length > 0) {
            const lvls: QualityLevel[] = data.levels
              .map((l: any, idx: number) => ({
                index: idx,
                height: l.height || 720,
                bitrate: l.bitrate || 0,
              }))
              .sort((a, b) => b.height - a.height);
            setQualityLevels(lvls);
          }
          video.play().catch(() => {});
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const lvl = hls.levels[data.level];
          if (lvl) {
            const bitrateStr = lvl.bitrate > 1000000
              ? `${(lvl.bitrate / 1000000).toFixed(1)} Mbps`
              : `${Math.round(lvl.bitrate / 1000)} kbps`;
            setCurrentBitrate(bitrateStr);
            setStats((prev) => ({
              ...prev,
              resolution: `${lvl.width || 1920}x${lvl.height || 1080}`,
              currentBitrate: bitrateStr,
            }));
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setHasError(true);
                setErrorMessage('Živý přenos v tomto sále právě nevysílá (mimo jednací dobu nebo přestávka).');
                setIsLoading(false);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setHasError(true);
                setErrorMessage('Chyba při inicializaci přenosu.');
                setIsLoading(false);
                hls.destroy();
                break;
            }
          }
        });
      } else {
        video.src = stream.url;
        video.load();

        const handleCanPlay = () => {
          setIsLoading(false);
          setHasError(false);
          video.play().catch(() => {});
        };

        const handleError = () => {
          setIsLoading(false);
          setHasError(true);
          setErrorMessage('Přenos není v této chvíli dostupný.');
        };

        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);

        return () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
        };
      }
    }, [stream.url]);

    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => (videoRef.current ? videoRef.current.currentTime : 0),
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      reload: () => initHlsStream(),
    }));

    const hideControls = useCallback(() => {
      if (isSettingsOpen || showStats) return;
      setControlsVisible(false);
    }, [isSettingsOpen, showStats]);

    const showControls = useCallback(() => {
      setControlsVisible(true);
      if (controlsTimerRef.current) {
        window.clearTimeout(controlsTimerRef.current);
      }
      controlsTimerRef.current = window.setTimeout(hideControls, 3500);
    }, [hideControls]);

    const formatTime = (secs: number) => {
      if (isNaN(secs) || secs < 0) return '0:00';
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      if (h > 0) {
        return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const initAudioBoost = useCallback(() => {
      const video = videoRef.current;
      if (!video || audioContextRef.current) return;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();
        const gainNode = ctx.createGain();
        const source = ctx.createMediaElementSource(video);

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        audioContextRef.current = ctx;
        gainNodeRef.current = gainNode;
        sourceNodeRef.current = source;
      } catch (err) {
        console.warn('Web Audio gain initialization error:', err);
      }
    }, []);

    useEffect(() => {
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = audioBoost;
      }
    }, [audioBoost]);

    useEffect(() => {
      initHlsStream();
      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [initHlsStream]);

    // Video events & time updates
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onWaiting = () => setIsLoading(true);
      const onPlaying = () => setIsLoading(false);

      const onTime = () => {
        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);

        if (video.buffered.length > 0) {
          const bufEnd = video.buffered.end(video.buffered.length - 1);
          setBufferedEnd(bufEnd);
          const bufLength = Math.max(0, bufEnd - video.currentTime);
          setStats((prev) => ({
            ...prev,
            bufferLength: bufLength,
            latencyToLive: stream.isLive ? Math.max(0, video.duration - video.currentTime) : null,
          }));
        }

        if (onTimeUpdate) {
          onTimeUpdate(video.currentTime, video.duration || 0);
        }
      };

      video.addEventListener('play', onPlay);
      video.addEventListener('pause', onPause);
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('playing', onPlaying);
      video.addEventListener('timeupdate', onTime);

      return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('timeupdate', onTime);
      };
    }, [stream.isLive, onTimeUpdate]);

    // Pan boundary calculations
    const updatePan = useCallback(
      (newPan: PanOffset, zoom: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const maxPanX = ((rect.width * zoom - rect.width) / 2) / zoom;
        const maxPanY = ((rect.height * zoom - rect.height) / 2) / zoom;

        const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newPan.x));
        const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newPan.y));

        setPan({ x: clampedX, y: clampedY });
        setStats((prev) => ({
          ...prev,
          zoomLevel: zoom,
          panX: clampedX,
          panY: clampedY,
        }));
      },
      []
    );

    useEffect(() => {
      if (zoomLevel <= 1.02) {
        setPan({ x: 0, y: 0 });
        setStats((prev) => ({ ...prev, zoomLevel: 1.0, panX: 0, panY: 0 }));
      } else {
        updatePan(pan, zoomLevel);
      }
    }, [zoomLevel, updatePan]);

    const handlePanStart = (clientX: number, clientY: number) => {
      if (zoomLevel <= 1.02) return;
      setIsPanning(true);
      panStartRef.current = {
        x: clientX - pan.x * zoomLevel,
        y: clientY - pan.y * zoomLevel,
      };
    };

    const handlePanMove = (clientX: number, clientY: number) => {
      if (!isPanning || zoomLevel <= 1.02) return;
      const newPan = {
        x: (clientX - panStartRef.current.x) / zoomLevel,
        y: (clientY - panStartRef.current.y) / zoomLevel,
      };
      updatePan(newPan, zoomLevel);
    };

    const handlePanEnd = () => setIsPanning(false);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.003;
      const newZoom = Math.max(1.0, Math.min(8.0, Number((zoomLevel + delta).toFixed(2))));
      onZoomChange(newZoom);
      triggerHud(`ZOOM ${newZoom.toFixed(1)}x`);
    };

    const togglePlay = () => {
      initAudioBoost();
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
        triggerHud('PŘEHRÁVÁNÍ');
      } else {
        video.pause();
        setIsPlaying(false);
        triggerHud('POZASTAVENO');
      }
    };

    const skipTime = useCallback((seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(video.duration || 999999, video.currentTime + seconds));
      triggerHud(seconds > 0 ? `+${seconds} s` : `${seconds} s`);
    }, []);

    const handleSyncToLive = () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.duration && isFinite(video.duration)) {
        video.currentTime = video.duration - 0.5;
        setIsLiveSynced(true);
        triggerHud('PŘÍMÝ PŘENOS');
      }
    };

    const handleVolumeChange = (newVol: number) => {
      const video = videoRef.current;
      setVolume(newVol);
      if (video) {
        video.volume = newVol;
        if (newVol > 0 && isMuted) {
          setIsMuted(false);
          video.muted = false;
        }
      }
    };

    const toggleMute = () => {
      const video = videoRef.current;
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      if (video) video.muted = nextMuted;
      triggerHud(nextMuted ? 'ZVUK VYPNUT' : 'ZVUK ZAPNUT');
    };

    const handleRateChange = (rate: number) => {
      setPlaybackRate(rate);
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
      }
      setStats((prev) => ({ ...prev, playbackRate: rate }));
      triggerHud(`RYCHLOST ${rate}x`);
    };

    const handleQualityChange = (levelIndex: number) => {
      setSelectedQualityIndex(levelIndex);
      if (hlsRef.current) {
        hlsRef.current.currentLevel = levelIndex;
      }
    };

    const handleTakeScreenshot = () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `snemovna_snimek_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        triggerHud('SNÍMEK ULOŽEN');
      } catch (err) {
        console.error('Screenshot capture failed:', err);
      }
    };

    const handleTogglePiP = async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
          await video.requestPictureInPicture();
        }
      } catch (err) {
        console.error('PiP error:', err);
      }
    };

    const handleScrubClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!scrubBarRef.current || !videoRef.current) return;
      const rect = scrubBarRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetTime = pos * (duration || 100);
      videoRef.current.currentTime = targetTime;
    };

    const handleScrubMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!scrubBarRef.current) return;
      const rect = scrubBarRef.current.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setHoverPosPercent(pos * 100);
      setHoverTime(pos * (duration || 0));
    };

    const handleScrubMouseLeave = () => setHoverTime(null);

    // Keyboard shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

        switch (e.key.toLowerCase()) {
          case ' ':
          case 'k':
            e.preventDefault();
            togglePlay();
            break;
          case 'f':
            e.preventDefault();
            onToggleFullscreen();
            break;
          case 't':
            e.preventDefault();
            onToggleTheaterMode();
            break;
          case 'm':
            e.preventDefault();
            toggleMute();
            break;
          case 'j':
          case 'arrowleft':
            e.preventDefault();
            skipTime(-10);
            break;
          case 'l':
          case 'arrowright':
            e.preventDefault();
            skipTime(10);
            break;
          case 'arrowup':
            e.preventDefault();
            handleVolumeChange(Math.min(1, volume + 0.05));
            break;
          case 'arrowdown':
            e.preventDefault();
            handleVolumeChange(Math.max(0, volume - 0.05));
            break;
          case '+':
          case '=':
            e.preventDefault();
            onZoomChange(Math.min(8.0, Number((zoomLevel + 0.2).toFixed(2))));
            triggerHud(`ZOOM ${(zoomLevel + 0.2).toFixed(1)}x`);
            break;
          case '-':
            e.preventDefault();
            onZoomChange(Math.max(1.0, Number((zoomLevel - 0.2).toFixed(2))));
            triggerHud(`ZOOM ${(zoomLevel - 0.2).toFixed(1)}x`);
            break;
          case '0':
            e.preventDefault();
            onResetZoom();
            triggerHud('ZOOM 1.0x');
            break;
          case 's':
            e.preventDefault();
            handleTakeScreenshot();
            break;
          default:
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [volume, zoomLevel, isFullscreen, onToggleFullscreen, onToggleTheaterMode, onZoomChange, onResetZoom, skipTime]);

    const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

    const cursorStyle = isPanning
      ? 'cursor-grabbing'
      : zoomLevel > 1.05
      ? 'cursor-grab'
      : 'cursor-pointer';

    return (
      <div className="relative w-full flex items-center justify-center">
        <div
          ref={containerRef}
          onMouseMove={() => showControls()}
          onMouseLeave={() => {
            handlePanEnd();
            hideControls();
          }}
          onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
          onMouseMoveCapture={(e) => handlePanMove(e.clientX, e.clientY)}
          onMouseUp={handlePanEnd}
          onWheel={handleWheel}
          className={`relative w-full aspect-video bg-[#030712] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 select-none group touch-none ${cursorStyle}`}
        >
          {/* Main Video Viewport */}
          <video
            ref={videoRef}
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-cover transition-transform duration-75"
            style={{
              transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
              transformOrigin: '50% 50%',
            }}
          />

          {/* Click to play/pause */}
          <div
            className="absolute inset-0 z-10"
            onClick={togglePlay}
          />

          {/* On-screen HUD readout */}
          {hudNotice && (
            <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none z-30">
              <div className="px-4 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700 text-sky-300 font-mono text-xs font-bold tracking-wider shadow-2xl">
                {hudNotice}
              </div>
            </div>
          )}

          {/* Zoom Radar Mini Map */}
          <ZoomRadar
            zoomLevel={zoomLevel}
            pan={pan}
            onPanChange={(newPan) => updatePan(newPan, zoomLevel)}
            onResetZoom={onResetZoom}
          />

          {/* Technical Diagnostics modal */}
          {showStats && (
            <StatsForNerds
              stats={stats}
              streamName={stream.name}
              onClose={() => setShowStats(false)}
            />
          )}

          {/* Loading indicator */}
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-20">
              <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-slate-300 font-medium mt-3 bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-800">
                Připojování k živému vysílání ČRa...
              </span>
            </div>
          )}

          {/* Offline / Inactive State (e.g. parliament outside session hours) */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-white z-20 text-center space-y-4">
              <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
                <AlertCircle className="w-10 h-10" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold text-slate-100">
                  Živý přenos v tomto sále právě nevysílá
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Poslanecká sněmovna zasedá ve stanovených dnech (obvykle v úterý od 14:00, středa až pátek od 9:00). Vyberte jiný z 5 kanálů sněmovny nebo ověřte harmonogram schůzí.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => initHlsStream()}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-sky-600/30 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Zkusit znovu připojit</span>
                </button>

                <a
                  href="https://www.psp.cz/sqw/hp.sqw?k=203"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Tv className="w-3.5 h-3.5 text-sky-400" />
                  <span>Harmonogram schůzí (psp.cz)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          )}

          {/* Settings Menu Popup */}
          {isSettingsOpen && (
            <SettingsMenu
              qualityLevels={qualityLevels}
              selectedQualityIndex={selectedQualityIndex}
              onQualityChange={handleQualityChange}
              playbackRate={playbackRate}
              onPlaybackRateChange={handleRateChange}
              audioBoost={audioBoost}
              onAudioBoostChange={setAudioBoost}
              showStats={showStats}
              onToggleStats={() => setShowStats(!showStats)}
              hasSubtitles={false}
              subtitlesEnabled={false}
              onToggleSubtitles={() => {}}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}

          {/* Bottom Player Controls Bar */}
          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pt-12 pb-3.5 px-4 md:px-5 transition-opacity duration-200 z-30 ${
              controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Timeline / Live Scrubber */}
            <div
              ref={scrubBarRef}
              onClick={handleScrubClick}
              onMouseMove={handleScrubMouseMove}
              onMouseLeave={handleScrubMouseLeave}
              className="relative w-full h-2 group/scrub flex items-center cursor-pointer mb-3"
            >
              <div className="absolute inset-x-0 h-1 group-hover/scrub:h-1.5 bg-slate-700/60 rounded-full transition-all"></div>
              <div
                style={{ width: `${bufferedPercent}%` }}
                className="absolute left-0 h-1 group-hover/scrub:h-1.5 bg-slate-500/50 rounded-full transition-all"
              ></div>
              <div
                style={{ width: `${playedPercent}%` }}
                className="absolute left-0 h-1 group-hover/scrub:h-1.5 bg-sky-500 rounded-full transition-all"
              ></div>
              <div
                style={{ left: `${playedPercent}%` }}
                className="absolute -translate-x-1/2 w-3.5 h-3.5 bg-sky-400 border-2 border-white rounded-full scale-0 group-hover/scrub:scale-100 transition-transform shadow-md pointer-events-none"
              ></div>

              {hoverTime !== null && (
                <div
                  style={{ left: `${hoverPosPercent}%` }}
                  className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-200 pointer-events-none shadow-lg"
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* Control Bar Actions */}
            <div className="flex items-center justify-between text-white text-xs">
              {/* Left group */}
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-xl bg-slate-800/90 hover:bg-sky-600 text-white flex items-center justify-center transition-colors border border-slate-700/80 active:scale-95 shadow-sm"
                  title={isPlaying ? 'Pozastavit (Mezerník / K)' : 'Spustit přehrávání (Mezerník / K)'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => skipTime(-10)}
                  className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="O 10 sekund zpět (J / ←)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => skipTime(10)}
                  className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="O 10 sekund vpřed (L / →)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Volume & Audio boost */}
                <div className="flex items-center group/vol gap-1 pl-1">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title={isMuted ? 'Zapnout zvuk (M)' : 'Ztlumit zvuk (M)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-amber-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-0 group-hover/vol:w-16 md:group-hover/vol:w-20 transition-all duration-200 h-1.5 bg-slate-700 rounded-lg cursor-pointer accent-sky-400"
                    title="Hlasitost"
                  />

                  {audioBoost > 1.05 && (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.5 rounded ml-1" title="Zesílení zvuku pro tiché řečníky">
                      +{Math.round((audioBoost - 1) * 100)}%
                    </span>
                  )}
                </div>

                {/* Live Tally Button */}
                <button
                  onClick={handleSyncToLive}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold tracking-wider transition-all border ${
                    isLiveSynced
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-800 hover:bg-emerald-600/30 text-slate-400 hover:text-emerald-300 border-slate-700'
                  }`}
                  title="Kliknutím skočíte na živé vysílání"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>PŘÍMÝ PŘENOS</span>
                </button>
              </div>

              {/* Right group */}
              <div className="flex items-center gap-1 md:gap-1.5">
                {/* Zoom readout badge */}
                <div className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-700 text-[11px] font-mono shadow-sm">
                  <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300 font-bold min-w-[32px] text-center">
                    {zoomLevel.toFixed(1)}x
                  </span>
                  {zoomLevel > 1.05 && (
                    <button
                      onClick={onResetZoom}
                      title="Resetovat výřez (1x)"
                      className="text-slate-400 hover:text-white p-0.5 ml-0.5"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>

                {/* Screenshot tool */}
                <button
                  onClick={handleTakeScreenshot}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  title="Uložit snímek obrazu (S)"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Settings / Configuration */}
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className={`p-2 rounded-xl transition-colors ${
                    isSettingsOpen
                      ? 'text-sky-400 bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Nastavení zvuku a kvality"
                >
                  <Sliders className="w-4 h-4" />
                </button>

                {/* PiP */}
                <button
                  onClick={handleTogglePiP}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors hidden sm:block"
                  title="Obraz v obraze"
                >
                  <PictureInPicture className="w-4 h-4" />
                </button>

                {/* Wide / Cinema layout toggle */}
                <button
                  onClick={onToggleTheaterMode}
                  className={`p-2 rounded-xl transition-colors hidden md:block ${
                    theaterMode
                      ? 'text-sky-400 bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Rozšířené zobrazení (T)"
                >
                  <Tv className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={onToggleFullscreen}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  title={isFullscreen ? 'Zmenšit okno (F)' : 'Celá obrazovka (F)'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
export default VideoPlayer;
