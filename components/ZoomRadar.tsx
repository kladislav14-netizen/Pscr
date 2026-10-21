import React, { useRef, useState } from 'react';
import { RotateCcw, Crosshair } from 'lucide-react';
import { PanOffset } from '../types/player';

interface ZoomRadarProps {
  zoomLevel: number;
  pan: PanOffset;
  maxPan: PanOffset;
  onPanChange: (newPan: PanOffset) => void;
  onResetZoom: () => void;
}

export const ZoomRadar: React.FC<ZoomRadarProps> = ({
  zoomLevel,
  pan,
  maxPan,
  onPanChange,
  onResetZoom,
}) => {
  const radarRef = useRef<HTMLDivElement>(null);
  const [isDraggingRadar, setIsDraggingRadar] = useState(false);

  const RADAR_WIDTH = 136;
  const RADAR_HEIGHT = 76;

  if (zoomLevel <= 1.05) return null;

  const viewWidth = Math.max(14, RADAR_WIDTH / zoomLevel);
  const viewHeight = Math.max(9, RADAR_HEIGHT / zoomLevel);

  const maxRadarShiftX = (RADAR_WIDTH - viewWidth) / 2;
  const maxRadarShiftY = (RADAR_HEIGHT - viewHeight) / 2;

  const fractionX = maxPan.x > 0 ? Math.max(-1, Math.min(1, pan.x / maxPan.x)) : 0;
  const fractionY = maxPan.y > 0 ? Math.max(-1, Math.min(1, pan.y / maxPan.y)) : 0;

  // When pan.x > 0 (video moved right), the viewport window looks at the left of the frame
  const viewX = Math.max(0, Math.min(RADAR_WIDTH - viewWidth, (RADAR_WIDTH - viewWidth) / 2 - fractionX * maxRadarShiftX));
  const viewY = Math.max(0, Math.min(RADAR_HEIGHT - viewHeight, (RADAR_HEIGHT - viewHeight) / 2 - fractionY * maxRadarShiftY));

  const handlePointerAt = (clientX: number, clientY: number) => {
    if (!radarRef.current) return;
    const rect = radarRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const clampedClickX = Math.max(viewWidth / 2, Math.min(RADAR_WIDTH - viewWidth / 2, clickX));
    const clampedClickY = Math.max(viewHeight / 2, Math.min(RADAR_HEIGHT - viewHeight / 2, clickY));

    const targetFractionX = maxRadarShiftX > 0 ? (clampedClickX - RADAR_WIDTH / 2) / maxRadarShiftX : 0;
    const targetFractionY = maxRadarShiftY > 0 ? (clampedClickY - RADAR_HEIGHT / 2) / maxRadarShiftY : 0;

    const clampedTargetFractionX = Math.max(-1, Math.min(1, targetFractionX));
    const clampedTargetFractionY = Math.max(-1, Math.min(1, targetFractionY));

    const newPanX = -clampedTargetFractionX * maxPan.x;
    const newPanY = -clampedTargetFractionY * maxPan.y;

    onPanChange({ x: newPanX, y: newPanY });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingRadar(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    handlePointerAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRadar) return;
    e.stopPropagation();
    e.preventDefault();
    handlePointerAt(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRadar) {
      e.stopPropagation();
      setIsDraggingRadar(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {
        // Pointer capture safety
      }
    }
  };

  return (
    <div 
      className="absolute top-3 left-3 z-30 flex flex-col items-start gap-1 p-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl transition-all select-none touch-none"
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
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ width: `${RADAR_WIDTH}px`, height: `${RADAR_HEIGHT}px` }}
        className={`relative bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden group shadow-inner ${
          isDraggingRadar ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        title="Kliknutím nebo tažením po miniatuře přesunete výřez záběru"
      >
        {/* Optical alignment grid */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-20 pointer-events-none">
          <div className="border-r border-b border-sky-400"></div>
          <div className="border-b border-sky-400"></div>
          <div className="border-r border-sky-400"></div>
          <div></div>
        </div>

        {/* Viewport rectangle indicator */}
        <div
          style={{
            width: `${viewWidth}px`,
            height: `${viewHeight}px`,
            left: `${viewX}px`,
            top: `${viewY}px`,
          }}
          className="absolute border-2 border-sky-400 bg-sky-500/30 rounded-sm pointer-events-none shadow-sm transition-transform duration-75"
        />
      </div>

      <span className="text-[9px] text-slate-400 px-0.5 font-sans">
        Klikněte / táhněte pro zaměření
      </span>
    </div>
  );
};

export default ZoomRadar;
