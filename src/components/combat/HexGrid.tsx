// src/components/combat/HexGrid.tsx
import React, { useState } from 'react';
import { HexCoord, TerrainType, generateHexGrid } from '../../utils/hexCalculations';
import HexTile from './HexTile';
import Unit from './Unit';
import { useGameState } from '../context';

interface Unit {
    id: string;
    coord: HexCoord;
    facing: number; // Angle in degrees
}

interface HexGridProps {
  radius?: number;
  hexSize?: number;
  terrain?: Record<string, TerrainType>;
  onTileClick?: (coord: HexCoord) => void;
}


const HexGrid: React.FC<HexGridProps> = ({
    radius = 4,
    hexSize = 40,
    terrain = {},
    onTileClick,
}) => {
    const [selectedTile, setSelectedTile] = useState<HexCoord | null>(null);
    const hexes = generateHexGrid(radius);

    // Calculate SVG viewport size
    const width = hexSize * Math.sqrt(3) * (2 * radius + 1);
    const height = hexSize * 3/2 * (2 * radius + 1);
    
    // Center the grid in the viewport
    const centerX = width / 2;
    const centerY = height / 2;

    const handleTileClick = (coord: HexCoord) => {
        setSelectedTile(coord);
        onTileClick?.(coord);
    };

    const margin = hexSize;
    const svgWidth = width + 2 * margin;
    const svgHeight = height + 2 * margin;

    const { state, dispatch } = useGameState();

    return (
        <div className="overflow-auto max-w-full max-h-[80vh] border rounded">
            <div className="overflow-auto" style={{ cursor: 'grab' }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    style={{ display: 'block', margin: 'auto' }}
                >
                    <g transform={`translate(${svgWidth/2},${svgHeight/2})`}>
                        {hexes.map((coord) => {
                            const key = `${coord.q},${coord.r}`;
                            const isSelected = selectedTile?.q === coord.q && selectedTile?.r === coord.r;
                            
                            return (
                                <HexTile
                                    key={key}
                                    coord={coord}
                                    size={hexSize}
                                    terrain={terrain[key] || 'blank'}
                                    isSelected={isSelected}
                                    onClick={() => handleTileClick(coord)}
                                />
                            );
                        })}
                        {state.units
                            .filter(unit => unit.position)
                            .map(unit => (
                                <Unit
                                    key={unit.id}
                                    unit={unit} // Pass the full unit object
                                    hexSize={hexSize}
                                />
                            ))}
                    </g>
                </svg>
            </div>
        </div>
    );
};

export default HexGrid;