
import React from 'react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  minZoom: number;
  maxZoom: number;
  step: number;
  onRefresh: () => void;
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
    </svg>
);

const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 11.664 0l3.181-3.183m-4.991-2.695a2.25 2.25 0 0 0-2.25-2.25H10.5a2.25 2.25 0 0 0-2.25 2.25v.75" />
    </svg>
);

const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomChange, minZoom, maxZoom, step, onRefresh }) => {
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
      <button
        onClick={onRefresh}
        className="p-2 rounded-full bg-gray-700 text-white hover:bg-cyan-500 transition-colors"
        aria-label="Obnovit stream"
      >
        <RefreshIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ZoomControls;
