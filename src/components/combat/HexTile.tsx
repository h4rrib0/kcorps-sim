// src/components/combat/HexTile.tsx
import React from 'react';
import { TerrainType, HexCoord, hexToPixel, hexagonPoints } from '../../utils/hexCalculations';

interface HexTileProps {
  coord: HexCoord;
  size: number;
  terrain: TerrainType;
  isHighlighted?: boolean;
  isSelected?: boolean;
  isAttackable?: boolean;
  isTargetable?: boolean;
  isAttackerTile?: boolean;
  isValidPlacement?: boolean;
  onClick?: () => void;
  debugOpacity?: number; // Added for adjustable debug text opacity
  editorMode?: boolean; // Whether in map editor mode
}

const terrainColors = {
  blank: '#f0f0f0',
  locale: '#c8e6c9',
  mountain: '#a1887f',
  water: '#bbdefb',
  forest: '#66bb6a', // Dark green for forests
  desert: '#ffe082', // Sand color for desert
  swamp: '#8d6e63', // Brown for swamp
};

const HexTile: React.FC<HexTileProps> = ({
  coord,
  size,
  terrain,
  isHighlighted = false,
  isSelected = false,
  isAttackable = false,
  isTargetable = false,
  isAttackerTile = false,
  isValidPlacement = false,
  onClick,
  debugOpacity = 0.5, // default opacity
  editorMode = false,
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
        fill={
          isAttackerTile ? '#bbffd0' : 
          isAttackable ? '#ffcccc' : 
          isTargetable ? '#e1bee7' : // Light purple for special move targeting
          terrainColors[terrain]
        }
        fillOpacity={isAttackable || isTargetable || isAttackerTile ? 0.7 : debugOpacity}
        stroke={
          isSelected ? '#2196f3' : 
          isHighlighted ? '#4caf50' : 
          isAttackable && !isAttackerTile ? '#ff6b6b' :
          isTargetable && !isAttackerTile ? '#9c27b0' : // Purple stroke for special move
          '#ccc'
        }
        strokeWidth={isSelected || isHighlighted || isAttackable || isTargetable ? 2 : 1}
      />
      
      {/* Attack indicator pattern */}
      {isAttackable && !isAttackerTile && (
        <path
          d="M-8,-8 L8,8 M-8,8 L8,-8"
          stroke="#ff6b6b"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
      )}
      
      {/* Special move indicator pattern */}
      {isTargetable && !isAttackerTile && (
        <path
          d="M0,-10 L0,10 M-10,0 L10,0"
          stroke="#9c27b0"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />
      )}
      
      {/* Placement indicator removed */}
      
      {/* Terrain markers */}
      {/* Terrain indicators */}
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
      {terrain === 'forest' && (
        <g transform="translate(0,-2) scale(0.4)">
          <path d="M0,-15 L10,0 L5,0 L12,10 L-12,10 L-5,0 L-10,0 Z" fill="#2e7d32" />
          <rect x="-2" y="10" width="4" height="5" fill="#5d4037" />
        </g>
      )}
      {terrain === 'desert' && (
        <g transform="translate(0,0) scale(0.5)">
          <circle cx="-5" cy="5" r="3" fill="#ffd54f" />
          <circle cx="5" cy="-3" r="2" fill="#ffd54f" />
          <circle cx="6" cy="6" r="2" fill="#ffd54f" />
          <circle cx="-7" cy="-5" r="2" fill="#ffd54f" />
        </g>
      )}
      {terrain === 'swamp' && (
        <g transform="translate(0,0) scale(0.4)">
          <path d="M-10,5 Q-5,-2 0,5 T10,5" stroke="#6d4c41" fill="none" strokeWidth="2" />
          <path d="M-8,0 Q-3,-7 2,0 T12,0" stroke="#6d4c41" fill="none" strokeWidth="2" />
        </g>
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