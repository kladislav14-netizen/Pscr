
import React from 'react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  minZoom: number;
  maxZoom: number;
  step: number;
}

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

const ResetIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m-6 6L3.75 20.25m0 0v-4.5m0 4.5h4.5m6.75 0l5.25-5.25m0 0h-4.5m4.5 0v-4.5" />
    </svg>
);

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomChange, minZoom, maxZoom, step }) => {
  const handleZoomIn = () => onZoomChange(zoomLevel + step);
  const handleZoomOut = () => onZoomChange(zoomLevel - step);
  const handleResetZoom = () => onZoomChange(1);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex items-center justify-center gap-2 md:gap-4">
      <button
        onClick={handleZoomOut}
        disabled={zoomLevel <= minZoom}
        className="p-2 rounded-full bg-gray-700 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Oddálit"
      >
        <MinusIcon className="w-6 h-6" />
      </button>

      <div className="flex-grow flex items-center gap-3 max-w-xs">
        <input
          type="range"
          min={minZoom}
          max={maxZoom}
          step={step}
          value={zoomLevel}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          aria-label="Posuvník přiblížení"
        />
        <span className="font-mono text-lg text-cyan-300 w-16 text-center">{zoomLevel.toFixed(1)}x</span>
      </div>

      <button
        onClick={handleZoomIn}
        disabled={zoomLevel >= maxZoom}
        className="p-2 rounded-full bg-gray-700 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Přiblížit"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
       <button
        onClick={handleResetZoom}
        disabled={zoomLevel === 1}
        className="p-2 rounded-full bg-gray-700 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Resetovat přiblížení"
      >
        <ResetIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ZoomControls;
