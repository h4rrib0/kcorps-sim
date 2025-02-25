import React from 'react';
import { Unit, Segment, Subsystem } from '../types';

interface SegmentDetailsProps {
  unit: Unit;
  segment: Segment;
}

const SegmentDetails: React.FC<SegmentDetailsProps> = ({ unit, segment }) => {
  // Helper function to get segment health percentage
  const getHealthPercentage = () => {
    return (segment.durability / segment.maxDurability) * 100;
  };
  
  // Helper function to get health bar color based on percentage
  const getHealthColor = (percentage: number) => {
    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Get subsystems attached to this segment
  const subsystems = unit.subsystems.filter(sub => 
    segment.subsystemIds.includes(sub.id)
  );
  
  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-bold">{segment.name}</h3>
        <span className="text-gray-300 text-sm">{segment.type}</span>
      </div>
      
      {/* Health bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-300">Durability</span>
          <span className="text-gray-300">{segment.durability}/{segment.maxDurability}</span>
        </div>
        <div className="w-full bg-gray-700 h-2 rounded overflow-hidden">
          <div 
            className={getHealthColor(getHealthPercentage())} 
            style={{ width: `${getHealthPercentage()}%` }}
          ></div>
        </div>
      </div>
      
      {/* Armor value */}
      <div className="flex justify-between mb-3">
        <span className="text-gray-300 text-sm">Armor</span>
        <span className="text-gray-300 text-sm">{segment.armor}</span>
      </div>
      
      {/* Subsystems */}
      {subsystems.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-semibold mb-2">Subsystems</h4>
          <div className="space-y-2">
            {subsystems.map(subsystem => (
              <SubsystemItem key={subsystem.id} subsystem={subsystem} unit={unit} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SubsystemItemProps {
  subsystem: Subsystem;
  unit: Unit;
}

const SubsystemItem: React.FC<SubsystemItemProps> = ({ subsystem, unit }) => {
  // Find the associated weapon if this is a weapon subsystem
  const weapon = subsystem.weaponId 
    ? unit.weapons.find(w => w.id === subsystem.weaponId) 
    : null;
  
  return (
    <div className={`p-2 rounded ${subsystem.functional ? 'bg-gray-700' : 'bg-red-900'}`}>
      <div className="flex justify-between items-center">
        <span className="text-white text-sm">{subsystem.name}</span>
        <span className={`text-xs ${subsystem.functional ? 'text-green-400' : 'text-red-400'}`}>
          {subsystem.functional ? 'Functional' : 'Damaged'}
        </span>
      </div>
      
      <div className="text-gray-400 text-xs">{subsystem.type}</div>
      
      {weapon && (
        <div className="mt-1 text-xs text-gray-300">
          Weapon: {weapon.name}
        </div>
      )}
      
      {subsystem.effect && (
        <div className="mt-1 text-xs text-gray-300">
          Effect: {subsystem.effect}
        </div>
      )}
      
      <div className="mt-1 text-xs text-gray-400">
        Fails at {subsystem.durabilityThreshold}% segment damage
      </div>
    </div>
  );
};

export default SegmentDetails;