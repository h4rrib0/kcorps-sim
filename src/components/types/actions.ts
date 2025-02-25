// actions.ts - Action types for the game reducer
import { Position, Unit, Pilot } from './models';

export type GameAction = 
  | { type: 'SELECT_UNIT'; unitId: string }
  | { type: 'SELECT_PILOT'; pilotId: string }
  | { type: 'ASSIGN_PILOT'; unitId: string; pilotId: string }
  | { type: 'REMOVE_PILOT'; unitId: string }
  | { type: 'MOVE_UNIT'; unitId: string; position: Position }
  | { type: "MOVE_UNIT_FORWARD"; unitId: string }
  | { type: "MOVE_UNIT_BACKWARD"; unitId: string }
  | { type: 'DAMAGE_UNIT'; unitId: string; amount: number }
  | { type: 'APPLY_STATUS'; unitId: string; status: keyof Unit['status'] }
  | { type: 'APPLY_PILOT_STATUS'; pilotId: string; status: keyof Pilot['status'] }
  | { type: 'REMOVE_STATUS'; unitId: string; status: keyof Unit['status'] }
  | { type: 'REMOVE_PILOT_STATUS'; pilotId: string; status: keyof Pilot['status'] }
  | { type: 'LOG_ACTION'; message: string }
  | { type: 'ADD_UNIT'; unit: Unit }
  | { type: 'REMOVE_UNIT'; unitId: string }
  | { type: 'ADD_PILOT'; pilot: Pilot }
  | { type: 'REMOVE_PILOT_ENTRY'; pilotId: string }
  | { type: 'PLACE_UNIT'; unitId: string; position: Position }
  | { type: 'UNPLACE_UNIT'; unitId: string }
  | { type: 'ROTATE_UNIT_CLOCKWISE'; unitId: string }
  | { type: 'ROTATE_UNIT_COUNTERCLOCKWISE'; unitId: string }
  | { type: 'ENTER_ATTACK_MODE'; unitId: string }
  | { type: 'EXIT_ATTACK_MODE' }
  | { type: 'ENTER_SPECIAL_MOVE_MODE'; unitId: string; sourceType: 'unit' | 'pilot' }
  | { type: 'EXIT_SPECIAL_MOVE_MODE' }
  | { type: 'SELECT_TARGET'; unitId: string }
  | { type: 'SELECT_WEAPON'; weaponId: string }
  | { type: 'SELECT_SPECIAL_MOVE'; moveId: string }
  | { type: 'EXECUTE_ATTACK' }
  | { type: 'EXECUTE_SPECIAL_MOVE' }
  | { type: 'NEXT_TURN' };