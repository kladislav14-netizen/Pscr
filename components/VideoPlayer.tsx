import React, { useRef, useEffect, useState, forwardRef, useCallback } from 'react';
import QualitySelector from './QualitySelector';

// TypeScript declaration for Hls.js loaded from CDN
declare const Hls: any;

interface VideoPlayerProps {
  src: string;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  refreshKey: number;
  onToggleFullscreen: () => void;
  onRefresh: () => void;
  minZoom: number;
  maxZoom: number;
  step: number;
}

// Define a type for HLS quality levels for better type safety
export interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

const formatBitrate = (bitrate: number): string => {
  if (!bitrate) return '';
  if (bitrate > 1000000) {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  }
  return `${Math.round(bitrate / 1000)} kbps`;
};

// --- Player Icons ---

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-6-13.5v13.5" />
    </svg>
);

const VolumeUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const VolumeOffIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.695a2.25 2.25 0 0 0-2.25-2.25H10.5a2.25 2.25 0 0 0-2.25 2.25v.75" />
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.844c.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.513 6.513 0 0 1-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.844c-.008-.378-.137-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.298-2.247a1.125 1.125 0 0 1 1.37-.491l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

const FullscreenEnterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
    </svg>
);

const FullscreenExitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);

const MinusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// --- Component ---

const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(({ src, zoomLevel, onZoomChange, refreshKey, onToggleFullscreen, onRefresh, minZoom, maxZoom, step }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Quality selection state
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1); // -1 for Auto
  const [activeQualityInfo, setActiveQualityInfo] = useState<QualityLevel | null>(null);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);

  // Panning and zooming state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleZoomIn = useCallback(() => onZoomChange(zoomLevel + step), [zoomLevel, step, onZoomChange]);
  const handleZoomOut = useCallback(() => onZoomChange(zoomLevel - step), [zoomLevel, step, onZoomChange]);

  const hideControls = useCallback(() => {
    if (isQualityMenuOpen) return;
    setControlsVisible(false);
  }, [isQualityMenuOpen]);

  const showControls = useCallback(() => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) {
        showControls();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [showControls]);

  const updatePan = useCallback((newPan: {x: number, y: number}, currentZoom: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * currentZoom - rect.width) / 2 / currentZoom;
      const maxPanY = (rect.height * currentZoom - rect.height) / 2 / currentZoom;
      const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newPan.x));
      const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newPan.y));
      setPan({ x: clampedX, y: clampedY });
  }, []);

  useEffect(() => {
    if (zoomLevel <= 1) {
      setPan({ x: 0, y: 0 });
    } else {
       updatePan(pan, zoomLevel);
    }
  }, [zoomLevel, updatePan, pan]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    
    setIsPlaying(!video.paused);
    setIsMuted(video.muted);
    setVolume(video.volume);

    return () => {
        video.removeEventListener('play', onPlay);
        video.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current;

      const setupHls = () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          videoElement.play().catch(error => console.warn("Autoplay was prevented:", error));
        });
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (data.levels) {
                const videoLevels: QualityLevel[] = data.levels
                  .map((level: any, index: number) => ({
                    index: index,
                    height: level.height,
                    bitrate: level.bitrate,
                  }))
                  .filter((level: QualityLevel) => level.height > 0)
                  .sort((a: QualityLevel, b: QualityLevel) => b.height - a.height);
                setQualityLevels(videoLevels);
            }
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
            const levelInfo = hls.levels[data.level];
            setActiveQualityInfo({
                index: data.level,
                height: levelInfo.height,
                bitrate: levelInfo.bitrate
            });
        });
      };
      
      if (Hls.isSupported()) {
        setupHls();
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = src;
        videoElement.addEventListener('loadedmetadata', () => {
           videoElement.play().catch(error => console.warn("Autoplay was prevented:", error));
        });
      }
    }
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src, refreshKey]);

  useEffect(() => {
      if (hlsRef.current) {
          hlsRef.current.currentLevel = selectedQualityIndex;
      }
  }, [selectedQualityIndex]);

  const handlePanStart = (clientX: number, clientY: number) => {
      if (zoomLevel <= 1) return;
      setIsPanning(true);
      panStartRef.current = { x: clientX - pan.x * zoomLevel, y: clientY - pan.y * zoomLevel };
  };

  const handlePanMove = (clientX: number, clientY: number) => {
      if (!isPanning) return;
      const newPan = {
          x: (clientX - panStartRef.current.x) / zoomLevel,
          y: (clientY - panStartRef.current.y) / zoomLevel
      };
      updatePan(newPan, zoomLevel);
  };

  const handlePanEnd = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newZoom = Math.max(1, zoomLevel - e.deltaY * 0.005);
    onZoomChange(newZoom);
  };

  const handleQualityChange = (levelIndex: number) => {
      setSelectedQualityIndex(levelIndex);
      setIsQualityMenuOpen(false);
  };
  
  const getQualityLabel = () => {
    if (selectedQualityIndex === -1) {
        return `Auto ${activeQualityInfo ? `(${activeQualityInfo.height}p)` : ''}`;
    }
    const selectedLevel = qualityLevels.find(l => l.index === selectedQualityIndex);
    return selectedLevel ? `${selectedLevel.height}p` : '...';
  }
  
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
        if (videoRef.current.paused) videoRef.current.play();
        else videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if(videoRef.current) videoRef.current.muted = newMuted;
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (videoRef.current) videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
          setIsMuted(false);
          if (videoRef.current) videoRef.current.muted = false;
      }
  }, [isMuted]);

  const cursorClass = isPanning ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-pointer';

  return (
    <div 
        ref={containerRef}
        className={`relative w-full aspect-video bg-black flex items-center justify-center touch-none ${cursorClass}`}
        onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
        onMouseMove={(e) => {
          handlePanMove(e.clientX, e.clientY);
          showControls();
        }}
        onMouseUp={handlePanEnd}
        onMouseLeave={() => {
          handlePanEnd();
          hideControls();
        }}
        onWheel={handleWheel}
        onTouchStart={(e) => {
          if (e.touches.length === 1) handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
          showControls();
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handlePanEnd}
        onClick={showControls}
    >
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-contain"
        style={{ 
          transform: `scale(${zoomLevel}) translateX(${pan.x}px) translateY(${pan.y}px)`, 
          transformOrigin: transformOrigin,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      />

      <div 
        className={`absolute bottom-8 inset-x-4 bg-black/60 backdrop-blur-md rounded-xl p-2 md:p-4 transition-opacity duration-300 z-10 ${controlsVisible ? 'opacity-100' : 'opacity-0'} ${isQualityMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
       >
         <div className="flex items-center justify-between gap-3 pointer-events-auto">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
                <button onClick={togglePlayPause} className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 transition-colors" aria-label={isPlaying ? 'Pozastavit' : 'Přehrát'}>
                    {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 transition-colors" aria-label={isMuted ? 'Zapnout zvuk' : 'Vypnout zvuk'}>
                       {isMuted || volume === 0 ? <VolumeOffIcon className="w-6 h-6" /> : <VolumeUpIcon className="w-6 h-6" />}
                    </button>
                    <input 
                        type="range" min="0" max="1" step="0.05" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange}
                        className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        aria-label="Ovládání hlasitosti"
                    />
                </div>
                <div className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded-md">
                    LIVE
                </div>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center gap-3">
                {/* ZOOM CONTROLS - hidden on small screens */}
                <div className="hidden md:flex items-center gap-2">
                     <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= minZoom}
                        className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Oddálit"
                    >
                        <MinusIcon className="w-6 h-6" />
                    </button>
                     <input
                        type="range"
                        min={minZoom}
                        max={maxZoom}
                        step={step}
                        value={zoomLevel}
                        onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                        className="w-20 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        aria-label="Posuvník přiblížení"
                        />
                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= maxZoom}
                        className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Přiblížit"
                    >
                        <PlusIcon className="w-6 h-6" />
                    </button>
                    <span className="font-mono text-sm text-cyan-300 w-14 text-center">{zoomLevel.toFixed(1)}x</span>
                </div>
                {/* END ZOOM CONTROLS */}

                <span className="text-sm font-semibold hidden lg:block">{getQualityLabel()}</span>
                <div className="relative">
                    <button
                        onClick={() => setIsQualityMenuOpen(prev => !prev)}
                        disabled={qualityLevels.length === 0}
                        className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Nastavení kvality"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                    {isQualityMenuOpen && (
                        <QualitySelector
                            levels={qualityLevels}
                            currentLevelIndex={selectedQualityIndex}
                            onQualityChange={handleQualityChange}
                        />
                    )}
                </div>
                 <button
                    onClick={onRefresh}
                    className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 transition-colors"
                    aria-label="Obnovit stream"
                >
                    <RefreshIcon className="w-6 h-6" />
                </button>
                <button
                onClick={onToggleFullscreen}
                className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 transition-colors"
                aria-label="Celá obrazovka"
                >
                {isFullscreen ? <FullscreenExitIcon className="w-6 h-6" /> : <FullscreenEnterIcon className="w-6 h-6" />}
                </button>
            </div>
         </div>
      </div>
    </div>
  );
});

export default VideoPlayer;