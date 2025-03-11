// actions.ts - Action types for the game reducer
import { Position, Unit, Pilot, Subsystem } from './models';
import { TerrainType, MapData, HexCoord } from '../../utils/hexCalculations';
import { GameState } from './state';

export type GameAction = 
  // State persistence actions
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'RESET_STATE' }
  | { type: 'SELECT_UNIT'; unitId: string }
  | { type: 'SELECT_PILOT'; pilotId: string }
  | { type: 'ASSIGN_PILOT'; unitId: string; pilotId: string }
  | { type: 'REMOVE_PILOT'; unitId: string }
  | { type: 'MOVE_UNIT'; unitId: string; position: Position }
  | { type: "MOVE_UNIT_FORWARD"; unitId: string }
  | { type: "MOVE_UNIT_BACKWARD"; unitId: string }
  | { type: 'DAMAGE_UNIT'; unitId: string; amount: number; wounds?: number }
  | { type: 'TOGGLE_SUBSYSTEM'; unitId: string; subsystemId: string; functional: boolean }
  | { type: 'APPLY_STATUS'; unitId: string; status: keyof Unit['status'] }
  | { type: 'APPLY_PILOT_STATUS'; pilotId: string; status: keyof Pilot['status'] }
  | { type: 'REMOVE_STATUS'; unitId: string; status: keyof Unit['status'] }
  | { type: 'REMOVE_PILOT_STATUS'; pilotId: string; status: keyof Pilot['status'] }
  | { type: 'LOG_ACTION'; message: string; logType?: 'info' | 'error' | 'combat' | 'system' }
  | { type: 'TOGGLE_LOG' }
  | { type: 'ADD_UNIT'; unit: Unit }
  | { type: 'REMOVE_UNIT'; unitId: string }
  | { type: 'UPDATE_UNIT'; unitId: string; changes: Partial<Unit> }
  | { type: 'ADD_PILOT'; pilot: Pilot }
  | { type: 'REMOVE_PILOT_ENTRY'; pilotId: string }
  | { type: 'UPDATE_PILOT'; pilotId: string; changes: Partial<Pilot> }
  | { type: 'ENTER_PLACEMENT_MODE'; unitId: string }
  | { type: 'EXIT_PLACEMENT_MODE' }
  | { type: 'PLACE_UNIT'; unitId: string; position: Position }
  | { type: 'UNPLACE_UNIT'; unitId: string }
  | { type: 'ROTATE_UNIT_CLOCKWISE'; unitId: string }
  | { type: 'ROTATE_UNIT_COUNTERCLOCKWISE'; unitId: string }
  | { type: 'ENTER_ATTACK_MODE'; unitId: string }
  | { type: 'EXIT_ATTACK_MODE' }
  | { type: 'ENTER_SPECIAL_MOVE_MODE'; unitId: string; sourceType: 'unit' | 'pilot' }
  | { type: 'EXIT_SPECIAL_MOVE_MODE' }
  // Segment targeting removed with unified durability system
  | { type: 'SELECT_TARGET'; unitId: string }
  // Segment targeting removed with unified durability system
  | { type: 'SELECT_WEAPON'; weaponId: string }
  | { type: 'SELECT_SPECIAL_MOVE'; moveId: string }
  | { type: 'ADD_SUBSYSTEM'; unitId: string; subsystem: Subsystem }
  | { type: 'REMOVE_SUBSYSTEM'; unitId: string; subsystemId: string }
  | { type: 'EXECUTE_ATTACK' }
  | { type: 'EXECUTE_SPECIAL_MOVE'; moveData?: { id: string; name: string; effect: string; targeting: string } }
  | { type: 'NEXT_TURN' }
  // Combat popup related actions
  | { type: 'SHOW_COMBAT_POPUP'; details: any }
  | { type: 'HIDE_COMBAT_POPUP' }
  // Map-related actions
  | { type: 'ENTER_EDITOR_MODE' }
  | { type: 'EXIT_EDITOR_MODE' }
  | { type: 'SELECT_TERRAIN_TYPE'; terrainType: TerrainType | undefined }
  | { type: 'SET_TILE_TERRAIN'; coord: HexCoord; terrainType: TerrainType }
  | { type: 'ADD_MAP'; map: MapData }
  | { type: 'UPDATE_MAP'; mapId: string; changes: Partial<MapData> }
  | { type: 'DELETE_MAP'; mapId: string }
  | { type: 'SELECT_MAP'; mapId: string };