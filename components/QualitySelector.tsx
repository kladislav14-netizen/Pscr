
import React from 'react';

// Define a type for HLS level
interface HlsLevel {
  height: number;
}

interface QualitySelectorProps {
  levels: HlsLevel[];
  currentLevel: number;
  onQualityChange: (levelIndex: number) => void;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({ levels, currentLevel, onQualityChange }) => {

  const getQualityLabel = (level: HlsLevel) => `${level.height}p`;

  return (
    <ul className="absolute bottom-full right-0 mb-2 w-32 bg-gray-700/90 border border-gray-600 rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in-up backdrop-blur-sm">
        <li>
        <button 
            onClick={() => onQualityChange(-1)} 
            className={`w-full text-left px-4 py-2 hover:bg-cyan-600 transition-colors font-semibold ${currentLevel === -1 ? 'bg-cyan-700' : ''}`}
            role="menuitem"
        >
            Auto
        </button>
        </li>
        {levels.map((level, index) => (
        <li key={`${level.height}-${index}`}>
            <button 
            onClick={() => onQualityChange(index)} 
            className={`w-full text-left px-4 py-2 hover:bg-cyan-600 transition-colors ${currentLevel === index ? 'bg-cyan-700' : ''}`}
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
