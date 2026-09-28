import React, { useRef, useCallback } from 'react';
import { RotateCcw, Crosshair } from 'lucide-react';
import { PanOffset } from '../types/player';

interface ZoomRadarProps {
  zoomLevel: number;
  pan: PanOffset;
  onPanChange: (newPan: PanOffset) => void;
  onResetZoom: () => void;
}

export const ZoomRadar: React.FC<ZoomRadarProps> = ({
  zoomLevel,
  pan,
  onPanChange,
  onResetZoom,
}) => {
  const radarRef = useRef<HTMLDivElement>(null);

  const RADAR_WIDTH = 124;
  const RADAR_HEIGHT = 70;

  const viewWidth = RADAR_WIDTH / zoomLevel;
  const viewHeight = RADAR_HEIGHT / zoomLevel;

  const centerRadarX = RADAR_WIDTH / 2;
  const centerRadarY = RADAR_HEIGHT / 2;

  const viewX = Math.max(0, Math.min(RADAR_WIDTH - viewWidth, centerRadarX - (viewWidth / 2) - (pan.x * (RADAR_WIDTH / 800))));
  const viewY = Math.max(0, Math.min(RADAR_HEIGHT - viewHeight, centerRadarY - (viewHeight / 2) - (pan.y * (RADAR_HEIGHT / 450))));

  const handleRadarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const deltaX = (RADAR_WIDTH / 2 - clickX) * (800 / RADAR_WIDTH);
    const deltaY = (RADAR_HEIGHT / 2 - clickY) * (450 / RADAR_HEIGHT);

    onPanChange({ x: deltaX, y: deltaY });
  }, [onPanChange]);

  if (zoomLevel <= 1.05) return null;

  return (
    <div 
      className="absolute top-3 left-3 z-20 flex flex-col items-start gap-1 p-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl transition-all"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between w-full px-0.5 text-[11px] text-slate-300 font-mono">
        <span className="text-sky-400 font-bold flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-sky-400" />
          <span>{zoomLevel.toFixed(1)}x Výřez</span>
        </span>
        <button
          onClick={onResetZoom}
          title="Obnovit celkový záběr (1.0x)"
          className="hover:text-white text-slate-400 p-0.5 rounded transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      <div
        ref={radarRef}
        onClick={handleRadarClick}
        style={{ width: `${RADAR_WIDTH}px`, height: `${RADAR_HEIGHT}px` }}
        className="relative bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden cursor-crosshair group shadow-inner"
        title="Kliknutím na mapu přesunete výřez záběru"
      >
        {/* Optical alignment grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-15 pointer-events-none">
          <div className="border-r border-b border-sky-400"></div>
          <div className="border-b border-sky-400"></div>
          <div className="border-r border-sky-400"></div>
          <div></div>
        </div>

        {/* Viewport rectangle */}
        <div
          style={{
            width: `${viewWidth}px`,
            height: `${viewHeight}px`,
            left: `${viewX}px`,
            top: `${viewY}px`,
          }}
          className="absolute border-2 border-sky-400 bg-sky-500/25 rounded-sm pointer-events-none transition-all duration-75"
        />
      </div>

      <span className="text-[9px] text-slate-400 px-0.5">Klikněte pro zaměření</span>
    </div>
  );
};
export default ZoomRadar;
