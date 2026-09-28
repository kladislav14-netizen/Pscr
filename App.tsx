import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import VideoPlayer, { VideoPlayerRef } from './components/VideoPlayer';
import ZoomControls from './components/ZoomControls';
import ChannelSwitcher from './components/ChannelSwitcher';
import CustomStreamModal from './components/CustomStreamModal';
import ShortcutsModal from './components/ShortcutsModal';
import { OFFICIAL_STREAMS } from './data/parliamentData';
import { StreamItem } from '../types/player';
import { 
  Building2, 
  Share2, 
  ExternalLink, 
  Check, 
  FileText,
  FileSpreadsheet,
  Clock,
  Radio,
  Sparkles
} from 'lucide-react';

const MIN_ZOOM = 1.0;
const MAX_ZOOM = 8.0;
const ZOOM_STEP = 0.2;

export const App: React.FC = () => {
  // Current active live channel
  const [currentStream, setCurrentStream] = useState<StreamItem>(OFFICIAL_STREAMS[0]);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Layout & Display Modes
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Time tracking
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Share Notification Toast
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Modals
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  const playerRef = useRef<VideoPlayerRef>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoomLevel(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Number(newZoom.toFixed(2)))));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1.0);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      appContainerRef.current?.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleTimeUpdate = useCallback((time: number, dur: number) => {
    setCurrentTime(time);
    setDuration(dur);
  }, []);

  const handleSelectChannel = (channel: StreamItem) => {
    setCurrentStream(channel);
    setZoomLevel(1.0);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setShareToast('Odkaz na vysílání byl zkopírován do schránky.');
    setTimeout(() => setShareToast(null), 3000);
  };

  return (
    <div
      ref={appContainerRef}
      className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans broadcast-grid selection:bg-sky-500 selection:text-white"
    >
      {/* Station Header */}
      <Header
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
      />

      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{shareToast}</span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-5">
        {/* Prominent Channel Switcher (Streams 1 to 5) */}
        <ChannelSwitcher
          channels={OFFICIAL_STREAMS}
          selectedChannelId={currentStream.id}
          onSelectChannel={handleSelectChannel}
        />

        {/* Live Stream Hero Player */}
        <div className={`w-full transition-all duration-300 ${theaterMode ? 'max-w-none' : ''}`}>
          <VideoPlayer
            ref={playerRef}
            stream={currentStream}
            zoomLevel={zoomLevel}
            onZoomChange={handleZoomChange}
            onResetZoom={handleResetZoom}
            theaterMode={theaterMode}
            onToggleTheaterMode={() => setTheaterMode(!theaterMode)}
            onToggleFullscreen={handleToggleFullscreen}
            isFullscreen={isFullscreen}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>

        {/* Optical Zoom Control Center */}
        <ZoomControls
          zoomLevel={zoomLevel}
          onZoomChange={handleZoomChange}
          onResetZoom={handleResetZoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          step={ZOOM_STEP}
        />

        {/* Stream Details & Legislative Context Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  PŘÍMÝ PŘENOS
                </span>
                <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700/60">
                  {currentStream.roomName}
                </span>
              </div>
              <h1 className="text-base md:text-xl font-bold tracking-tight text-white">
                {currentStream.name}
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-colors"
                title="Sdílet odkaz na přenos"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Kopírovat odkaz</span>
              </button>

              <a
                href={currentStream.portalUrl || 'https://www.psp.cz'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-950/80 hover:bg-sky-900 text-sky-300 hover:text-white rounded-xl text-xs font-medium border border-sky-800 transition-colors"
              >
                <span>Oficiální portál</span>
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              </a>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-4xl">
            {currentStream.description}
          </p>

          {/* Parliamentary Resources (Stenoprotocols, Votes, Schedule) */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <a
              href="https://www.psp.cz/sqw/hp.sqw?k=203"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-100 group-hover:text-amber-300 truncate">
                  Týdenní harmonogram schůzí
                </div>
                <div className="text-[11px] text-slate-400">Přehled jednacích dnů na psp.cz</div>
              </div>
            </a>

            <a
              href="https://www.psp.cz/eknih/2025ps/stenprot/index.htm"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0 border border-sky-500/20">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-100 group-hover:text-sky-300 truncate">
                  Stenografické zápisy
                </div>
                <div className="text-[11px] text-slate-400">Doslovné přepisy vystoupení</div>
              </div>
            </a>

            <a
              href="https://www.psp.cz/sqw/hlasy.sqw"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-100 group-hover:text-emerald-300 truncate">
                  Výsledky hlasování
                </div>
                <div className="text-[11px] text-slate-400">Jmenné záznamy poslanců a klubů</div>
              </div>
            </a>
          </div>

          {/* Technical source footprint */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="truncate max-w-md" title={currentStream.url}>
              Zdroj: {currentStream.url}
            </span>
            <span className="text-slate-400">
              České Radiokomunikace a.s. • HLS (m3u8)
            </span>
          </div>
        </div>
      </main>

      {/* Custom Stream Input Modal */}
      <CustomStreamModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onPlayStream={handleSelectChannel}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
};

export default App;
