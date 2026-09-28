import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Target, Eye } from 'lucide-react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (newZoom: number) => void;
  onResetZoom: () => void;
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  className?: string;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomChange,
  onResetZoom,
  minZoom = 1.0,
  maxZoom = 8.0,
  step = 0.2,
  className = '',
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(maxZoom, Number((zoomLevel + step).toFixed(2))));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(minZoom, Number((zoomLevel - step).toFixed(2))));
  };

  const presets = [
    { label: '1.0x', desc: 'Celý sál', zoom: 1.0 },
    { label: '2.0x', desc: 'Řečniště', zoom: 2.0 },
    { label: '3.5x', desc: 'Předseda', zoom: 3.5 },
    { label: '5.0x', desc: 'Detail', zoom: 5.0 },
  ];

  return (
    <div className={`bg-[#111827] border border-slate-800 rounded-2xl p-3.5 shadow-xl ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Left: Continuous zoom slider & stepper */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider min-w-[70px]">
            <Target className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Zoom</span>
          </div>

          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= minZoom}
            className="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/80 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Oddálit (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="relative flex-1 md:w-44 flex items-center">
            <input
              type="range"
              min={minZoom}
              max={maxZoom}
              step={step}
              value={zoomLevel}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
              title="Posuvník optického přiblížení"
            />
          </div>

          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= maxZoom}
            className="w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/80 flex items-center justify-center transition-all active:scale-95 shadow-sm"
            title="Přiblížit (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Current Zoom Readout Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-500/40 text-sky-300 font-mono text-xs font-bold min-w-[50px] text-center shadow-inner">
            {zoomLevel.toFixed(1)}x
          </div>
        </div>

        {/* Right: Quick focal presets */}
        <div className="flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
          <div className="flex items-center gap-1.5 flex-1 md:flex-initial">
            {presets.map((p) => {
              const isActive = Math.abs(zoomLevel - p.zoom) < 0.2;
              return (
                <button
                  key={p.label}
                  onClick={() => onZoomChange(p.zoom)}
                  className={`flex-1 md:flex-initial px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                    isActive
                      ? 'bg-sky-500 text-white font-bold border-sky-400 shadow-md shadow-sky-500/25'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60 hover:text-white'
                  }`}
                  title={`Nastavit přiblížení na ${p.desc}`}
                >
                  <span className="font-mono">{p.label}</span>
                  <span className="hidden sm:inline text-[11px] text-slate-300 font-normal ml-1">
                    {p.desc}
                  </span>
                </button>
              );
            })}

            <button
              onClick={onResetZoom}
              disabled={zoomLevel <= 1.02}
              title="Obnovit výchozí zobrazení (1.0x)"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700/60 transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs hidden sm:inline">Reset</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 pl-3 border-l border-slate-800">
            <Move className="w-3.5 h-3.5 text-sky-400" />
            <span>Tažením myši posouváte výřez</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ZoomControls;
