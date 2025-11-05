import React, { useState, useRef, useEffect } from 'react';

// Define a type for HLS level
interface HlsLevel {
  height: number;
}

interface QualitySelectorProps {
  levels: HlsLevel[];
  currentLevel: number;
  onQualityChange: (levelIndex: number) => void;
}

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);


const QualitySelector: React.FC<QualitySelectorProps> = ({ levels, currentLevel, onQualityChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleQualitySelect = (levelIndex: number) => {
    onQualityChange(levelIndex);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getQualityLabel = (level: HlsLevel) => {
    if (level.height === 0) return '144p';
    return `${level.height}p`;
  };

  const currentQualityLabel = currentLevel === -1 
    ? 'Auto' 
    : levels[currentLevel] 
      ? getQualityLabel(levels[currentLevel])
      : '...';

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={levels.length === 0}
        className="w-32 h-12 bg-gray-800 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-4 shadow-lg"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current quality: ${currentQualityLabel}. Change quality.`}
      >
        <span>{currentQualityLabel}</span>
        <ChevronUpIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
      </button>
      {isOpen && (
        <ul className="absolute bottom-full mb-2 w-32 bg-gray-700 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in-up">
          <li>
            <button 
                onClick={() => handleQualitySelect(-1)} 
                className="w-full text-left px-4 py-2 hover:bg-cyan-600 transition-colors font-semibold"
                role="menuitem"
            >
                Auto
            </button>
          </li>
          {levels.map((level, index) => (
            <li key={index}>
              <button 
                onClick={() => handleQualitySelect(index)} 
                className="w-full text-left px-4 py-2 hover:bg-cyan-600 transition-colors"
                role="menuitem"
              >
                {getQualityLabel(level)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QualitySelector;