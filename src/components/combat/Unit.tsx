import React from 'react';
import { Unit as UnitType } from '../types';

interface UnitProps {
    unit: UnitType;
    hexSize: number;
}

const Unit: React.FC<UnitProps> = ({ unit, hexSize }) => {
    // Only render placed units (those with a position)
    if (!unit.position) return null;

    // Use the global state's position: x represents the axial q coordinate
    // and y represents the axial r coordinate.
    const { x: q, y: r, facing } = unit.position;
    const x = hexSize * (3 / 2) * q;
    const y = hexSize * Math.sqrt(3) * (r + q / 2);

    return (
        <g transform={`translate(${x}, ${y})`}>
            {/* Name label above the unit */}
            <text
                x={0}
                y={-hexSize - 5}
                textAnchor="middle"
                fill="black"
                style={{ fontSize: '12px' }}
            >
                {unit.name}
            </text>
            <circle cx={0} cy={0} r={hexSize / 3} fill="blue" />
            <line
                x1={0}
                y1={0}
                x2={0}
                y2={-hexSize / 2}  // Draw the line upward.
                stroke="red"
                strokeWidth={2}
                transform={`rotate(${facing})`}
            />
        </g>
    );
};

export default Unit;