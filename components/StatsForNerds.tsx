import React from 'react';
import { X, Activity, Server, Cpu } from 'lucide-react';
import { PlayerStats } from '../types/player';

interface StatsForNerdsProps {
  stats: PlayerStats;
  streamName: string;
  onClose: () => void;
}

export const StatsForNerds: React.FC<StatsForNerdsProps> = ({ stats, streamName, onClose }) => {
  return (
    <div 
      className="absolute top-4 right-4 z-30 w-84 max-w-[calc(100%-2rem)] bg-slate-950/90 backdrop-blur-md text-slate-100 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl font-mono text-xs select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-slate-100">
          <Activity className="w-4 h-4 text-sky-400" />
          <span className="text-[11px] tracking-wide uppercase">Diagnostika přenosu</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          title="Zavřít panel diagnostiky"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 text-slate-300 text-[11px]">
        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Vysílací kanál:</span>
          <span className="text-white truncate max-w-[170px]" title={streamName}>{streamName}</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Rozlišení a snímkování:</span>
          <span className="text-emerald-400 font-semibold">{stats.resolution} @ {stats.fps} fps</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Kódování videa:</span>
          <span className="text-slate-200">{stats.codec}</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Aktuální datový tok:</span>
          <span className="text-sky-300 font-semibold">{stats.currentBitrate}</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Zásobník přehrávače:</span>
          <span className="text-slate-200">{stats.bufferLength.toFixed(1)} s</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Faktor přiblížení (Zoom):</span>
          <span className="text-sky-400 font-semibold">{stats.zoomLevel.toFixed(2)}x</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Souřadnice výřezu (Pan):</span>
          <span className="text-slate-200">X: {Math.round(stats.panX)}px, Y: {Math.round(stats.panY)}px</span>
        </div>

        <div className="flex justify-between items-center py-0.5 border-b border-slate-900">
          <span className="text-slate-400">Zesílení zvuku:</span>
          <span className="text-amber-400 font-semibold">{Math.round(stats.audioBoost * 100)}%</span>
        </div>

        {stats.latencyToLive !== null && (
          <div className="flex justify-between items-center pt-0.5">
            <span className="text-slate-400">Zpoždění od živého bodu:</span>
            <span className="text-slate-200 font-semibold">{stats.latencyToLive.toFixed(1)} s</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default StatsForNerds;
