// pilotReducers.ts - Pilot-related reducers
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry, addErrorEntry } from './utils';

// Handle pilot selection
export function handleSelectPilot(state: GameState, action: GameAction): GameState {
  if (action.type !== 'SELECT_PILOT') return state;
  
  return {
    ...state,
    selectedPilotId: action.pilotId,
    selectedUnitId: undefined // Clear selected unit when selecting a pilot
  };
}

export function handleAddPilot(state: GameState, action: GameAction): GameState {
  console.log('Received action:', action);

  if (action.type !== 'ADD_PILOT') return state;
  
  const newState = {
    ...state,
    pilots: [...state.pilots, action.pilot]
  };
  return addLogEntry(newState, `Pilot ${action.pilot.name} added to the roster.`);
}

export function handleAssignPilot(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ASSIGN_PILOT') return state;
  
  // Get the unit to check if it's a Mecha (only Mecha can be piloted)
  const unit = state.units.find(u => u.id === action.unitId);
  if (!unit) return state;
  
  // If not a Mecha, return without assigning pilot
  if (unit.type !== 'mecha') {
    return addLogEntry(state, `Cannot assign pilot to ${unit.name} - only Mecha can be piloted.`);
  }
  
  // Check if pilot is already assigned to another unit
  const isPilotAssigned = state.units.some(unit => unit.pilotId === action.pilotId);
  let updatedState = state;
  
  if (isPilotAssigned) {
    // Remove pilot from any other units first
    updatedState = {
      ...state,
      units: state.units.map(unit => 
        unit.pilotId === action.pilotId 
          ? { ...unit, pilotId: undefined } 
          : unit
      )
    };
  }
  
  const updatedUnits = updatedState.units.map(unit =>
    unit.id === action.unitId 
      ? { ...unit, pilotId: action.pilotId } 
      : unit
  );
  
  const pilot = updatedState.pilots.find(p => p.id === action.pilotId);
  
  if (!pilot) return updatedState;
  
  const stateWithUpdatedUnits = {
    ...updatedState,
    units: updatedUnits
  };
  
  return addLogEntry(stateWithUpdatedUnits, `Pilot ${pilot.name} assigned to ${unit.name}.`);
}

export function handleRemovePilot(state: GameState, action: GameAction): GameState {
  if (action.type !== 'REMOVE_PILOT') return state;
  
  const unit = state.units.find(u => u.id === action.unitId);
  const pilot = unit?.pilotId ? state.pilots.find(p => p.id === unit.pilotId) : null;
  
  if (!unit || !pilot) return state;
  
  const updatedUnits = state.units.map(u =>
    u.id === action.unitId ? { ...u, pilotId: undefined } : u
  );
  
  const newState = {
    ...state,
    units: updatedUnits
  };
  
  return addLogEntry(newState, `Pilot ${pilot.name} ejected from ${unit.name}.`);
}

export function handleRemovePilotEntry(state: GameState, action: GameAction): GameState {
  if (action.type !== 'REMOVE_PILOT_ENTRY') return state;

  // Check if this pilot is currently selected
  const isSelected = state.selectedPilotId === action.pilotId;
  
  // Check if this pilot is assigned to any unit
  const assignedUnit = state.units.find(unit => unit.pilotId === action.pilotId);
  
  // If pilot is assigned to a unit, we should unassign first
  if (assignedUnit) {
    const pilot = state.pilots.find(p => p.id === action.pilotId);
    return addErrorEntry(state, 
      `Cannot remove pilot ${pilot?.name || action.pilotId} because they are currently piloting a unit.`);
  }
  
  const newState = {
    ...state,
    pilots: state.pilots.filter(pilot => pilot.id !== action.pilotId),
    // Clear selection if needed
    selectedPilotId: isSelected ? undefined : state.selectedPilotId
  };
  
  const pilot = state.pilots.find(p => p.id === action.pilotId);
  return addLogEntry(newState, `Pilot ${pilot?.name || action.pilotId} removed from roster.`);
}