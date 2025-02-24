// src/components/combat/HexTile.tsx
import React from 'react';
import { TerrainType, HexCoord, hexToPixel, hexagonPoints } from '../../utils/hexCalculations';

interface HexTileProps {
  coord: HexCoord;
  size: number;
  terrain: TerrainType;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  debugOpacity?: number; // Added for adjustable debug text opacity
}

const terrainColors = {
  blank: '#f0f0f0',
  locale: '#c8e6c9',
  mountain: '#a1887f',
  water: '#bbdefb',
};

const HexTile: React.FC<HexTileProps> = ({
  coord,
  size,
  terrain,
  isHighlighted = false,
  isSelected = false,
  onClick,
  debugOpacity = 0.5, // default opacity
}) => {
  const { x, y } = hexToPixel(coord, size);
  const points = hexagonPoints(size);

  return (
    <g
      transform={`translate(${x},${y})`}
      onClick={onClick}
      className="cursor-pointer"
    >
      {/* Base hex */}
      <polygon
        points={points}
        fill={terrainColors[terrain]}
        fillOpacity={debugOpacity} // Apply debug opacity to the fill
        stroke={isSelected ? '#2196f3' : isHighlighted ? '#4caf50' : '#ccc'}
        strokeWidth={isSelected || isHighlighted ? 2 : 1}
      />
      
      {/* Terrain markers */}
      {terrain === 'mountain' && (
        <path
          d="M0,-10 L10,10 L-10,10 Z"
          fill="#795548"
          transform="translate(0,0) scale(0.5)"
        />
      )}
      {terrain === 'locale' && (
        <circle
          cx="0"
          cy="0"
          r={size / 4}
          fill="#4caf50"
        />
      )}
      {terrain === 'water' && (
        <path
          d="M-10,0 Q-5,5 0,0 T10,0"
          stroke="#2196f3"
          fill="none"
          strokeWidth="2"
          transform="translate(0,5)"
        />
      )}

      {/* Debug coordinates */}
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontSize="10"
        fill="#666"
        opacity={debugOpacity}
        className="select-none"
      >
        {`${coord.q},${coord.r}`}
      </text>
    </g>
  );
};

export default HexTile;