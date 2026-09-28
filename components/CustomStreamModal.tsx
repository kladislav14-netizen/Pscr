import React, { useState } from 'react';
import { X, Play, Link, AlertCircle, Radio } from 'lucide-react';
import { StreamItem } from '../types/player';

interface CustomStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayStream: (stream: StreamItem) => void;
}

export const CustomStreamModal: React.FC<CustomStreamModalProps> = ({
  isOpen,
  onClose,
  onPlayStream,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickSamples = [
    {
      label: 'Stream 1 (Schůze PS)',
      url: 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream1/playlist/cze.m3u8',
    },
    {
      label: 'Stream 2 (Tiskové konference)',
      url: 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream2/playlist/cze.m3u8',
    },
    {
      label: 'Stream 3 (Výbory 1)',
      url: 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream3/playlist/cze.m3u8',
    },
    {
      label: 'Stream 4 (Výbory 2)',
      url: 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream4/playlist/cze.m3u8',
    },
    {
      label: 'Záznam PSP (Atrium)',
      url: 'https://videoarchiv.psp.cz/vuploads/5612_video-psp-2026925-90-13-Atrium.mp4.mp4',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = url.trim();

    if (!cleaned) {
      setError('Zadejte prosím adresu streamu (URL).');
      return;
    }

    // Auto-fix truncated URLs like "http://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream1/pl"
    if (cleaned.includes('channels/ps-stream1/pl') && !cleaned.endsWith('.m3u8')) {
      cleaned = 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream1/playlist/cze.m3u8';
    } else if (cleaned.includes('channels/ps-stream2/pl') && !cleaned.endsWith('.m3u8')) {
      cleaned = 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream2/playlist/cze.m3u8';
    } else if (cleaned.includes('channels/ps-stream3/pl') && !cleaned.endsWith('.m3u8')) {
      cleaned = 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream3/playlist/cze.m3u8';
    } else if (cleaned.includes('channels/ps-stream4/pl') && !cleaned.endsWith('.m3u8')) {
      cleaned = 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream4/playlist/cze.m3u8';
    } else if (cleaned.includes('channels/ps-stream5/pl') && !cleaned.endsWith('.m3u8')) {
      cleaned = 'https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream5/playlist/cze.m3u8';
    }

    if (cleaned.startsWith('http://pspcr-ott-live.ssl.cdn.cra.cz')) {
      cleaned = cleaned.replace('http://', 'https://');
    }

    const isHls = cleaned.includes('.m3u8');
    const customItem: StreamItem = {
      id: `custom-${Date.now()}`,
      name: title.trim() || (isHls ? 'Vlastní HLS stream' : 'Vlastní video stream'),
      shortTitle: title.trim() || 'Vlastní proud',
      category: 'custom',
      categoryLabel: 'Vlastní zdroj',
      url: cleaned,
      isLive: isHls,
      roomName: 'Uživatelský zdroj',
      description: `Uživatelem zadaná adresa proudu: ${cleaned}`,
    };

    onPlayStream(customItem);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-950/80 text-sky-400 rounded-lg border border-sky-800/80">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Připojit externí stream</h2>
              <p className="text-xs text-slate-400">Podporuje protokoly HLS (.m3u8) i přímé soubory MP4</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              URL adresa streamu
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://pspcr-ott-live.ssl.cdn.cra.cz/channels/ps-stream1/playlist/cze.m3u8"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              autoFocus
            />
            {error && (
              <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vlastní popis / označení (volitelné)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Např. 33. schůze PS ČR – odpolední blok"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 mb-1.5">
              Rychlé předvolby kanálů ČRa:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSamples.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setUrl(sample.url);
                    setTitle(sample.label);
                    setError(null);
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-md text-xs text-slate-300 hover:text-white transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-600/25 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Připojit kanál</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default CustomStreamModal;
