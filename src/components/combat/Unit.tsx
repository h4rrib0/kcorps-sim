import React from 'react';
import { Unit as UnitType } from '../types';

interface UnitProps {
    unit: UnitType;
    hexSize: number;
    onClick?: () => void;
    isTarget?: boolean;
    isAttacker?: boolean;
    isPiloted?: boolean;
    offsetX?: number;
    offsetY?: number;
    isStacked?: boolean;
    stackPosition?: number;
    stackTotal?: number;
}

const Unit: React.FC<UnitProps> = ({ 
    unit, 
    hexSize, 
    onClick, 
    isTarget = false, 
    isAttacker = false,
    isPiloted = false,
    offsetX = 0,
    offsetY = 0,
    isStacked = false,
    stackPosition = 0,
    stackTotal = 1
}) => {
    // Only render placed units (those with a position)
    if (!unit.position) return null;

    // Use the global state's position: x represents the axial q coordinate
    // and y represents the axial r coordinate.
    const { x: q, y: r, facing } = unit.position;
    const x = hexSize * (3 / 2) * q;
    const y = hexSize * Math.sqrt(3) * (r + q / 2);

    // Determine fill color based on attacker/target status
    const getFillColor = () => {
        if (isAttacker) return '#007bff';  // Blue for attacker
        if (isTarget) return '#dc3545';     // Red for target
        return getUnitColor();            // Unique color based on unit name
    };

    // Calculate unit size based on stacking
    const unitSize = isStacked ? hexSize / 4 : hexSize / 3;
    const fontSize = isStacked ? 8 : 12;
    const healthFontSize = isStacked ? 7 : 10;
    
    // Assign a consistent color based on unit name to help identify units
    const getUnitColor = () => {
        // Simple hash function to generate a consistent color for each unit name
        const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360; // 0-359 for hue
        return `hsl(${hue}, 80%, 70%)`; // High saturation, medium-high lightness for visibility
    };
    
    // Calculate z-index so units added later appear on top
    const zIndex = stackPosition;
    
    return (
        <g 
            transform={`translate(${x + offsetX}, ${y + offsetY})`}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            {/* Name label above the unit - only show if not stacked or is first in stack */}
            {(!isStacked || stackPosition === 0) && (
                <g>
                    {/* Background for better text visibility */}
                    {(isAttacker || isTarget) && (
                        <rect
                            x={-unit.name.length * 3.5}
                            y={isStacked ? -unitSize * 2.5 - 10 : -hexSize - 15}
                            width={unit.name.length * 7}
                            height={14}
                            rx={7}
                            ry={7}
                            fill={isAttacker ? "rgba(0, 123, 255, 0.7)" : "rgba(220, 53, 69, 0.7)"}
                        />
                    )}
                    <text
                        x={0}
                        y={isStacked ? -unitSize * 2.5 : -hexSize - 5}
                        textAnchor="middle"
                        fill={isAttacker || isTarget ? '#fff' : '#000'}
                        style={{ 
                            fontSize: `${fontSize}px`,
                            fontWeight: 'bold'
                        }}
                    >
                        {unit.name}
                    </text>
                </g>
            )}
            
            {/* Total units indicator (only shown on first unit of stack) */}
            {isStacked && stackPosition === 0 && stackTotal > 1 && (
                <g>
                    <rect
                        x={-20}
                        y={-unitSize * 2.2}
                        width={40}
                        height={16}
                        rx={8}
                        ry={8}
                        fill="rgba(0,0,0,0.7)"
                    />
                    <text
                        x={0}
                        y={-unitSize * 1.5}
                        textAnchor="middle"
                        fill="#fff"
                        style={{ 
                            fontSize: `${fontSize}px`,
                            fontWeight: 'bold',
                            pointerEvents: 'none'
                        }}
                    >
                        {stackTotal} units
                    </text>
                </g>
            )}
            
            {/* Highlight circle for attack mode */}
            {(isAttacker || isTarget) && (
                <circle 
                    cx={0} 
                    cy={0} 
                    r={unitSize * 1.2} 
                    fill="none" 
                    stroke={isAttacker ? '#007bff' : '#dc3545'}
                    strokeWidth="2"
                    strokeDasharray={isTarget ? "5,5" : "none"}
                />
            )}
            
            {/* Pilot indicator */}
            {isPiloted && !isAttacker && !isTarget && (
                <circle 
                    cx={0} 
                    cy={0} 
                    r={unitSize * 1.1} 
                    fill="none" 
                    stroke="#ff9800"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                />
            )}
            
            {/* Unit circle */}
            <circle 
                cx={0} 
                cy={0} 
                r={unitSize} 
                fill={getFillColor()}
                stroke="#000"
                strokeWidth={isStacked ? 1 : 1.5}
            />
            
            {/* Status effect indicators */}
            {unit.status.dazed && (
                <circle
                    cx={unitSize * 0.7}
                    cy={unitSize * 0.0}
                    r={unitSize / 3}
                    fill="#e57373" // Red for dazed
                    stroke="#000"
                    strokeWidth="1"
                />
            )}
            
            {unit.status.grappled && (
                <circle
                    cx={unitSize * 0.0}
                    cy={unitSize * 0.7}
                    r={unitSize / 3}
                    fill="#9575cd" // Purple for grappled
                    stroke="#000"
                    strokeWidth="1"
                />
            )}
            
            {unit.status.downed && (
                <circle
                    cx={-unitSize * 0.0}
                    cy={-unitSize * 0.7}
                    r={unitSize / 3}
                    fill="#e0e0e0" // Gray for downed
                    stroke="#000"
                    strokeWidth="1"
                />
            )}
            
            {unit.status.prone && (
                <circle
                    cx={-unitSize * 0.7}
                    cy={unitSize * 0.0}
                    r={unitSize / 3}
                    fill="#81c784" // Green for prone (take aim)
                    stroke="#000"
                    strokeWidth="1"
                />
            )}
            
            {/* Facing indicator */}
            <line
                x1={0}
                y1={0}
                x2={0}
                y2={-unitSize * 1.5}
                stroke="#000"
                strokeWidth={isStacked ? 1 : 2}
                transform={`rotate(${facing})`}
            />
            
            {/* Health indicator */}
            <text
                x={0}
                y={isStacked ? 3 : 5}
                textAnchor="middle"
                fill="white"
                style={{ 
                    fontSize: `${healthFontSize}px`, 
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                }}
            >
                {unit.durability.current}
            </text>
            
            {/* ID badge for stacked units to help distinguish them */}
            {isStacked && (
                <g>
                    <circle
                        cx={unitSize * 0.7}
                        cy={-unitSize * 0.7}
                        r={unitSize / 2.5}
                        fill="#fff"
                        stroke="#000"
                        strokeWidth="1"
                    />
                    <text
                        x={unitSize * 0.7}
                        y={-unitSize * 0.6}
                        textAnchor="middle"
                        fill="#000"
                        style={{ 
                            fontSize: `${unitSize / 2.5}px`, 
                            fontWeight: 'bold',
                            pointerEvents: 'none'
                        }}
                    >
                        {stackPosition + 1}
                    </text>
                </g>
            )}
            
            {/* Small name label on each stacked unit */}
            {isStacked && (
                <text
                    x={unitSize * 0.7}
                    y={unitSize * 0.9}
                    textAnchor="middle"
                    fill="#000"
                    style={{ 
                        fontSize: `${unitSize / 3}px`,
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                        backgroundColor: "#fff",
                        padding: "2px"
                    }}
                >
                    {unit.name.substring(0, 3)}
                </text>
            )}
        </g>
    );
};

export default Unit;