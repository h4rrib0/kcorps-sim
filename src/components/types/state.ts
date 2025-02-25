// state.ts - Game state and actions
import { Unit, Pilot, Segment, SpecialMove } from './models';
import { MapData } from '../../utils/hexCalculations';

export interface GameState {
  units: Unit[];
  pilots: Pilot[]; // Array of all pilots
  selectedUnitId?: string;
  selectedPilotId?: string; // Currently selected pilot
  targetUnitId?: string;
  targetSegmentId?: string; // Currently targeted segment
  selectedWeaponId?: string;
  selectedSpecialMoveId?: string; // Selected special move ID
  attackMode: boolean;
  specialMoveMode: boolean; // Similar to attack mode but for special moves
  placementMode: boolean; // Whether the UI is in unit placement mode
  segmentTargetingMode: boolean; // Whether the UI is in segment targeting mode
  attackableTiles: Array<{q: number, r: number}>; // Tiles that can be attacked with current weapon
  targetableTiles: Array<{q: number, r: number}>; // Tiles that can be targeted with special moves
  validPlacementTiles: Array<{q: number, r: number}>; // Tiles where units can be placed
  turn: number;
  phase: 'movement' | 'action' | 'special' | 'end';
  initiativeOrder: string[]; // Array of unit IDs
  log: string[];
  error?: string; // Optional error message for UI display
  showLog: boolean; // Whether to show the log panel
  
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
  segmentTargetingMode: false,
  attackableTiles: [],
  targetableTiles: [],
  validPlacementTiles: [],
  turn: 1,
  phase: 'movement',
  initiativeOrder: [],
  log: [],
  showLog: true,
  
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