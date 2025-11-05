import React, { useRef, useEffect, useState } from 'react';

// TypeScript declaration for Hls.js loaded from CDN
declare const Hls: any;

interface VideoPlayerProps {
  src: string;
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  refreshKey: number;
  onLevelsAvailable: (levels: any[]) => void;
  currentQualityLevel: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, zoomLevel, onZoomChange, refreshKey, onLevelsAvailable, currentQualityLevel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  
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
    // Reset pan when zoom is reset
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
          videoElement.play().catch(error => {
            console.warn("Autoplay was prevented:", error);
          });
        });
        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            if (data.levels) {
                onLevelsAvailable(data.levels);
            }
        });
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = src;
        videoElement.addEventListener('loadedmetadata', () => {
           videoElement.play().catch(error => {
            console.warn("Autoplay was prevented:", error);
          });
        });
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, refreshKey, onLevelsAvailable]);

  useEffect(() => {
      if (hlsRef.current && hlsRef.current.currentLevel !== currentQualityLevel) {
          hlsRef.current.currentLevel = currentQualityLevel;
      }
  }, [currentQualityLevel]);


  const getDistance = (touches: React.TouchList): number => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // --- Panning Logic ---
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
      
      const newPan = {
          x: lastPan.current.x + dx,
          y: lastPan.current.y + dy,
      };
      
      const rect = videoRef.current.getBoundingClientRect();
      const maxPanX = (rect.width * zoomLevel - rect.width) / 2;
      const maxPanY = (rect.height * zoomLevel - rect.height) / 2;
      
      const clampedX = Math.max(-maxPanX, Math.min(maxPanX, newPan.x));
      const clampedY = Math.max(-maxPanY, Math.min(maxPanY, newPan.y));

      setPan({ x: clampedX, y: clampedY });
  };

  const handlePanEnd = () => {
      setIsPanning(false);
  };

  // --- Event Handlers ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handlePanStart(e.clientX, e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
        handlePanMove(e.clientX, e.clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
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

  const cursorClass = isPanning ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-auto';

  return (
    <div 
        className={`w-full aspect-video bg-black overflow-hidden flex items-center justify-center touch-none ${cursorClass}`}
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
    </div>
  );
};

export default VideoPlayer;