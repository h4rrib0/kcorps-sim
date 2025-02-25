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
  effect: 'damage' | 'defense' | 'utility' | 'healing' | 'buff';
  targeting: 'self' | 'ally' | 'enemy' | 'area';
  range?: number; // Range in tiles if targeting is not 'self'
}

export interface Weapon {
  name: string;
  damage: number;
  penetration: number;
  difficulty: number;
  range: 'melee' | number; // 'melee' for same-tile, or number of tiles
  arcWidth?: number; // Width of attack arc in degrees (defaults to 60 if not specified)
  special?: string; // Special effects as text for GM reference
}

export interface Subsystem {
  name: string;
  type: 'Internal' | 'External' | 'Vulnerable';
  durability: number;
  status: 'Operational' | 'Damaged' | 'Destroyed';
  special?: string;
}

export interface Pilot {
  id: string;
  name: string;
  precision: number; // Affects attack rolls
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
  armor: number;
  agility: number;
  mass: number;
  weapons: Weapon[];
  subsystems: Subsystem[];
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