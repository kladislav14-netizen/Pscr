
import React, { useRef, useEffect, useState, forwardRef } from 'react';
import QualitySelector from './QualitySelector';

// TypeScript declaration for Hls.js loaded from CDN
declare const Hls: any;

interface VideoPlayerProps {
  src: string;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  refreshKey: number;
}

// Define a type for HLS quality levels for better type safety
interface HlsLevel {
  height: number;
}

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a6.759 6.759 0 0 1 0 1.844c.008.378.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.513 6.513 0 0 1-.22.128c-.333.183-.582.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 0 1-1.37-.49l-1.296-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.844c-.008-.378-.137-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.298-2.247a1.125 1.125 0 0 1 1.37-.491l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);


const VideoPlayer = forwardRef<HTMLDivElement, VideoPlayerProps>(({ src, zoomLevel, onZoomChange, refreshKey }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  
  // State for quality selection
  const [qualityLevels, setQualityLevels] = useState<HlsLevel[]>([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(-1); // -1 for Auto
  const [isQualityMenuOpen, setIsQualityMenuOpen] = useState(false);

  // State for pinch-to-zoom
  const pinchStartDistance = useRef<number | null>(null);
  const lastZoomLevel = useRef<number>(zoomLevel);

  // State for panning
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
    lastZoomLevel.current = zoomLevel;
    if (zoomLevel <= 1) {
      setPan({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  useEffect(() => {
    if (videoRef.current) {
      const videoElement = videoRef.current;

      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          videoElement.play().catch(error => console.warn("Autoplay was prevented:", error));
        });
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (data.levels) {
                // Filter out levels with 0 height (often audio-only tracks)
                const videoLevels = data.levels.filter((level: HlsLevel) => level.height > 0);
                setQualityLevels(videoLevels);
            }
        });
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
      if (hlsRef.current && hlsRef.current.currentLevel !== currentQualityLevel) {
          hlsRef.current.currentLevel = currentQualityLevel;
      }
  }, [currentQualityLevel]);

  const getDistance = (touches: React.TouchList): number => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
  };

  const handlePanStart = (clientX: number, clientY: number) => {
      if (zoomLevel <= 1) return;
      setIsPanning(true);
      panStartRef.current = { x: clientX, y: clientY };
      lastPan.current = pan;
  };

  const handlePanMove = (clientX: number, clientY: number) => {
      if (!isPanning || !videoRef.current) return;
      const dx = clientX - panStartRef.current.x;
      const dy = clientY - panStartRef.current.y;
      const newPan = { x: lastPan.current.x + dx, y: lastPan.current.y + dy };
      const rect = videoRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * zoomLevel - rect.width) / 2;
      const maxPanY = (rect.height * zoomLevel - rect.height) / 2;
      const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newPan.x));
      const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newPan.y));
      setPan({ x: clampedX, y: clampedY });
  };

  const handlePanEnd = () => setIsPanning(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.video-controls')) return;
    e.preventDefault();
    handlePanStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) handlePanMove(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.video-controls')) return;
    if (e.touches.length === 1 && zoomLevel > 1) {
      e.preventDefault();
      handlePanStart(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      e.preventDefault();
      pinchStartDistance.current = getDistance(e.touches);
      lastZoomLevel.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.video-controls')) return;
    if (e.touches.length === 1 && isPanning) {
      e.preventDefault();
      handlePanMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && pinchStartDistance.current !== null) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      const scale = newDistance / pinchStartDistance.current;
      onZoomChange(lastZoomLevel.current * scale);
    }
  };
  
  const handleTouchEnd = () => {
    pinchStartDistance.current = null;
    handlePanEnd();
  };

  const handleQualityChange = (levelIndex: number) => {
      setCurrentQualityLevel(levelIndex);
      setIsQualityMenuOpen(false);
  };

  const cursorClass = isPanning ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-auto';

  return (
    <div 
        ref={ref}
        className={`relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center touch-none ${cursorClass}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handlePanEnd}
        onMouseLeave={handlePanEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
    >
      <video
        ref={videoRef}
        controls
        playsInline
        className="w-full h-full object-cover transition-transform duration-100 ease-out"
        style={{ transform: `scale(${zoomLevel}) translateX(${pan.x}px) translateY(${pan.y}px)` }}
      />

      <div className="video-controls absolute bottom-2 right-2">
         <div className="relative">
            <button
                onClick={() => setIsQualityMenuOpen(prev => !prev)}
                disabled={qualityLevels.length === 0}
                className="p-2 rounded-full bg-gray-800/70 text-white hover:bg-cyan-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Quality settings"
            >
                <SettingsIcon className="w-6 h-6" />
            </button>
            {isQualityMenuOpen && (
                <QualitySelector
                    levels={qualityLevels}
                    currentLevel={currentQualityLevel}
                    onQualityChange={handleQualityChange}
                />
            )}
         </div>
      </div>

    </div>
  );
});

export default VideoPlayer;
