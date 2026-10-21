import React from 'react';
import { X, Keyboard, Smartphone } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const keyboardShortcuts = [
    { key: 'Mezerník / K', desc: 'Spustit / Pozastavit přehrávání' },
    { key: 'F', desc: 'Režim celé obrazovky (Fullscreen)' },
    { key: 'T', desc: 'Rozšířené zobrazení monitoru (Širokoúhlé)' },
    { key: 'M', desc: 'Ztlumit / Zapnout zvuk' },
    { key: 'J / ←', desc: 'Posun o 10 sekund zpět' },
    { key: 'L / →', desc: 'Posun o 10 sekund vpřed' },
    { key: '↑ / ↓', desc: 'Hlasitost reprodukce (+ / - 5 %)' },
    { key: '+ nebo =', desc: 'Zvětšit optický výřez (Zoom In)' },
    { key: '-', desc: 'Zmenšit optický výřez (Zoom Out)' },
    { key: '0', desc: 'Resetovat výřez na celkový sál (1.0x)' },
    { key: 'S', desc: 'Uložit statický snímek obrazu (Screenshot)' },
    { key: 'Kolečko myši', desc: 'Plynulé přiblížení v místě kurzoru' },
    { key: 'Tažení myší', desc: 'Posun zvětšeného výřezu po sále (Pan)' },
  ];

  const touchGestures = [
    { key: '2 prsty (roztažení / sevření)', desc: 'Plynulý pinch-to-zoom (přiblížení a oddálení)' },
    { key: '1 prst (tažení)', desc: 'Posun přiblíženého záběru po sále' },
    { key: 'Dvojité klepnutí', desc: 'Rychlé přepnutí mezi celkovým záběrem (1x) a detailem (2.5x)' },
    { key: 'Klepnutí na radar', desc: 'Okamžité zaměření na zvolenou část sálu' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-white max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/80 text-sky-400 rounded-lg border border-sky-800/80">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ovládání a zkratky</h2>
              <p className="text-xs text-slate-400">Rychlá navigace na počítači i dotykovém displeji</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Touch Gestures Section */}
        <div>
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Dotyková gesta (mobil / tablet)</span>
          </h3>
          <div className="divide-y divide-slate-800/80 bg-slate-950/50 rounded-xl p-2.5 border border-slate-800">
            {touchGestures.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-slate-300">{s.desc}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-sky-300 font-semibold shadow-inner ml-2 text-right">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
            <span>Klávesové zkratky</span>
          </h3>
          <div className="divide-y divide-slate-800/80 bg-slate-950/50 rounded-xl p-2.5 border border-slate-800">
            {keyboardShortcuts.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-slate-300">{s.desc}</span>
                <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-[10px] text-sky-300 font-semibold shadow-inner ml-2">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Zavřít nápovědu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
