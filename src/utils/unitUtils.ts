// unitUtils.ts - Utility functions for units and subsystems
import { Subsystem, SubsystemType } from '../components/types';

// Generate a simple unique ID since we're not using the uuid package yet
function generateId(): string {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Generate default weapons for testing the combat system
 * @returns Array of weapon objects with different damage types
 */
export function generateDefaultWeapons(): any[] {
  return [
    {
      id: generateId(),
      name: "Kinetic Hammer",
      type: "impact",
      force: 5,
      difficulty: 1,
      range: "melee",
      arcWidth: 60
    },
    {
      id: generateId(),
      name: "Monomolecular Blade",
      type: "bladed",
      force: 3,
      edge: 6,
      power: 3,
      precision: 2,
      difficulty: 1,
      range: "melee",
      arcWidth: 60
    },
    {
      id: generateId(),
      name: "Railgun",
      type: "ballistic",
      force: 2,
      penetration: 6,
      difficulty: 2,
      range: 4,
      arcWidth: 30
    }
  ];
}

/**
 * Generates basic subsystems for a unit
 * @returns Array of Subsystem objects
 */
export function generateBasicSubsystems(): Subsystem[] {
  return [
    {
      id: generateId(),
      name: 'Main Sensor Array',
      type: 'SENSOR',
      functional: true,
      durabilityThreshold: 50, // Damaged when unit durability below 50%
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
 * @returns A new Subsystem object
 */
export function createWeaponMountSubsystem(weaponId: string, name: string): Subsystem {
  return {
    id: generateId(),
    name: `${name} Mount`,
    type: 'WEAPON',
    functional: true,
    durabilityThreshold: 40, // Damaged when unit durability below 40%
    weaponId,
    description: `Mounting and control systems for the ${name}.`
  };
}

/**
 * Calculates default durability for a new unit
 * @param unitType - Type of unit ('mecha' or 'kaiju')  
 * @param durabilityMultiplier - Optional multiplier for durability scaling
 * @returns Object with current and max durability
 */
export function calculateDefaultDurability(unitType: 'mecha' | 'kaiju', durabilityMultiplier: number = 1.0): { current: number, max: number } {
  // Base durability value depends on unit type
  const baseDurability = unitType === 'mecha' ? 240 : 300;
  const maxDurability = Math.round(baseDurability * durabilityMultiplier);
  
  return { 
    current: maxDurability,
    max: maxDurability 
  };
}

/**
 * Create a default unit with all required properties set
 * @param id - Unit ID
 * @param name - Unit name
 * @param type - Unit type ('mecha' or 'kaiju')
 * @returns A new unit with default values
 */
export function createDefaultUnit(id: string, name: string, type: 'mecha' | 'kaiju'): any {
  // Generate default weapons
  const defaultWeapons = generateDefaultWeapons();
  
  // Create subsystems and link weapons
  const subsystems = generateBasicSubsystems();
  
  // Create weapon mount subsystems for each weapon
  const weaponSubsystems = defaultWeapons.map(weapon => 
    createWeaponMountSubsystem(weapon.id, weapon.name)
  );
  
  return {
    id,
    name,
    type,
    durability: calculateDefaultDurability(type),
    wounds: 0,
    armor: type === 'mecha' ? 3 : 4,
    agility: type === 'mecha' ? 2 : 1,
    precision: type === 'mecha' ? 2 : 1,
    mass: type === 'mecha' ? 3 : 5,
    weapons: defaultWeapons,
    subsystems: [...subsystems, ...weaponSubsystems],
    specialMoves: [],
    status: {}
  };
}