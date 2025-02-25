// state.ts - Game state and actions
import { Unit, Pilot } from './models';

export interface GameState {
  units: Unit[];
  pilots: Pilot[]; // Array of all pilots
  selectedUnitId?: string;
  selectedPilotId?: string; // Currently selected pilot
  targetUnitId?: string;
  selectedWeaponId?: string;
  selectedSpecialMoveId?: string; // Selected special move ID
  attackMode: boolean;
  specialMoveMode: boolean; // Similar to attack mode but for special moves
  attackableTiles: Array<{q: number, r: number}>; // Tiles that can be attacked with current weapon
  targetableTiles: Array<{q: number, r: number}>; // Tiles that can be targeted with special moves
  turn: number;
  phase: 'movement' | 'action' | 'special' | 'end';
  initiativeOrder: string[]; // Array of unit IDs
  log: string[];
  error?: string; // Optional error message for UI display
}

// Initial state for the game
export const initialGameState: GameState = {
  units: [],
  pilots: [],
  attackMode: false,
  specialMoveMode: false,
  attackableTiles: [],
  targetableTiles: [],
  turn: 1,
  phase: 'movement',
  initiativeOrder: [],
  log: []
};