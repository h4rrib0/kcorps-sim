// src/components/combat/HexGrid.tsx
import React, { useState, useEffect, useRef } from 'react';
import { HexCoord, TerrainType, generateHexGrid } from '../../utils/hexCalculations';
import HexTile from './HexTile';
import Unit from './Unit';
import { useGameState } from '../context';
import { Unit as UnitType } from '../types';

interface HexGridProps {
  radius?: number;
  hexSize?: number;
  terrain?: Record<string, TerrainType>;
  onTileClick?: (coord: HexCoord) => void;
  useSelectedMap?: boolean; // Whether to use the selected map from state
}


const HexGrid: React.FC<HexGridProps> = ({
    radius = 4,
    hexSize: defaultHexSize = 40,
    terrain = {},
    onTileClick,
    useSelectedMap = true,
}) => {
    const [selectedTile, setSelectedTile] = useState<HexCoord | null>(null);
    const [hexSize, setHexSize] = useState(defaultHexSize);
    const { state, dispatch } = useGameState();
    
    // Get the selected map from state
    const selectedMap = useSelectedMap && state.selectedMapId 
        ? state.maps.find(map => map.id === state.selectedMapId)
        : null;
    
    // Use the selected map's radius and terrain if available
    const effectiveRadius = selectedMap ? selectedMap.radius : radius;
    const effectiveTerrain = selectedMap ? selectedMap.terrain : terrain;
    
    // Generate hex grid based on the effective radius
    const hexes = generateHexGrid(effectiveRadius);
    
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Simple handlers for increasing/decreasing hex size
    const increaseSize = () => {
        setHexSize(prevSize => Math.min(prevSize + 5, 80));
    };
    
    const decreaseSize = () => {
        setHexSize(prevSize => Math.max(prevSize - 5, 20));
    };

    // Function to calculate hex size based on container dimensions
    const calculateHexSize = () => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
        const containerHeight = containerRef.current.clientHeight - 40;
        
        if (containerWidth <= 0 || containerHeight <= 0) {
            // Container might not be properly initialized yet
            setTimeout(calculateHexSize, 100);
            return;
        }
        
        // Calculate diagonal distance across the hex grid
        const horizontalHexCount = 2 * radius + 1;
        const verticalHexCount = 2 * radius + 1;
        
        // Calculate the hex size that would fit the grid in the container
        // Horizontal spacing (1.732 = sqrt(3))
        const widthBasedSize = containerWidth / (1.732 * horizontalHexCount);
        
        // Vertical spacing (0.75 = 3/4 due to hex overlap in vertical direction)
        const heightBasedSize = containerHeight / ((1.5 * verticalHexCount) + 0.5);
        
        // Use the smaller dimension to ensure the grid fits
        const newHexSize = Math.floor(Math.min(widthBasedSize, heightBasedSize));
        
        // Set a minimum hex size to prevent too small hexes, but also limit maximum size
        const clampedSize = Math.max(Math.min(newHexSize, 60), 15);
        
        if (Math.abs(clampedSize - hexSize) > 2) {
            // Only update if the size difference is significant
            setHexSize(clampedSize);
        }
    };

    // We can remove this since we'll use manual controls instead
    // useEffect(() => {
    //     if (!containerRef.current) return;
    //     
    //     calculateHexSize();
    //     
    //     const resizeObserver = new ResizeObserver(calculateHexSize);
    //     resizeObserver.observe(containerRef.current);
    //     
    //     // Also listen to window resize events
    //     window.addEventListener('resize', calculateHexSize);
    //     
    //     return () => {
    //         if (containerRef.current) {
    //             resizeObserver.unobserve(containerRef.current);
    //         }
    //         window.removeEventListener('resize', calculateHexSize);
    //     };
    // }, [radius]);
    
    // We can remove this since we'll use manual controls
    // useEffect(() => {
    //     // Small delay to ensure the container has proper dimensions
    //     const timer = setTimeout(calculateHexSize, 300);
    //     return () => clearTimeout(timer);
    // }, []);

    // Calculate SVG viewport size based on current hex size and effective radius
    // Add extra padding (3 instead of 1) to ensure hexes at the edges are fully visible
    const width = hexSize * Math.sqrt(3) * (2 * effectiveRadius + 3);
    const height = hexSize * 3/2 * (2 * effectiveRadius + 3);
    
    // Center the grid in the viewport
    const centerX = width / 2;
    const centerY = height / 2;

    const handleTileClick = (coord: HexCoord) => {
        setSelectedTile(coord);
        
        // If in placement mode, place the unit on the clicked tile
        if (state.placementMode && state.selectedUnitId) {
            // Place the unit on the clicked tile - all hexes are valid
            dispatch({ 
                type: 'PLACE_UNIT', 
                unitId: state.selectedUnitId, 
                position: { 
                    x: coord.q, 
                    y: coord.r, 
                    facing: 0 
                } 
            });
            return;
        }
        
        // For backward compatibility
        if (state.selectedUnitId && !state.placementMode) {
            const selectedUnit = state.units.find(unit => unit.id === state.selectedUnitId);
            if (selectedUnit && !selectedUnit.position) {
                // Place the unit on the clicked tile
                dispatch({ 
                    type: 'PLACE_UNIT', 
                    unitId: selectedUnit.id, 
                    position: { 
                        x: coord.q, 
                        y: coord.r, 
                        facing: 0 
                    } 
                });
            }
        }
        
        onTileClick?.(coord);
    };
    
    // Handle unit click for targeting in attack mode or special move mode
    const handleUnitClick = (unit: UnitType) => {
        if (state.attackMode) {
            if (state.selectedUnitId !== unit.id) {
                // Select as target if in attack mode and not the attacker
                dispatch({ type: 'SELECT_TARGET', unitId: unit.id });
            } else {
                // Add a message to log if trying to select self as target
                dispatch({ 
                    type: 'LOG_ACTION', 
                    message: `A unit cannot target itself for attacks!` 
                });
            }
        } else if (state.specialMoveMode) {
            // Get the active unit and its special move
            const activeUnit = state.units.find(u => u.id === state.selectedUnitId);
            
            // Safely find the selected move with error handling
            let selectedMove;
            try {
                selectedMove = state.selectedSpecialMoveId ? 
                    (activeUnit?.specialMoves.find(move => move.id === state.selectedSpecialMoveId) ||
                    (activeUnit?.pilotId && state.pilots.find(p => p.id === activeUnit.pilotId)?.specialMoves.find(move => move.id === state.selectedSpecialMoveId)))
                    : undefined;
            } catch (error) {
                console.error("Error finding selected special move:", error);
                // Leave selectedMove as undefined
            }
            
            if (!selectedMove) return;
            
            // For self-targeting moves, don't allow targeting other units
            if (selectedMove.targeting === 'self' && state.selectedUnitId !== unit.id) {
                dispatch({ 
                    type: 'LOG_ACTION', 
                    message: `${selectedMove.name} can only target self!` 
                });
                return;
            }
            
            // For enemy-targeting moves, don't allow targeting self
            if (selectedMove.targeting === 'enemy' && state.selectedUnitId === unit.id) {
                dispatch({ 
                    type: 'LOG_ACTION', 
                    message: `${selectedMove.name} cannot target self!` 
                });
                return;
            }
            
            // For ally-targeting moves, only allow targeting self (for now)
            if (selectedMove.targeting === 'ally' && state.selectedUnitId !== unit.id) {
                dispatch({ 
                    type: 'LOG_ACTION', 
                    message: `${selectedMove.name} can only target self right now.` 
                });
                return;
            }
            
            // Select the target if all checks pass
            dispatch({ type: 'SELECT_TARGET', unitId: unit.id });
        }
    };

    // Add more margin around the grid to ensure hexes at the edges are fully visible
    const margin = hexSize * 2;
    const svgWidth = width + 2 * margin;
    const svgHeight = height + 2 * margin;

    return (
        <div 
            ref={containerRef}
            style={{ 
                display: 'flex', 
                flexDirection: 'column',
                width: '100%', 
                height: '100%',
                maxHeight: 'calc(100vh - 50px)',
                position: 'relative'
            }}
        >
            {/* Zoom controls */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 100,
                display: 'flex',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '5px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
                <button 
                    onClick={increaseSize}
                    style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    +
                </button>
                <button 
                    onClick={decreaseSize}
                    style={{
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    -
                </button>
            </div>
            
            <div style={{ 
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <div style={{ 
                    cursor: 'grab',
                    padding: '20px'
                }}>
                    <svg
                        width={svgWidth}
                        height={svgHeight}
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        style={{ 
                            display: 'block'
                        }}
                >
                    <g transform={`translate(${svgWidth/2},${svgHeight/2 + hexSize})`}>
                        {hexes.map((coord) => {
                            const key = `${coord.q},${coord.r}`;
                            const isSelected = selectedTile?.q === coord.q && selectedTile?.r === coord.r;
                            
                            // Check if this tile is in the attackable range
                            const isAttackable = state.attackMode && 
                                state.attackableTiles.some(tile => tile.q === coord.q && tile.r === coord.r);
                            
                            // Check if this tile is targetable for special moves
                            const isTargetable = state.specialMoveMode && 
                                state.targetableTiles && // Check if targetableTiles exists
                                state.targetableTiles.some(tile => tile.q === coord.q && tile.r === coord.r);
                            
                            // In placement mode, but without visual highlighting
                            const isValidPlacement = false;
                            
                            // Check if this tile is the attacker's/source unit's tile
                            const isAttackerTile = (state.attackMode || state.specialMoveMode) && 
                                state.selectedUnitId && 
                                state.units.some(unit => 
                                    unit.id === state.selectedUnitId && 
                                    unit.position?.x === coord.q && 
                                    unit.position?.y === coord.r
                                );
                            
                            return (
                                <HexTile
                                    key={key}
                                    coord={coord}
                                    size={hexSize}
                                    terrain={effectiveTerrain[key] || 'blank'}
                                    isSelected={isSelected}
                                    isAttackable={isAttackable}
                                    isTargetable={isTargetable}
                                    isValidPlacement={isValidPlacement}
                                    isAttackerTile={isAttackerTile}
                                    onClick={() => handleTileClick(coord)}
                                />
                            );
                        })}
                        {/* Group units by hex coordinates */}
                        {(() => {
                            // Filter units with positions
                            const placedUnits = state.units.filter(unit => unit.position);
                            
                            // Group units by position
                            const groupedUnits: { [key: string]: typeof state.units } = {};
                            
                            placedUnits.forEach(unit => {
                                if (!unit.position) return;
                                const key = `${unit.position.x},${unit.position.y}`;
                                
                                if (!groupedUnits[key]) {
                                    groupedUnits[key] = [];
                                }
                                
                                groupedUnits[key].push(unit);
                            });
                            
                            // Render units for each group
                            return Object.entries(groupedUnits).flatMap(([posKey, units]) => {
                                const hasMultipleUnits = units.length > 1;
                                
                                // For tiles with multiple units, arrange them in a circular pattern
                                return units.map((unit, index) => {
                                    // Calculate offset for stacking if multiple units
                                    let offsetX = 0;
                                    let offsetY = 0;
                                    
                                    if (hasMultipleUnits) {
                                        // Arrange in a circle around the center point
                                        const angle = (index * 2 * Math.PI) / units.length;
                                        const radius = hexSize / 3; // Distance from center
                                        offsetX = Math.cos(angle) * radius;
                                        offsetY = Math.sin(angle) * radius;
                                    }
                                    
                                    return (
                                        <Unit
                                            key={unit.id}
                                            unit={unit}
                                            hexSize={hexSize}
                                            onClick={() => handleUnitClick(unit as UnitType)}
                                            isTarget={state.attackMode && state.targetUnitId === unit.id}
                                            isAttacker={state.attackMode && state.selectedUnitId === unit.id}
                                            isPiloted={!!unit.pilotId}
                                            offsetX={offsetX}
                                            offsetY={offsetY}
                                            isStacked={hasMultipleUnits}
                                            stackPosition={index}
                                            stackTotal={units.length}
                                        />
                                    );
                                });
                            });
                        })()}
                    </g>
                </svg>
                </div>
            </div>
            
            {/* Size indicator */}
            <div style={{
                padding: '5px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#666'
            }}>
                Grid Size: {hexSize}px
            </div>
        </div>
    );
};

export default HexGrid;