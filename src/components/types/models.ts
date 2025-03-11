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

export type WeaponType = 'impact' | 'bladed' | 'ballistic';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  // Damage stats
  force: number; // Impact force damage
  edge?: number; // Cutting damage for bladed weapons
  power?: number; // Secondary force for bladed weapons
  precision?: number; // Used for crits with bladed weapons
  penetration?: number; // For ballistic weapons
  // Attack stats
  difficulty: number; // Added to defense target
  range: 'melee' | number; // 'melee' for same-tile, or number of tiles
  arcWidth?: number; // Width of attack arc in degrees (defaults to 60 if not specified)
  special?: string; // Special effects as text for GM reference
}

export type SubsystemType = 'WEAPON' | 'SENSOR' | 'MOBILITY' | 'SHIELD' | 'POWER' | 'LIFE_SUPPORT' | 'COMMS';

export interface Subsystem {
  id: string;
  name: string;
  type: SubsystemType;
  functional: boolean;
  durabilityThreshold: number; // % of unit durability below which subsystem is damaged
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
  durability: {
    current: number;
    max: number;
  };
  wounds: number; // Number of structural wounds (reduces effective armor)
  armor: number; // Base armor value
  agility: number;
  precision: number; // New stat for targeting
  mass: number;
  weapons: Weapon[];
  subsystems: Subsystem[]; // Subsystems attached directly to the unit
  specialMoves: SpecialMove[]; // Unit-specific special abilities
  pilotId?: string; // Reference to the pilot (only for Mecha type)
  status: {
    dazed?: boolean;
    downed?: boolean;
    grappled?: boolean;
    stunned?: boolean;
    prone?: boolean; // Added for special moves like "Take Aim"
  };
}