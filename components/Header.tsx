import React from 'react';
import { 
  Building2, 
  Plus, 
  Keyboard, 
  ExternalLink,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface HeaderProps {
  onOpenCustomModal: () => void;
  onOpenShortcutsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCustomModal,
  onOpenShortcutsModal,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Parliamentary Station Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-950/40">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base md:text-lg tracking-tight text-white font-sans">
                Poslanecká sněmovna <span className="text-sky-400 font-semibold">ČR</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ŽIVÉ VYSÍLÁNÍ</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">
              Parlament České republiky • Sněmovní 4, Praha
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-xs font-semibold text-sky-300 border border-sky-700/70 shadow-sm transition-all"
            title="Připojit vlastní adresu streamu"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Vlastní stream</span>
          </button>

          <button
            onClick={onOpenShortcutsModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Klávesové zkratky monitoru (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <a
            href="https://www.psp.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white border border-slate-800 transition-colors"
            title="Oficiální portál Poslanecké sněmovny"
          >
            <span>psp.cz</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </header>
  );
};
export default Header;
