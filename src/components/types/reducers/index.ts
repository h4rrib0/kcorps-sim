// index.ts - Main reducer that combines all reducer functions
import { GameState } from '../state';
import { GameAction } from '../actions';
import { handleSelectUnit, handleAddUnit, handleUpdateUnit, handleDamageUnit, handleRemoveUnit } from './unitReducers';
import { handleSelectPilot, handleAddPilot, handleUpdatePilot, handleAssignPilot, handleRemovePilot, handleRemovePilotEntry } from './pilotReducers';
import { 
  handleEnterAttackMode, handleExitAttackMode, handleSelectWeapon, handleExecuteAttack,
  handleEnterSpecialMoveMode, handleExitSpecialMoveMode, handleSelectSpecialMove, handleExecuteSpecialMove
} from './combatReducers';
// Segment reducers removed in favor of unified durability system
import { handleMoveUnitForward, handleRotateUnit } from './movementReducers';
import { mapReducers } from './mapReducers';
import { addLogEntry } from './utils';

// Helper function to handle the NEXT_TURN action
function handleNextTurn(state: GameState): GameState {
  // Decrement cooldowns on all unit and pilot special moves
  const updatedUnits = state.units.map(unit => ({
    ...unit,
    specialMoves: unit.specialMoves.map(move => ({
      ...move,
      currentCooldown: Math.max(0, move.currentCooldown - 1)
    }))
  }));
  
  const updatedPilots = state.pilots.map(pilot => ({
    ...pilot,
    specialMoves: pilot.specialMoves.map(move => ({
      ...move,
      currentCooldown: Math.max(0, move.currentCooldown - 1)
    }))
  }));
  
  return {
    ...state,
    turn: state.turn + 1,
    units: updatedUnits,
    pilots: updatedPilots
  };
}

// Helper function to handle PLACE_UNIT action
function handlePlaceUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'PLACE_UNIT') return state;

  console.log('Placing unit:', action.unitId, 'at', action.position);
  
  // Find the unit to be placed
  const unitToPlace = state.units.find(unit => unit.id === action.unitId);
  // Prevent re-placing if the unit already has a position
  if (unitToPlace && unitToPlace.position !== undefined) {
    return state;
  }
  
  // If in attack mode, cancel attack mode when placing a new unit
  const isInAttackMode = state.attackMode;
  const attackingUnit = isInAttackMode ? state.units.find(unit => unit.id === state.selectedUnitId) : null;
  
  // If in special move mode, cancel special move mode when placing a new unit
  const isInSpecialMoveMode = state.specialMoveMode;
  const specialMoveUnit = isInSpecialMoveMode ? state.units.find(unit => unit.id === state.selectedUnitId) : null;
  
  const updatedPlacementState = {
    ...state,
    units: state.units.map(unit =>
      unit.id === action.unitId ? { ...unit, position: action.position } : unit
    ),
    selectedUnitId: undefined, // Unselect the unit once placed
    // Cancel attack mode if active
    attackMode: isInAttackMode ? false : state.attackMode,
    targetUnitId: isInAttackMode ? undefined : state.targetUnitId,
    selectedWeaponId: isInAttackMode ? undefined : state.selectedWeaponId,
    attackableTiles: isInAttackMode ? [] : state.attackableTiles,
    // Cancel special move mode if active
    specialMoveMode: isInSpecialMoveMode ? false : state.specialMoveMode,
    selectedSpecialMoveId: isInSpecialMoveMode ? undefined : state.selectedSpecialMoveId,
    targetableTiles: isInSpecialMoveMode ? [] : state.targetableTiles,
    // Exit placement mode
    placementMode: false,
    validPlacementTiles: []
  };
  
  const placedUnit = updatedPlacementState.units.find(unit => unit.id === action.unitId);
  
  // Add more descriptive log entry
  return addLogEntry(updatedPlacementState, `📍 ${placedUnit?.name} has been deployed to the battlefield at position (${action.position.x},${action.position.y}).`);
}

// Helper function to handle UNPLACE_UNIT action
function handleUnplaceUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'UNPLACE_UNIT') return state;
  
  // Find the unit being unplaced
  const unit = state.units.find(u => u.id === action.unitId);
  if (!unit) return state;
  
  const newState = {
    ...state,
    units: state.units.map(unit =>
      unit.id === action.unitId ? { ...unit, position: undefined } : unit
    ),
    // Cancel attack or special move modes if the unplaced unit is the selected unit
    attackMode: state.selectedUnitId === action.unitId ? false : state.attackMode,
    specialMoveMode: state.selectedUnitId === action.unitId ? false : state.specialMoveMode,
    // Clear target if the unplaced unit is the target
    targetUnitId: state.targetUnitId === action.unitId ? undefined : state.targetUnitId
  };
  
  return addLogEntry(newState, `${unit.name} has been removed from the battlefield.`);
}

// Main reducer
export function gameReducer(state: GameState, action: GameAction): GameState {
  // Handle state persistence actions first
  if (action.type === 'LOAD_STATE') {
    return action.state;
  }
  
  if (action.type === 'RESET_STATE') {
    return {
      ...state,
      units: [],
      pilots: [],
      log: [],
      turn: 0
    };
  }

  // Handle map-related actions
  if (
    action.type === 'ENTER_EDITOR_MODE' ||
    action.type === 'EXIT_EDITOR_MODE' ||
    action.type === 'SELECT_TERRAIN_TYPE' ||
    action.type === 'SET_TILE_TERRAIN' ||
    action.type === 'ADD_MAP' ||
    action.type === 'UPDATE_MAP' ||
    action.type === 'DELETE_MAP' ||
    action.type === 'SELECT_MAP'
  ) {
    return mapReducers(state, action);
  }
  
  // Other game actions
  switch (action.type) {
    case 'ENTER_PLACEMENT_MODE':
      return {
        ...state,
        placementMode: true,
        selectedUnitId: action.unitId,
        // All hexes are valid for placement
        validPlacementTiles: []
      };
      
    case 'EXIT_PLACEMENT_MODE':
      return {
        ...state,
        placementMode: false,
        validPlacementTiles: []
      };
      
    case 'SELECT_TARGET':
      const targetState = {
        ...state,
        targetUnitId: action.unitId
      };
      
      const attacker = state.units.find(unit => unit.id === state.selectedUnitId);
      const target = state.units.find(unit => unit.id === action.unitId);
      
      if (attacker && target) {
        return addLogEntry(targetState, `${attacker.name} targets ${target.name}.`);
      }
      
      return targetState;
    
    // Segment targeting removed with unified durability system
    
    case 'PLACE_UNIT':
      return handlePlaceUnit(state, action);
    
    case 'UPDATE_UNIT':
      return handleUpdateUnit(state, action);
    
    case 'UPDATE_PILOT':
      return handleUpdatePilot(state, action);
    
    case 'UNPLACE_UNIT':
      return handleUnplaceUnit(state, action);
    
    case 'LOG_ACTION':
      return addLogEntry(state, action.message, action.logType || 'info');
      
    case 'SHOW_COMBAT_POPUP':
      return {
        ...state,
        showCombatPopup: true,
        combatDetails: action.details
      };
      
    case 'HIDE_COMBAT_POPUP':
      return {
        ...state,
        showCombatPopup: false,
        combatDetails: undefined
      };
    
    case 'TOGGLE_LOG':
      return {
        ...state,
        showLog: !state.showLog
      };
    
    case 'NEXT_TURN':
      return handleNextTurn(state);
    
    case 'SELECT_UNIT':
      return handleSelectUnit(state, action);
    
    case 'ADD_UNIT':
      return handleAddUnit(state, action);
    
    case 'DAMAGE_UNIT':
      return handleDamageUnit(state, action);
    
    // Segment damage removed with unified durability system
    
    // Subsystem toggling will be added back when needed
    
    case 'REMOVE_UNIT':
      return handleRemoveUnit(state, action);
    
    case 'SELECT_PILOT':
      return handleSelectPilot(state, action);
    
    case 'ADD_PILOT':
      return handleAddPilot(state, action);
    
    case 'ASSIGN_PILOT':
      return handleAssignPilot(state, action);
    
    case 'REMOVE_PILOT':
      return handleRemovePilot(state, action);
    
    case 'REMOVE_PILOT_ENTRY':
      return handleRemovePilotEntry(state, action);
    
    case 'ENTER_ATTACK_MODE':
      return handleEnterAttackMode(state, action);
    
    case 'EXIT_ATTACK_MODE':
      return handleExitAttackMode(state, action);
    
    // Segment targeting removed with unified durability system
    
    case 'SELECT_WEAPON':
      return handleSelectWeapon(state, action);
    
    case 'EXECUTE_ATTACK':
      return handleExecuteAttack(state, action);
    
    case 'ENTER_SPECIAL_MOVE_MODE':
      return handleEnterSpecialMoveMode(state, action);
    
    case 'EXIT_SPECIAL_MOVE_MODE':
      return handleExitSpecialMoveMode(state, action);
    
    case 'SELECT_SPECIAL_MOVE':
      return handleSelectSpecialMove(state, action);
    
    case 'EXECUTE_SPECIAL_MOVE':
      return handleExecuteSpecialMove(state, action);
    
    // Segment management removed with unified durability system
    
    case 'MOVE_UNIT_FORWARD':
      return handleMoveUnitForward(state, action);
    
    case 'ROTATE_UNIT_CLOCKWISE':
      return handleRotateUnit(state, action);

    case 'ROTATE_UNIT_COUNTERCLOCKWISE':
      return handleRotateUnit(state, action);
    
    default:
      return state;
  }
}