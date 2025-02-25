// unitHelpers.ts - Helper functions for unit creation and modification
import { Unit, Segment, Subsystem, Weapon } from '../models';

// Generate a unique ID (simplified version without external dependencies)
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

// Create arm segments
export function createArmSegments(): [Segment, Segment] {
  const leftArm: Segment = {
    id: generateId('segment-'),
    name: 'Left Arm',
    type: 'ARM_LEFT',
    durability: 20,
    maxDurability: 20,
    armor: 1,
    subsystemIds: []
  };
  
  const rightArm: Segment = {
    id: generateId('segment-'),
    name: 'Right Arm',
    type: 'ARM_RIGHT', 
    durability: 20,
    maxDurability: 20,
    armor: 1,
    subsystemIds: []
  };
  
  return [leftArm, rightArm];
}

// Create weapon subsystems for arms
export function createWeaponSubsystems(weapons: Weapon[]): Subsystem[] {
  if (weapons.length < 2) return [];
  
  const leftWeaponSubsystem: Subsystem = {
    id: generateId('subsystem-'),
    name: 'Left Arm Weapon Mount',
    type: 'WEAPON',
    functional: true,
    durabilityThreshold: 40, // Becomes damaged when arm is below 40% durability
    weaponId: weapons[0].id,
    description: 'Weapon mount on the left arm'
  };
  
  const rightWeaponSubsystem: Subsystem = {
    id: generateId('subsystem-'),
    name: 'Right Arm Weapon Mount',
    type: 'WEAPON',
    functional: true,
    durabilityThreshold: 40, // Becomes damaged when arm is below 40% durability
    weaponId: weapons[1].id,
    description: 'Weapon mount on the right arm'
  };
  
  return [leftWeaponSubsystem, rightWeaponSubsystem];
}

// Add default arm segments and weapon mounts to a unit
export function addDefaultArmsToUnit(unit: Unit): Unit {
  // Create arm segments
  const [leftArm, rightArm] = createArmSegments();
  
  // Get the first two weapons (if available)
  const weapons = unit.weapons.slice(0, 2);
  if (weapons.length < 2) {
    return {
      ...unit,
      segments: [...unit.segments, leftArm, rightArm]
    };
  }
  
  // Create weapon subsystems
  const [leftWeaponSubsystem, rightWeaponSubsystem] = createWeaponSubsystems(weapons);
  
  // Link subsystems to segments
  const leftArmWithSubsystem = {
    ...leftArm,
    subsystemIds: [leftWeaponSubsystem.id]
  };
  
  const rightArmWithSubsystem = {
    ...rightArm,
    subsystemIds: [rightWeaponSubsystem.id]
  };
  
  // Return updated unit
  return {
    ...unit,
    segments: [...unit.segments, leftArmWithSubsystem, rightArmWithSubsystem],
    subsystems: [...unit.subsystems, leftWeaponSubsystem, rightWeaponSubsystem]
  };
}