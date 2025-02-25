// movementReducers.ts - Movement-related reducers
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry } from './utils';

export function handleMoveUnitForward(state: GameState, action: GameAction): GameState {
  if (action.type !== 'MOVE_UNIT_FORWARD') return state;
  
  const unit = state.units.find(u => u.id === action.unitId);
  if (!unit?.position) return state;
  
  // Check if this unit is currently in attack mode
  const isInAttackMode = state.attackMode && state.selectedUnitId === action.unitId;

  let newX = unit.position.x;
  let newY = unit.position.y;

  switch (unit.position.facing) {
    case 0:
      newY = unit.position.y - 1;
      break;
    case 60:
      newX = unit.position.x + 1;
      newY = unit.position.y - 1;
      break;
    case 120:
      newX = unit.position.x + 1;
      // newY remains the same
      break;
    case 180:
      newY = unit.position.y + 1;
      break;
    case 240:
      newX = unit.position.x - 1;
      newY = unit.position.y + 1;
      break;
    case 300:
      newX = unit.position.x - 1;
      // newY remains the same
      break;
    default:
      break;
  }

  // Check if new position is within bounds (assuming grid positions 0-19)
  const isInBounds = true;

  const movedState = {
    ...state,
    units: state.units.map(u =>
      u.id === action.unitId
        ? {
            ...u,
            position: isInBounds
              ? { ...unit.position, x: newX, y: newY }
              : unit.position // Remain at current position if out of bounds
          }
        : u
    )
  };
  
  // If unit was in attack mode, exit attack mode and add log entry
  if (isInAttackMode) {
    const loggedState = addLogEntry(movedState, 
      `${unit.name} cancelled attack by moving.`);
    
    return {
      ...loggedState,
      attackMode: false,
      targetUnitId: undefined,
      selectedWeaponId: undefined,
      attackableTiles: []
    };
  }
  
  return movedState;
}

export function handleRotateUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ROTATE_UNIT_CLOCKWISE' && action.type !== 'ROTATE_UNIT_COUNTERCLOCKWISE') {
    return state;
  }
  
  const isClockwise = action.type === 'ROTATE_UNIT_CLOCKWISE';
  
  // Exit attack mode if rotating
  const isInAttackMode = state.attackMode && state.selectedUnitId === action.unitId;
  
  const rotatedState = {
    ...state,
    units: state.units.map(unit =>
      unit.id === action.unitId
      ? {
          ...unit,
          position: unit.position
        ? {
            ...unit.position,
            facing: (
              (unit.position.facing + (isClockwise ? 60 : 300)) % 360
            ) as 0 | 60 | 120 | 180 | 240 | 300
          }
        : undefined
        }
      : unit
    )
  };
  
  // If unit was in attack mode, exit attack mode and add log entry
  if (isInAttackMode) {
    const unit = state.units.find(u => u.id === action.unitId);
    const loggedState = addLogEntry(rotatedState, 
      `${unit?.name} cancelled attack by rotating.`);
    
    return {
      ...loggedState,
      attackMode: false,
      targetUnitId: undefined,
      selectedWeaponId: undefined,
      attackableTiles: []
    };
  }
  
  return rotatedState;
}