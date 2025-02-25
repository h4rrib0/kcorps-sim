// segmentUtils.ts - Utility functions for segments and subsystems
import { Segment, Subsystem, SegmentType, SubsystemType } from '../components/types';

// Generate a simple unique ID since we're not using the uuid package yet
function generateId(): string {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Generates a set of standard segments for a new mecha
 * @param durabilityMultiplier - Multiplier for segment durability (default 1.0)
 * @param armorModifier - Extra armor to add to all segments (default 0)
 * @returns Array of Segment objects
 */
export function generateDefaultSegments(durabilityMultiplier: number = 1.0, armorModifier: number = 0): Segment[] {
  return [
    {
      id: generateId(),
      name: 'Head',
      type: 'HEAD',
      durability: Math.round(20 * durabilityMultiplier),
      maxDurability: Math.round(20 * durabilityMultiplier),
      armor: 1 + armorModifier,
      subsystemIds: []
    },
    {
      id: generateId(),
      name: 'Core',
      type: 'TORSO',
      durability: Math.round(60 * durabilityMultiplier),
      maxDurability: Math.round(60 * durabilityMultiplier),
      armor: 3 + armorModifier,
      subsystemIds: []
    },
    {
      id: generateId(),
      name: 'Left Arm',
      type: 'ARM_LEFT',
      durability: Math.round(35 * durabilityMultiplier),
      maxDurability: Math.round(35 * durabilityMultiplier),
      armor: 2 + armorModifier,
      subsystemIds: []
    },
    {
      id: generateId(),
      name: 'Right Arm',
      type: 'ARM_RIGHT',
      durability: Math.round(35 * durabilityMultiplier),
      maxDurability: Math.round(35 * durabilityMultiplier),
      armor: 2 + armorModifier,
      subsystemIds: []
    },
    {
      id: generateId(),
      name: 'Left Leg',
      type: 'LEG_LEFT',
      durability: Math.round(45 * durabilityMultiplier),
      maxDurability: Math.round(45 * durabilityMultiplier),
      armor: 2 + armorModifier,
      subsystemIds: []
    },
    {
      id: generateId(),
      name: 'Right Leg',
      type: 'LEG_RIGHT',
      durability: Math.round(45 * durabilityMultiplier),
      maxDurability: Math.round(45 * durabilityMultiplier),
      armor: 2 + armorModifier,
      subsystemIds: []
    }
  ];
}

/**
 * Generates basic subsystems for a mecha
 * @param segmentMap - Map of segment types to their segment IDs
 * @returns Array of Subsystem objects
 */
export function generateBasicSubsystems(segmentMap: Record<SegmentType, string>): Subsystem[] {
  return [
    {
      id: generateId(),
      name: 'Main Sensor Array',
      type: 'SENSOR',
      functional: true,
      durabilityThreshold: 50, // Damaged when segment health below 50%
      description: 'Primary sensor system. Provides targeting data and environmental scanning.'
    },
    {
      id: generateId(),
      name: 'Primary Power Core',
      type: 'POWER',
      functional: true,
      durabilityThreshold: 20, // Very resistant to damage
      description: 'Main power generator. Critical for all systems.'
    },
    {
      id: generateId(),
      name: 'Left Arm Actuator',
      type: 'MOBILITY',
      functional: true,
      durabilityThreshold: 40,
      description: 'Controls left arm movement and weapon aiming.'
    },
    {
      id: generateId(),
      name: 'Right Arm Actuator',
      type: 'MOBILITY',
      functional: true,
      durabilityThreshold: 40,
      description: 'Controls right arm movement and weapon aiming.'
    },
    {
      id: generateId(),
      name: 'Locomotion System',
      type: 'MOBILITY',
      functional: true,
      durabilityThreshold: 30,
      description: 'Main movement system. Controls bipedal locomotion.'
    }
  ];
}

/**
 * Creates a weapon mount subsystem for a weapon
 * @param weaponId - ID of the weapon to link
 * @param name - Name of the weapon mount
 * @param segmentId - ID of the segment this subsystem belongs to
 * @returns A new Subsystem object
 */
export function createWeaponMountSubsystem(weaponId: string, name: string, segmentId: string): Subsystem {
  return {
    id: generateId(),
    name: `${name} Mount`,
    type: 'WEAPON',
    functional: true,
    durabilityThreshold: 40, // Damaged when segment health below 40%
    weaponId,
    description: `Mounting and control systems for the ${name}.`
  };
}

/**
 * Finds total durability for a mecha from its segments
 * @param segments - Array of segments
 * @returns Object with current and max durability
 */
export function calculateTotalDurability(segments: Segment[]): { current: number, max: number } {
  if (!segments || segments.length === 0) {
    return { current: 0, max: 0 };
  }
  
  const current = segments.reduce((sum, segment) => sum + segment.durability, 0);
  const max = segments.reduce((sum, segment) => sum + segment.maxDurability, 0);
  
  return { current, max };
}