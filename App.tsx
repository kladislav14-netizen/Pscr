
import React, { useState, useCallback, useRef } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ZoomControls from './components/ZoomControls';

const STREAM_URL = "https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream1/playlist/cze.m3u8";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

const App: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const videoPlayerContainerRef = useRef<HTMLDivElement>(null);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!videoPlayerContainerRef.current) return;

    if (!document.fullscreenElement) {
      videoPlayerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">Live Stream Player</h1>
          <p className="text-gray-400 mt-2">Parlament České republiky - Live</p>
        </header>
        
        <main className="bg-black rounded-lg shadow-2xl shadow-cyan-500/10 overflow-hidden">
          <VideoPlayer 
            ref={videoPlayerContainerRef}
            src={STREAM_URL} 
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            refreshKey={refreshKey}
          />
        </main>

        <footer className="w-full flex items-center justify-center">
          <ZoomControls 
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            step={ZOOM_STEP}
            onRefresh={handleRefresh}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </footer>
      </div>
    </div>
  );
};

export default App;
