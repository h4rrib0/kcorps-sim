// segmentReducers.ts - Segment and subsystem related reducers
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry, addErrorEntry } from './utils';
import { Segment, Subsystem } from '../models';

// Handle adding a segment to a unit
export function handleAddSegment(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ADD_SEGMENT') return state;

  const { unitId, segment } = action;
  
  // Find the unit to add segment to
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot find unit with ID ${unitId}`);
  }

  // Check if segment with same ID already exists
  const segmentExists = unit.segments.some(s => s.id === segment.id);
  if (segmentExists) {
    return addErrorEntry(state, `Segment with ID ${segment.id} already exists`);
  }

  // Add the segment to the unit
  const updatedState = {
    ...state,
    units: state.units.map(u => 
      u.id === unitId
        ? {
            ...u,
            segments: [...u.segments, segment]
          }
        : u
    )
  };

  return addLogEntry(updatedState, `Added ${segment.name} segment to ${unit.name}`);
}

// Handle removing a segment from a unit
export function handleRemoveSegment(state: GameState, action: GameAction): GameState {
  if (action.type !== 'REMOVE_SEGMENT') return state;

  const { unitId, segmentId } = action;
  
  // Find the unit
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot find unit with ID ${unitId}`);
  }

  // Check if segment exists
  const segment = unit.segments.find(s => s.id === segmentId);
  if (!segment) {
    return addErrorEntry(state, `Cannot find segment with ID ${segmentId}`);
  }

  // Remove segment and any associated subsystems
  const subsystemsToRemove = segment.subsystemIds;
  
  const updatedState = {
    ...state,
    units: state.units.map(u => 
      u.id === unitId
        ? {
            ...u,
            segments: u.segments.filter(s => s.id !== segmentId),
            subsystems: u.subsystems.filter(s => !subsystemsToRemove.includes(s.id))
          }
        : u
    )
  };

  return addLogEntry(updatedState, `Removed ${segment.name} segment from ${unit.name}`);
}

// Handle adding a subsystem to a segment
export function handleAddSubsystem(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ADD_SUBSYSTEM') return state;

  const { unitId, segmentId, subsystem } = action;
  
  // Find the unit
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot find unit with ID ${unitId}`);
  }

  // Find the segment
  const segment = unit.segments.find(s => s.id === segmentId);
  if (!segment) {
    return addErrorEntry(state, `Cannot find segment with ID ${segmentId}`);
  }

  // Check if subsystem with same ID already exists
  const subsystemExists = unit.subsystems.some(s => s.id === subsystem.id);
  if (subsystemExists) {
    return addErrorEntry(state, `Subsystem with ID ${subsystem.id} already exists`);
  }

  // Add the subsystem to the unit and update segment's subsystemIds
  const updatedState = {
    ...state,
    units: state.units.map(u => 
      u.id === unitId
        ? {
            ...u,
            subsystems: [...u.subsystems, subsystem],
            segments: u.segments.map(s => 
              s.id === segmentId
                ? {
                    ...s,
                    subsystemIds: [...s.subsystemIds, subsystem.id]
                  }
                : s
            )
          }
        : u
    )
  };

  return addLogEntry(updatedState, `Added ${subsystem.name} subsystem to ${segment.name} on ${unit.name}`);
}

// Handle removing a subsystem
export function handleRemoveSubsystem(state: GameState, action: GameAction): GameState {
  if (action.type !== 'REMOVE_SUBSYSTEM') return state;

  const { unitId, subsystemId } = action;
  
  // Find the unit
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot find unit with ID ${unitId}`);
  }

  // Check if subsystem exists
  const subsystem = unit.subsystems.find(s => s.id === subsystemId);
  if (!subsystem) {
    return addErrorEntry(state, `Cannot find subsystem with ID ${subsystemId}`);
  }

  // Remove subsystem and update any segments that reference it
  const updatedState = {
    ...state,
    units: state.units.map(u => 
      u.id === unitId
        ? {
            ...u,
            subsystems: u.subsystems.filter(s => s.id !== subsystemId),
            segments: u.segments.map(segment => ({
              ...segment,
              subsystemIds: segment.subsystemIds.filter(id => id !== subsystemId)
            }))
          }
        : u
    )
  };

  return addLogEntry(updatedState, `Removed ${subsystem.name} subsystem from ${unit.name}`);
}

// Handle damaging a specific segment
export function handleDamageSegment(state: GameState, action: GameAction): GameState {
  if (action.type !== 'DAMAGE_SEGMENT') return state;

  const { unitId, segmentId, amount } = action;
  
  // Find the unit
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot find unit with ID ${unitId}`);
  }

  // Find the segment
  const segment = unit.segments.find(s => s.id === segmentId);
  if (!segment) {
    return addErrorEntry(state, `Cannot find segment with ID ${segmentId}`);
  }

  // Calculate new durability
  const newDurability = Math.max(0, segment.durability - amount);
  
  // Update segment durability
  let updatedState = {
    ...state,
    units: state.units.map(u => 
      u.id === unitId
        ? {
            ...u,
            segments: u.segments.map(s => 
              s.id === segmentId
                ? {
                    ...s,
                    durability: newDurability
                  }
                : s
            )
          }
        : u
    )
  };

  // Add log entry for the damage
  updatedState = addLogEntry(
    updatedState, 
    `${unit.name}'s ${segment.name} takes ${amount} damage! (${newDurability}/${segment.maxDurability} durability remaining)`
  );

  // Check subsystems on this segment for damage
  const affectedSubsystems = unit.subsystems.filter(s => segment.subsystemIds.includes(s.id));
  
  for (const subsystem of affectedSubsystems) {
    // Calculate if subsystem should be damaged based on durability threshold
    const durabilityPercentage = (newDurability / segment.maxDurability) * 100;
    const shouldBeDamaged = durabilityPercentage < subsystem.durabilityThreshold;
    
    // If subsystem should be damaged and is currently functional
    if (shouldBeDamaged && subsystem.functional) {
      // Update subsystem status
      updatedState = {
        ...updatedState,
        units: updatedState.units.map(u => 
          u.id === unitId
            ? {
                ...u,
                subsystems: u.subsystems.map(s => 
                  s.id === subsystem.id
                    ? {
                        ...s,
                        functional: false
                      }
                    : s
                )
              }
            : u
        )
      };
      
      // Add log entry for subsystem damage
      updatedState = addLogEntry(
        updatedState, 
        `${unit.name}'s ${subsystem.name} subsystem is damaged and no longer functional!`
      );
    }
  }

  return updatedState;
}

// Handle toggling a subsystem's functional status
export function handleToggleSubsystem(state: GameState, action: GameAction): GameState {
  if (action.type !== 'TOGGLE_SUBSYSTEM') return state;

  const { unitId, subsystemId, functional } = action;
  
  // Find the unit
  const unit = state.units.find(u => u.id === unitId);
  if (!unit) {
    return addErrorEntry(state, `Cannot find unit with ID ${unitId}`);
  }

  // Find the subsystem
  const subsystem = unit.subsystems.find(s => s.id === subsystemId);
  if (!subsystem) {
    return addErrorEntry(state, `Cannot find subsystem with ID ${subsystemId}`);
  }

  // Update subsystem status
  const updatedState = {
    ...state,
    units: state.units.map(u => 
      u.id === unitId
        ? {
            ...u,
            subsystems: u.subsystems.map(s => 
              s.id === subsystemId
                ? {
                    ...s,
                    functional
                  }
                : s
            )
          }
        : u
    )
  };

  return addLogEntry(
    updatedState, 
    `${unit.name}'s ${subsystem.name} subsystem is now ${functional ? 'functional' : 'non-functional'}`
  );
}

// Handle entering segment targeting mode
export function handleEnterSegmentTargetingMode(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ENTER_SEGMENT_TARGETING_MODE') return state;

  const { unitId } = action;

  // Find the target unit
  const targetUnit = state.units.find(u => u.id === unitId);
  if (!targetUnit || targetUnit.segments.length === 0) {
    return addErrorEntry(state, `No valid segments found on target unit`);
  }

  return {
    ...state,
    segmentTargetingMode: true,
    targetUnitId: unitId,
    targetSegmentId: undefined
  };
}

// Handle exiting segment targeting mode
export function handleExitSegmentTargetingMode(state: GameState): GameState {
  return {
    ...state,
    segmentTargetingMode: false,
    targetSegmentId: undefined
  };
}

// Handle selecting a target segment
export function handleSelectTargetSegment(state: GameState, action: GameAction): GameState {
  if (action.type !== 'SELECT_TARGET_SEGMENT') return state;

  const { segmentId } = action;

  // Handle case when segmentId is empty string (targeting whole unit)
  if (segmentId === '') {
    return {
      ...state,
      targetSegmentId: undefined,
      segmentTargetingMode: false
    };
  }

  // Make sure we have a target unit selected
  if (!state.targetUnitId) {
    return addErrorEntry(state, `No target unit selected`);
  }

  // Find the target unit
  const targetUnit = state.units.find(u => u.id === state.targetUnitId);
  if (!targetUnit) {
    return addErrorEntry(state, `Target unit not found`);
  }

  // Verify the segment exists on the target unit
  const segmentExists = targetUnit.segments.some(s => s.id === segmentId);
  if (!segmentExists) {
    return addErrorEntry(state, `Segment not found on target unit`);
  }

  // Select the segment
  return {
    ...state,
    targetSegmentId: segmentId,
    segmentTargetingMode: false
  };
}