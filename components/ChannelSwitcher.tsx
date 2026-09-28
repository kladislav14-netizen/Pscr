import React from 'react';
import { Radio, Tv, Users, Presentation, ShieldAlert } from 'lucide-react';
import { StreamItem } from '../types/player';

interface ChannelSwitcherProps {
  channels: StreamItem[];
  selectedChannelId: string;
  onSelectChannel: (channel: StreamItem) => void;
}

export const ChannelSwitcher: React.FC<ChannelSwitcherProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
}) => {
  const getChannelIcon = (id: string) => {
    switch (id) {
      case 'ps-stream1':
        return <Tv className="w-4 h-4" />;
      case 'ps-stream2':
        return <Radio className="w-4 h-4" />;
      case 'ps-stream3':
        return <Users className="w-4 h-4" />;
      case 'ps-stream4':
        return <Presentation className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Oficiální přenosové okruhy (5 kanálů ČRa)
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Klepnutím přepnete vysílací sál
        </span>
      </div>

      {/* Grid of channels on tablet/desktop, horizontal scroll on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {channels.map((ch, index) => {
          const isSelected = ch.id === selectedChannelId;
          return (
            <button
              key={ch.id}
              onClick={() => onSelectChannel(ch)}
              className={`group text-left p-3 rounded-2xl transition-all duration-150 flex flex-col justify-between border relative overflow-hidden active:scale-[0.98] ${
                isSelected
                  ? 'bg-gradient-to-b from-sky-950/90 to-slate-900 border-sky-400 text-white shadow-lg shadow-sky-950/60 ring-2 ring-sky-400/20'
                  : 'bg-[#111827] hover:bg-slate-800/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              {/* Active accent bar */}
              {isSelected && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-400"></div>
              )}

              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      0{index + 1}
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-200">
                      {getChannelIcon(ch.id)}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isSelected ? 'AKTIVNÍ' : 'ŽIVĚ'}
                  </span>
                </div>

                <div className="font-semibold text-xs md:text-sm text-slate-100 line-clamp-1 leading-snug">
                  {ch.shortTitle}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 truncate mt-1.5 font-normal">
                {ch.roomName}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ChannelSwitcher;
