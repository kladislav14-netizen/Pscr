
import React from 'react';
import { QualityLevel } from './VideoPlayer';

interface QualitySelectorProps {
  levels: QualityLevel[];
  currentLevelIndex: number;
  onQualityChange: (levelIndex: number) => void;
}

const formatBitrate = (bitrate: number): string => {
  if (bitrate > 1000000) {
    return `${(bitrate / 1000000).toFixed(1)} Mbps`;
  }
  return `${Math.round(bitrate / 1000)} kbps`;
};

const QualitySelector: React.FC<QualitySelectorProps> = ({ levels, currentLevelIndex, onQualityChange }) => {

  const getQualityLabel = (level: QualityLevel) => `${level.height}p (${formatBitrate(level.bitrate)})`;

  return (
    <ul className="absolute bottom-full right-0 mb-2 w-40 bg-gray-700/90 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in-up backdrop-blur-sm">
        <li>
        <button 
            onClick={() => onQualityChange(-1)} 
            className={`w-full text-left px-4 py-2 hover:bg-cyan-600 transition-colors font-semibold ${currentLevelIndex === -1 ? 'bg-cyan-700' : ''}`}
            role="menuitem"
        >
            Auto
        </button>
        </li>
        {levels.map((level) => (
        <li key={level.index}>
            <button 
            onClick={() => onQualityChange(level.index)} 
            className={`w-full text-left px-4 py-2 hover:bg-cyan-600 transition-colors ${currentLevelIndex === level.index ? 'bg-cyan-700' : ''}`}
            role="menuitem"
            >
            {getQualityLabel(level)}
            </button>
        </li>
        ))}
    </ul>
  );
};

export default QualitySelector;
