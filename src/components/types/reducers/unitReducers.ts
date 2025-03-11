// unitReducers.ts - Unit-related reducers
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry, addErrorEntry } from './utils';
import { createDefaultUnit } from '../../../utils/unitUtils';

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
  
  // Handle case when a unit with wounds/precision is provided vs legacy units
  let unitToAdd = action.unit;
  
  // Check if the unit has the new required properties
  if (unitToAdd.wounds === undefined || unitToAdd.precision === undefined) {
    // This is a legacy unit, use createDefaultUnit to fill in missing properties
    const defaultUnit = createDefaultUnit(unitToAdd.id, unitToAdd.name, unitToAdd.type);
    
    // Merge the provided unit with default values
    unitToAdd = {
      ...defaultUnit,
      ...unitToAdd,
      // Make sure durability is preserved if provided
      durability: unitToAdd.durability || defaultUnit.durability
    };
  }
  
  const newState = {
    ...state,
    units: [...state.units, unitToAdd]
  };
  
  return addLogEntry(newState, `Unit ${unitToAdd.name} (${unitToAdd.type}) added to the battle.`);
}

export function handleUpdateUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'UPDATE_UNIT') return state;
  
  const unitToUpdate = state.units.find(unit => unit.id === action.unitId);
  if (!unitToUpdate) {
    return addErrorEntry(state, `Cannot update unit: Unit with ID ${action.unitId} not found.`);
  }
  
  return {
    ...state,
    units: state.units.map(unit => 
      unit.id === action.unitId 
        ? { ...unit, ...action.changes }
        : unit
    )
  };
}

export function handleDamageUnit(state: GameState, action: GameAction): GameState {
  if (action.type !== 'DAMAGE_UNIT') return state;
  
  const unit = state.units.find(u => u.id === action.unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot damage unit: Unit with ID ${action.unitId} not found.`);
  }
  
  // Get the wounds value from the action or default to 0
  const addWounds = action.wounds !== undefined ? action.wounds : 0;
  
  // Update unit
  const updatedState = {
    ...state,
    units: state.units.map(unit =>
      unit.id === action.unitId
        ? {
            ...unit,
            durability: {
              ...unit.durability,
              current: Math.max(0, unit.durability.current - action.amount)
            },
            // Cap wounds to not exceed armor
            wounds: Math.min(
              unit.armor, 
              unit.wounds !== undefined ? unit.wounds + addWounds : addWounds
            )
          }
        : unit
    )
  };
  
  // Create log message
  let logMessage = `${unit.name} takes ${action.amount} damage`;
  if (addWounds > 0) {
    logMessage += ` and suffers ${addWounds} structural wound${addWounds > 1 ? 's' : ''}`;
  }
  
  return addLogEntry(updatedState, logMessage);
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