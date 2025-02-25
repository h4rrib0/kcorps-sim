// models.ts - Core data models for the game
export interface Position {
  x: number;
  y: number;
  facing: 0 | 60 | 120 | 180 | 240 | 300;
}

export interface SpecialMove {
  id: string;
  name: string;
  description: string;
  cooldown: number; // Turns until it can be used again
  currentCooldown: number; // Current cooldown state
  effect: 'damage' | 'defense' | 'utility' | 'healing' | 'buff' | 'grapple';
  targeting: 'self' | 'ally' | 'enemy' | 'area';
  range?: number; // Range in tiles if targeting is not 'self'
}

export interface Weapon {
  id: string;
  name: string;
  force: number; // Replaces damage, discounted by defender's mass
  penetration: number; // Discounted by defender's armor
  difficulty: number; // Subtracted from attack roll
  range: 'melee' | number; // 'melee' for same-tile, or number of tiles
  arcWidth?: number; // Width of attack arc in degrees (defaults to 60 if not specified)
  special?: string; // Special effects as text for GM reference
}

export type SegmentType = 'HEAD' | 'TORSO' | 'ARM_LEFT' | 'ARM_RIGHT' | 'LEG_LEFT' | 'LEG_RIGHT' | 'TAIL' | 'WING_LEFT' | 'WING_RIGHT';

export interface Segment {
  id: string;
  name: string;
  type: SegmentType;
  durability: number;
  maxDurability: number;
  armor: number; // Segment-specific armor value
  subsystemIds: string[]; // IDs of subsystems attached to this segment
}

export type SubsystemType = 'WEAPON' | 'SENSOR' | 'MOBILITY' | 'SHIELD' | 'POWER' | 'LIFE_SUPPORT' | 'COMMS';

export interface Subsystem {
  id: string;
  name: string;
  type: SubsystemType;
  functional: boolean;
  durabilityThreshold: number; // % of segment durability below which subsystem is damaged
  weaponId?: string; // If the subsystem is a weapon mount
  effect?: string; // Description of special effect when active
  description: string;
}

export interface Pilot {
  id: string;
  name: string;
  aggression: number; // Used in attack rolls
  preservation: number; // Affects defense rolls
  psyche: number; // Affects sanity rolls
  sync: number; // Mecha interface ability, starts at 0
  specialMoves: SpecialMove[]; // Pilot-specific special abilities
  portrait?: string; // Optional portrait URL
  status: {
    stressed?: boolean;
    injured?: boolean;
    panicked?: boolean;
  };
}

export interface Unit {
  id: string;
  name: string;
  type: 'mecha' | 'kaiju'; // Only two unit types: Mecha (pilotable) and Kaiju (non-pilotable)
  position?: Position;
  // Overall durability is now derived from segments
  durability?: {
    current: number;
    max: number;
  };
  armor: number; // Base armor value
  agility: number;
  mass: number;
  weapons: Weapon[];
  segments: Segment[]; // New segments array
  subsystems: Subsystem[]; // Changed from old subsystem type to new one
  specialMoves: SpecialMove[]; // Unit-specific special abilities
  pilotId?: string; // Reference to the pilot (only for Mecha type)
  status: {
    dazed?: boolean;
    downed?: boolean;
    grappled?: boolean;
    stunned?: boolean;
    prone?: boolean; // Added for special moves like "Take Aim"
  };
  selectedSegmentId?: string; // Currently targeted segment
}