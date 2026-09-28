import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sliders, 
  Gauge, 
  Volume2, 
  Activity 
} from 'lucide-react';
import { QualityLevel } from '../types/player';

interface SettingsMenuProps {
  qualityLevels: QualityLevel[];
  selectedQualityIndex: number;
  onQualityChange: (index: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  audioBoost: number;
  onAudioBoostChange: (boost: number) => void;
  showStats: boolean;
  onToggleStats: () => void;
  onClose: () => void;
}

type SubmenuView = 'main' | 'quality' | 'speed' | 'boost';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const BOOST_OPTIONS = [
  { label: '100% (Standardní úroveň)', value: 1.0 },
  { label: '125% (+25% srozumitelnost)', value: 1.25 },
  { label: '150% (+50% tiché mikrofony)', value: 1.5 },
  { label: '175% (+75% vysoké zesílení)', value: 1.75 },
  { label: '200% (Maximální zesílení)', value: 2.0 },
];

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  qualityLevels,
  selectedQualityIndex,
  onQualityChange,
  playbackRate,
  onPlaybackRateChange,
  audioBoost,
  onAudioBoostChange,
  showStats,
  onToggleStats,
  onClose,
}) => {
  const [currentView, setCurrentView] = useState<SubmenuView>('main');

  const getQualityText = () => {
    if (selectedQualityIndex === -1) return 'Automaticky';
    const found = qualityLevels.find((l) => l.index === selectedQualityIndex);
    return found ? `${found.height}p` : 'Automaticky';
  };

  return (
    <div 
      className="absolute bottom-16 right-4 z-40 w-72 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2.5 text-white select-none animate-in fade-in duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {currentView === 'main' && (
        <div className="space-y-0.5 text-xs">
          <div className="px-2.5 py-1.5 font-bold text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            Nastavení přenosu a audia
          </div>

          {/* Quality option */}
          <button
            onClick={() => setCurrentView('quality')}
            className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Rozlišení obrazu</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <span>{getQualityText()}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Speed option */}
          <button
            onClick={() => setCurrentView('speed')}
            className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-slate-200">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              <span>Rychlost reprodukce</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <span>{playbackRate === 1 ? '1.0x' : `${playbackRate}x`}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Audio boost option */}
          <button
            onClick={() => setCurrentView('boost')}
            className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-slate-200">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Zesilovač řeči</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
              <span>{Math.round(audioBoost * 100)}%</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>

          {/* Technical Diagnostics */}
          <button
            onClick={onToggleStats}
            className="flex items-center justify-between w-full px-2.5 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-slate-200">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Diagnostika přenosu</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${showStats ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800'}`}>
              {showStats ? 'Aktivní' : 'Skryto'}
            </span>
          </button>
        </div>
      )}

      {/* Quality Submenu */}
      {currentView === 'quality' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('main')}
              className="p-1 -ml-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>Dostupná rozlišení</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 text-xs py-1">
            <button
              onClick={() => {
                onQualityChange(-1);
                setCurrentView('main');
              }}
              className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                selectedQualityIndex === -1 ? 'bg-sky-950/80 text-sky-400 font-semibold border border-sky-800' : 'hover:bg-slate-800 text-slate-200'
              }`}
            >
              <span>Automaticky (Doporučeno)</span>
              {selectedQualityIndex === -1 && <Check className="w-3.5 h-3.5" />}
            </button>

            {qualityLevels.map((lvl) => (
              <button
                key={lvl.index}
                onClick={() => {
                  onQualityChange(lvl.index);
                  setCurrentView('main');
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                  selectedQualityIndex === lvl.index ? 'bg-sky-950/80 text-sky-400 font-semibold border border-sky-800' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <span>{lvl.height}p</span>
                {selectedQualityIndex === lvl.index && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Speed Submenu */}
      {currentView === 'speed' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('main')}
              className="p-1 -ml-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>Rychlost přehrávání</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-0.5 text-xs py-1">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onPlaybackRateChange(speed);
                  setCurrentView('main');
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                  playbackRate === speed ? 'bg-sky-950/80 text-sky-400 font-semibold border border-sky-800' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <span>{speed === 1 ? 'Normální (1.0x)' : `${speed}x`}</span>
                {playbackRate === speed && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Boost Submenu */}
      {currentView === 'boost' && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setCurrentView('main')}
              className="p-1 -ml-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>Zesílení mikrofonů sálu</span>
          </div>

          <div className="p-2 text-[11px] text-slate-400 border-b border-slate-800">
            Zvyšuje zisk řečnického pultu pro lepší srozumitelnost.
          </div>

          <div className="space-y-0.5 text-xs py-1">
            {BOOST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onAudioBoostChange(opt.value);
                  setCurrentView('main');
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                  Math.abs(audioBoost - opt.value) < 0.05
                    ? 'bg-amber-950/80 text-amber-400 font-semibold border border-amber-800'
                    : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <span>{opt.label}</span>
                {Math.abs(audioBoost - opt.value) < 0.05 && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsMenu;
