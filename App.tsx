
import React, { useState, useCallback } from 'react';
import VideoPlayer from './components/VideoPlayer';
import ZoomControls from './components/ZoomControls';
import QualitySelector from './components/QualitySelector';

const STREAM_URL = "https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream1/playlist/cze.m3u8";

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const ZOOM_STEP = 0.1;

// Define a type for HLS quality levels for better type safety
interface HlsLevel {
  height: number;
  // HLS.js provides more properties, but height is sufficient for our UI
}

const App: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [qualityLevels, setQualityLevels] = useState<HlsLevel[]>([]);
  const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(-1); // -1 for Auto

  const handleZoomChange = useCallback((newZoom: number) => {
    // Clamp the zoom level between min and max values
    setZoomLevel(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  }, []);

  const handleRefresh = useCallback(() => {
    // Incrementing the key will trigger a re-mount of the VideoPlayer's effect
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleLevelsAvailable = useCallback((levels: HlsLevel[]) => {
    setQualityLevels(levels);
  }, []);

  const handleQualityChange = useCallback((levelIndex: number) => {
    setCurrentQualityLevel(levelIndex);
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
            src={STREAM_URL} 
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            refreshKey={refreshKey}
            onLevelsAvailable={handleLevelsAvailable}
            currentQualityLevel={currentQualityLevel}
          />
        </main>

        <footer className="w-full flex flex-col lg:flex-row items-center justify-center gap-4">
          <ZoomControls 
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            step={ZOOM_STEP}
            onRefresh={handleRefresh}
          />
          <QualitySelector
            levels={qualityLevels}
            currentLevel={currentQualityLevel}
            onQualityChange={handleQualityChange}
          />
        </footer>
      </div>
    </div>
  );
};

export default App;
