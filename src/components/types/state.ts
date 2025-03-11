// state.ts - Game state and actions
import { Unit, Pilot, SpecialMove } from './models';
import { MapData } from '../../utils/hexCalculations';

export interface GameState {
  units: Unit[];
  pilots: Pilot[]; // Array of all pilots
  selectedUnitId?: string;
  selectedPilotId?: string; // Currently selected pilot
  targetUnitId?: string; // Currently targeted unit
  selectedWeaponId?: string;
  selectedSpecialMoveId?: string; // Selected special move ID
  attackMode: boolean;
  specialMoveMode: boolean; // Similar to attack mode but for special moves
  placementMode: boolean; // Whether the UI is in unit placement mode
  // Segment targeting removed with unified durability system
  attackableTiles: Array<{q: number, r: number}>; // Tiles that can be attacked with current weapon
  targetableTiles: Array<{q: number, r: number}>; // Tiles that can be targeted with special moves
  validPlacementTiles: Array<{q: number, r: number}>; // Tiles where units can be placed
  turn: number;
  phase: 'movement' | 'action' | 'special' | 'end';
  initiativeOrder: string[]; // Array of unit IDs
  log: Array<{message: string, type: 'info' | 'error' | 'combat' | 'system'}>; // Log entries with types
  error?: string; // Optional error message for UI display
  showLog: boolean; // Whether to show the log panel
  
  // Combat popup related
  showCombatPopup: boolean;
  combatDetails?: any; // Will hold detailed combat results
  
  // Map related
  maps: MapData[];
  selectedMapId?: string;
  editorMode: boolean;
  selectedTerrain?: string;
}

// Initial state for the game
export const initialGameState: GameState = {
  units: [],
  pilots: [],
  attackMode: false,
  specialMoveMode: false,
  placementMode: false,
  // Segment targeting removed with unified durability system
  attackableTiles: [],
  targetableTiles: [],
  validPlacementTiles: [],
  turn: 1,
  phase: 'movement',
  initiativeOrder: [],
  log: [] as Array<{message: string, type: 'info' | 'error' | 'combat' | 'system'}>,
  showLog: true,
  
  // Combat popup related
  showCombatPopup: false,
  
  // Map related
  maps: [
    // Default empty map
    {
      id: 'default',
      name: 'Default Map',
      terrain: {},
      radius: 4,
      description: 'Default empty map'
    }
  ],
  editorMode: false
};