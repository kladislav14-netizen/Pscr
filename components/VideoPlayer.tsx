
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
}

// Define a type for HLS quality levels for better type safety
export interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

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

const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(({ src, zoomLevel, onZoomChange, refreshKey, onToggleFullscreen }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);

  // State for quality selection
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1); // -1 for Auto
  const [activeQualityHeight, setActiveQualityHeight] = useState<number | null>(null);
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  // State for panning and zooming
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [transformOrigin, setTransformOrigin] = useState('50% 50%');

  // State for fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
            setActiveQualityHeight(hls.levels[data.level].height);
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
        return `Auto ${activeQualityHeight ? `(${activeQualityHeight}p)` : ''}`;
    }
    const selectedLevel = qualityLevels.find(l => l.index === selectedQualityIndex);
    return selectedLevel ? `${selectedLevel.height}p` : '...';
  }

  const cursorClass = isPanning ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-pointer';

  return (
    <div 
        ref={containerRef}
        className={`relative w-full aspect-video bg-black flex items-center justify-center touch-none group ${cursorClass}`}
        onMouseDown={(e) => handlePanStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePanMove(e.clientX, e.clientY)}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onWheel={handleWheel}
        onTouchStart={(e) => {
          if (e.touches.length === 1) handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e) => {
          if (e.touches.length === 1) handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={handlePanEnd}
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
        onClick={(e) => {
           if (videoRef.current) {
               if(videoRef.current.paused) videoRef.current.play();
               else videoRef.current.pause();
           }
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
         <div className="flex items-center justify-end gap-3 pointer-events-auto">
            <div className="relative flex items-center gap-2">
                <span className="text-sm font-semibold">{getQualityLabel()}</span>
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
              onClick={onToggleFullscreen}
              className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 transition-colors"
              aria-label="Celá obrazovka"
            >
              {isFullscreen ? <FullscreenExitIcon className="w-6 h-6" /> : <FullscreenEnterIcon className="w-6 h-6" />}
            </button>
         </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
