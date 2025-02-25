// unitReducers.ts - Unit-related reducers
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry, addErrorEntry } from './utils';

// Handle unit selection
export function handleSelectUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'SELECT_UNIT') return state;

  // If in attack mode and selecting a different unit, cancel attack mode
  if (state.attackMode && state.selectedUnitId !== action.unitId) {
    const attackingUnit = state.units.find(unit => unit.id === state.selectedUnitId);
    const updatedState = {
      ...state,
      selectedUnitId: action.unitId,
      selectedPilotId: undefined, // Clear selected pilot
      attackMode: false,
      targetUnitId: undefined,
      selectedWeaponId: undefined,
      attackableTiles: []
    };
    
    if (attackingUnit) {
      return addLogEntry(updatedState, 
        `${attackingUnit.name} cancelled attack by selecting a different unit.`);
    }
    
    return updatedState;
  }
  
  // If in special move mode and selecting a different unit, cancel special move mode
  if (state.specialMoveMode && state.selectedUnitId !== action.unitId) {
    const unit = state.units.find(unit => unit.id === state.selectedUnitId);
    const updatedState = {
      ...state,
      selectedUnitId: action.unitId,
      selectedPilotId: undefined, // Clear selected pilot
      specialMoveMode: false,
      targetUnitId: undefined,
      selectedSpecialMoveId: undefined,
      targetableTiles: []
    };
    
    if (unit) {
      return addLogEntry(updatedState, 
        `${unit.name} cancelled special move by selecting a different unit.`);
    }
    
    return updatedState;
  }
  
  return {
    ...state,
    selectedUnitId: action.unitId,
    selectedPilotId: undefined // Clear selected pilot when selecting a unit
  };
}

export function handleAddUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ADD_UNIT') return state;
  
  console.log('handleAddUnit called with:', action.unit);
  console.log('Current units before:', state.units);
  
  const newState = {
    ...state,
    units: [...state.units, action.unit]
  };
  
  console.log('Units after update:', newState.units);
  return addLogEntry(newState, `Unit ${action.unit.name} (${action.unit.type}) added to the battle.`);
}

export function handleDamageUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'DAMAGE_UNIT') return state;
  
  return {
    ...state,
    units: state.units.map(unit =>
      unit.id === action.unitId
        ? {
            ...unit,
            durability: {
              ...unit.durability,
              current: Math.max(0, unit.durability.current - action.amount)
            }
          }
        : unit
    )
  };
}

export function handleRemoveUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'REMOVE_UNIT') return state;

  // Check if this unit is currently selected or targeted
  const isSelected = state.selectedUnitId === action.unitId;
  const isTargeted = state.targetUnitId === action.unitId;
  
  // Check if a pilot is assigned to this unit
  const unitToRemove = state.units.find(unit => unit.id === action.unitId);
  const hasPilot = unitToRemove?.pilotId !== undefined;
  
  const newState = {
    ...state,
    units: state.units.filter(unit => unit.id !== action.unitId),
    // Clear selection/targeting if needed
    selectedUnitId: isSelected ? undefined : state.selectedUnitId,
    targetUnitId: isTargeted ? undefined : state.targetUnitId,
    // Clear attack mode if it was active for this unit
    attackMode: isSelected && state.attackMode ? false : state.attackMode,
    specialMoveMode: isSelected && state.specialMoveMode ? false : state.specialMoveMode,
    attackableTiles: isSelected && state.attackMode ? [] : state.attackableTiles,
    targetableTiles: isSelected && state.specialMoveMode ? [] : state.targetableTiles,
    selectedWeaponId: isSelected && state.attackMode ? undefined : state.selectedWeaponId,
    selectedSpecialMoveId: isSelected && state.specialMoveMode ? undefined : state.selectedSpecialMoveId
  };
  
  return addLogEntry(newState, `Unit ${unitToRemove?.name || action.unitId} removed from battle.`);
}

// More unit-related reducers can be added here