// combatReducers.ts - Combat-related reducers including attacks and special moves
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry, addErrorEntry } from './utils';
import { getAttackableTiles, getSpecialMoveTargets } from '../../../utils/hexCalculations';
import { SpecialMove, Unit, Segment } from '../models';

// Handle entering attack mode
export function handleEnterAttackMode(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ENTER_ATTACK_MODE') return state;

  // Find attacker unit
  const attacker = state.units.find(unit => unit.id === action.unitId);
  if (!attacker || !attacker.position) {
    return state;
  }
  
  // Default to first weapon for calculating initial attackable tiles 
  const defaultWeapon = attacker.weapons[0];
  if (!defaultWeapon) {
    return {
      ...state,
      attackMode: true,
      selectedUnitId: action.unitId,
      targetUnitId: undefined,
      targetSegmentId: undefined,
      selectedWeaponId: undefined,
      attackableTiles: []
    };
  }
  
  // Calculate attackable tiles
  const { x: q, y: r, facing } = attacker.position;
  const attackableTiles = getAttackableTiles(
    q, 
    r, 
    facing, 
    defaultWeapon.range, 
    defaultWeapon.arcWidth || 60
  );
  
  const attackModeState = {
    ...state,
    attackMode: true,
    selectedUnitId: action.unitId,
    targetUnitId: undefined,
    targetSegmentId: undefined,
    selectedWeaponId: undefined,
    attackableTiles
  };
  
  return addLogEntry(attackModeState, `${attacker.name} prepares to attack.`);
}

// Handle exiting attack mode
export function handleExitAttackMode(state: GameState, action: GameAction ): GameState {
  return {
    ...state,
    attackMode: false,
    targetUnitId: undefined,
    targetSegmentId: undefined,
    selectedWeaponId: undefined,
    attackableTiles: []
  };
}

// Handle weapon selection in attack mode
export function handleSelectWeapon(state: GameState, action: GameAction): GameState {
  if (action.type !== 'SELECT_WEAPON') return state;

  // Find attacker unit and selected weapon
  const attacker = state.units.find(unit => unit.id === state.selectedUnitId);
  if (!attacker || !attacker.position) {
    return {
      ...state,
      selectedWeaponId: action.weaponId,
      attackableTiles: []
    };
  }
  
  const weapon = attacker.weapons.find(w => w.id === action.weaponId);
  if (!weapon) {
    return {
      ...state,
      selectedWeaponId: action.weaponId,
      attackableTiles: []
    };
  }
  
  // Calculate attackable tiles based on selected weapon
  const { x: q, y: r, facing } = attacker.position;
  const attackableTiles = getAttackableTiles(
    q, 
    r, 
    facing,
    weapon.range,
    weapon.arcWidth || 60
  );
  
  return {
    ...state,
    selectedWeaponId: action.weaponId,
    attackableTiles
  };
}

// Calculate if a subsystem is functional based on its segment durability
function isSubsystemFunctional(
  subsystemId: string, 
  subsystemThreshold: number,
  segments: Segment[],
  segmentId: string | undefined = undefined
): boolean {
  // If a specific segment is provided, check only that segment
  if (segmentId) {
    const segment = segments.find(s => s.id === segmentId);
    if (segment && segment.subsystemIds.includes(subsystemId)) {
      const durabilityPercentage = (segment.durability / segment.maxDurability) * 100;
      return durabilityPercentage >= subsystemThreshold;
    }
    return true; // If subsystem is not in this segment, it's considered functional
  }
  
  // Otherwise check all segments
  for (const segment of segments) {
    if (segment.subsystemIds.includes(subsystemId)) {
      const durabilityPercentage = (segment.durability / segment.maxDurability) * 100;
      if (durabilityPercentage < subsystemThreshold) {
        return false; // Subsystem is damaged in at least one segment
      }
    }
  }
  
  return true; // Functional in all segments
}

// Handle executing an attack
export function handleExecuteAttack(state: GameState, action: GameAction): GameState {
  // Validate that we have needed values
  if (!state.selectedUnitId || !state.targetUnitId || !state.selectedWeaponId) {
    return addErrorEntry(state, "Missing required selections for attack");
  }

  const attacker = state.units.find(unit => unit.id === state.selectedUnitId);
  const defender = state.units.find(unit => unit.id === state.targetUnitId);
  const weapon = attacker?.weapons.find(w => w.id === state.selectedWeaponId);

  if (!attacker || !defender || !weapon) {
    return addErrorEntry(state, "Could not find attacker, defender or weapon");
  }

  // Prevent attacking self
  if (attacker.id === defender.id) {
    return addLogEntry(state, `Attack failed: A unit cannot target itself!`);
  }

  // Check if the weapon's subsystem is functional (if it's attached to a subsystem)
  const weaponSubsystem = attacker.subsystems.find(s => s.weaponId === weapon.id);
  if (weaponSubsystem && !weaponSubsystem.functional) {
    return addLogEntry(state, `Attack failed: The ${weapon.name} weapon system is damaged!`);
  }

  // Handle targeting validation
  // For melee attacks, units MUST share the same tile (stacked units)
  const isSameTile = 
    attacker.position?.x === defender.position?.x && 
    attacker.position?.y === defender.position?.y;
  
  // Check if target is in attackable range
  const isTargetInRange = 
    // For melee weapons - MUST be on the same tile
    (weapon.range === 'melee' && isSameTile) || 
    // For ranged weapons
    (weapon.range !== 'melee' && state.attackableTiles.some(
      tile => tile.q === defender.position?.x && tile.r === defender.position?.y
    ));
  
  if (!isTargetInRange) {
    return addLogEntry(state, `Attack failed: ${defender.name} is not in range or arc of ${weapon.name}!`);
  }

  // Get pilot for attacker if it exists
  const attackerPilot = attacker.pilotId ? state.pilots.find(p => p.id === attacker.pilotId) : null;
  const defenderPilot = defender.pilotId ? state.pilots.find(p => p.id === defender.pilotId) : null;
  
  // Calculate attack roll (2d6 + Pilot Aggression - Weapon Difficulty)
  const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2d6
  const attackRoll = diceRoll + (attackerPilot?.aggression || 0) - weapon.difficulty;
  
  // Calculate defense target number (Defender Pilot Preservation + Defender Agility)
  const defenseTarget = (defenderPilot?.preservation || 0) + defender.agility;
  
  // Check if attack hits
  const attackHits = attackRoll > defenseTarget;
  
  let damageAmount = 0;
  let resultMessage = "";
  
  if (attackHits) {
    // Determine which segment to damage
    const targetSegment = state.targetSegmentId 
      ? defender.segments.find(s => s.id === state.targetSegmentId)
      : defender.segments.length > 0 
        ? defender.segments[Math.floor(Math.random() * defender.segments.length)] // Random segment if none targeted
        : null;
        
    if (!targetSegment && defender.segments.length > 0) {
      return addLogEntry(state, `Attack missed: Could not determine target segment.`);
    }
    
    // If the mecha has segments, calculate segment-specific damage
    if (targetSegment) {
      // Calculate damage: Force + Penetration, modified by defender's mass and segment-specific armor
      const forceComponent = Math.max(0, weapon.force - Math.floor(defender.mass / 2));
      const penetrationComponent = Math.max(0, weapon.penetration - targetSegment.armor);
      damageAmount = forceComponent + penetrationComponent;
      
      resultMessage = `${attacker.name} attacks ${defender.name}'s ${targetSegment.name} with ${weapon.name} and hits! ` +
        `(Roll: ${diceRoll} + ${attackerPilot?.aggression || 0} - ${weapon.difficulty} = ${attackRoll} vs ${defenseTarget}) ` +
        `Dealing ${damageAmount} damage! (Force ${forceComponent} + Penetration ${penetrationComponent})`;
      
      // Apply damage to the specific segment (fixed damage calculation)
      let updatedSegments = defender.segments.map(segment => 
        segment.id === targetSegment.id
          ? {
              ...segment,
              durability: Math.max(0, segment.durability - damageAmount)
            }
          : segment
      );
      
      // Add segment damage details to the result message
      const damagePercent = Math.round((damageAmount / targetSegment.maxDurability) * 100);
      const newDurabilityPercent = Math.round((Math.max(0, targetSegment.durability - damageAmount) / targetSegment.maxDurability) * 100);
      resultMessage += ` ${targetSegment.name} integrity: ${newDurabilityPercent}% (-${damagePercent}%)`;
      
      // Check subsystem damage from penetration
      const penetrationExcess = weapon.penetration - targetSegment.armor;
      let updatedSubsystems = [...defender.subsystems];
      
      // For each point that penetration exceeds armor, roll 2d6
      for (let i = 0; i < penetrationExcess; i++) {
        // Roll 2d6 for penetration effects
        const penRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
        
        // On a 12, a subsystem in the targeted segment is destroyed
        if (penRoll === 12) {
          // Find functional subsystems in this segment
          const functionalSubsystems = defender.subsystems.filter(s => 
            targetSegment.subsystemIds.includes(s.id) && 
            s.functional
          );
          
          // If there are any functional subsystems, damage one randomly
          if (functionalSubsystems.length > 0) {
            const targetSubsystem = functionalSubsystems[Math.floor(Math.random() * functionalSubsystems.length)];
            
            // Update the subsystem to non-functional
            updatedSubsystems = updatedSubsystems.map(s => 
              s.id === targetSubsystem.id ? { ...s, functional: false } : s
            );
            
            // Add to result message
            resultMessage += ` Critical hit! ${defender.name}'s ${targetSubsystem.name} subsystem is destroyed!`;
          }
        }
      }
      
      // Check if any subsystems in the segment are damaged due to durability threshold
      // Important: calculate using the updated segment durability from updatedSegments, not the original segment
      const updatedTargetSegment = updatedSegments.find(s => s.id === targetSegment.id)!; 
      const durabilityPercentage = (updatedTargetSegment.durability / updatedTargetSegment.maxDurability) * 100;
      
      for (const subsystem of defender.subsystems) {
        if (targetSegment.subsystemIds.includes(subsystem.id) && 
            subsystem.functional && 
            durabilityPercentage < subsystem.durabilityThreshold) {
          
          // Update the subsystem to non-functional
          updatedSubsystems = updatedSubsystems.map(s => 
            s.id === subsystem.id ? { ...s, functional: false } : s
          );
          
          // Add to result message
          resultMessage += ` ${defender.name}'s ${subsystem.name} subsystem is damaged!`;
        }
      }
      
      // Check for force impact effects (Dazed or Downed status)
      let updatedStatus = { ...defender.status };
      
      if (weapon.force > defender.mass) {
        const forceExcess = weapon.force - defender.mass;
        const impactRoll = Math.floor(Math.random() * 10) + 1 + forceExcess; // 1d10 + difference
        
        if (impactRoll >= 10) {
          updatedStatus.downed = true;
          resultMessage += ` The impact knocks ${defender.name} down!`;
        } 
        else if (impactRoll >= 7) {
          updatedStatus.dazed = true;
          resultMessage += ` The impact dazes ${defender.name}!`;
        }
      }
      
      // Update the units with the new segment and subsystem state
      const updatedState = {
        ...state,
        units: state.units.map(unit =>
          unit.id === defender.id
            ? {
                ...unit,
                segments: updatedSegments,
                subsystems: updatedSubsystems,
                status: updatedStatus
              }
            : unit
        ),
        attackMode: false,
        targetUnitId: undefined,
        targetSegmentId: undefined,
        selectedWeaponId: undefined,
        attackableTiles: []
      };
      
      // Add the log entry with the attack result
      return addLogEntry(updatedState, resultMessage);
    }
    // No segments - use old durability system
    else {
      // Calculate damage: Force + Penetration, modified by defender's mass and armor
      const forceComponent = Math.max(0, weapon.force - Math.floor(defender.mass / 2));
      const penetrationComponent = Math.max(0, weapon.penetration - defender.armor);
      damageAmount = forceComponent + penetrationComponent;
      
      resultMessage = `${attacker.name} attacks ${defender.name} with ${weapon.name} and hits! ` +
        `(Roll: ${diceRoll} + ${attackerPilot?.aggression || 0} - ${weapon.difficulty} = ${attackRoll} vs ${defenseTarget}) ` +
        `Dealing ${damageAmount} damage! (Force ${forceComponent} + Penetration ${penetrationComponent})`;
      
      // Check for force impact effects (Dazed or Downed status)
      let updatedStatus = { ...defender.status };
      
      if (weapon.force > defender.mass) {
        const forceExcess = weapon.force - defender.mass;
        const impactRoll = Math.floor(Math.random() * 10) + 1 + forceExcess; // 1d10 + difference
        
        if (impactRoll >= 10) {
          updatedStatus.downed = true;
          resultMessage += ` The impact knocks ${defender.name} down!`;
        } 
        else if (impactRoll >= 7) {
          updatedStatus.dazed = true;
          resultMessage += ` The impact dazes ${defender.name}!`;
        }
      }
      
      // Apply damage to the unit's overall durability
      const updatedState = {
        ...state,
        units: state.units.map(unit =>
          unit.id === defender.id && unit.durability
            ? {
                ...unit,
                durability: {
                  ...unit.durability,
                  current: Math.max(0, unit.durability.current - damageAmount)
                },
                status: updatedStatus
              }
            : unit
        ),
        attackMode: false,
        targetUnitId: undefined,
        targetSegmentId: undefined,
        selectedWeaponId: undefined,
        attackableTiles: []
      };
      
      // Add the log entry with the attack result
      return addLogEntry(updatedState, resultMessage);
    }
  } else {
    resultMessage = `${attacker.name} attacks ${defender.name} with ${weapon.name} but misses! ` +
      `(Roll: ${diceRoll} + ${attackerPilot?.aggression || 0} - ${weapon.difficulty} = ${attackRoll} vs ${defenseTarget})`;
  
    // Exit attack mode without applying damage
    const updatedState = {
      ...state,
      attackMode: false,
      targetUnitId: undefined,
      targetSegmentId: undefined,
      selectedWeaponId: undefined,
      attackableTiles: []
    };
    
    // Add the log entry with the attack result
    return addLogEntry(updatedState, resultMessage);
  }
}

// Handle entering special move mode
export function handleEnterSpecialMoveMode(state: GameState, action: GameAction): GameState {
  if (action.type !== 'ENTER_SPECIAL_MOVE_MODE') return state;
  
  // Find the unit
  const unit = state.units.find(unit => unit.id === action.unitId);
  if (!unit || !unit.position) {
    return state;
  }
  
  let specialMoves: SpecialMove[] = [];
  
  // Get the special moves based on source type (unit or pilot)
  if (action.sourceType === 'unit') {
    specialMoves = unit.specialMoves;
  } else if (action.sourceType === 'pilot' && unit.pilotId) {
    const pilot = state.pilots.find(p => p.id === unit.pilotId);
    if (pilot) {
      specialMoves = pilot.specialMoves;
    }
  }
  
  // If no special moves are available, don't enter special move mode
  if (specialMoves.length === 0) {
    return addLogEntry(state, `${unit.name} has no ${action.sourceType} special moves available.`);
  }
  
  // Default to first special move for calculating initial targetable tiles
  const defaultSpecialMove = specialMoves[0];
  if (!defaultSpecialMove) {
    console.error("No special moves available for unit");
    return {
      ...state,
      specialMoveMode: true,
      selectedUnitId: action.unitId,
      targetUnitId: undefined,
      targetSegmentId: undefined,
      selectedSpecialMoveId: undefined,
      targetableTiles: []
    };
  }
  
  // Calculate targetable tiles based on special move targeting and range
  const { x: q, y: r, facing } = unit.position;
  
  // Use try-catch to prevent crashes if function call fails
  let targetableTiles = [];
  try {
    targetableTiles = getSpecialMoveTargets(
      q,
      r,
      facing,
      defaultSpecialMove.targeting,
      defaultSpecialMove.range
    );
  } catch (error) {
    console.error("Error calculating targetable tiles:", error);
    // Continue with empty targetable tiles
  }
  
  const specialMoveState = {
    ...state,
    specialMoveMode: true,
    selectedUnitId: action.unitId,
    targetUnitId: undefined,
    targetSegmentId: undefined,
    selectedSpecialMoveId: defaultSpecialMove.id,
    targetableTiles
  };
  
  return addLogEntry(specialMoveState, `${unit.name} prepares to use a special move.`);
}

// Handle exiting special move mode
export function handleExitSpecialMoveMode(state: GameState, action: GameAction): GameState {
  return {
    ...state,
    specialMoveMode: false,
    targetUnitId: undefined,
    targetSegmentId: undefined,
    selectedSpecialMoveId: undefined,
    targetableTiles: []
  };
}

// Handle selection of a special move
export function handleSelectSpecialMove(state: GameState, action: GameAction): GameState {
  if (action.type !== 'SELECT_SPECIAL_MOVE') return state;
  
  // Find the selected unit
  const unit = state.units.find(unit => unit.id === state.selectedUnitId);
  if (!unit || !unit.position) {
    return {
      ...state,
      selectedSpecialMoveId: action.moveId,
      targetableTiles: []
    };
  }
  
  // Find the special move in either unit moves or pilot moves
  let selectedMove: SpecialMove | undefined = unit.specialMoves.find(move => move.id === action.moveId);
  
  // If not found in unit moves, check pilot moves
  if (!selectedMove && unit.pilotId) {
    const pilot = state.pilots.find(p => p.id === unit.pilotId);
    if (pilot) {
      selectedMove = pilot.specialMoves.find(move => move.id === action.moveId);
    }
  }
  
  if (!selectedMove) {
    return {
      ...state,
      selectedSpecialMoveId: action.moveId,
      targetableTiles: []
    };
  }
  
  // Calculate targetable tiles based on special move
  const { x: q, y: r, facing } = unit.position;
  
  // Use try-catch to prevent crashes if function call fails
  let targetableTiles = [];
  try {
    targetableTiles = getSpecialMoveTargets(
      q,
      r,
      facing,
      selectedMove.targeting,
      selectedMove.range
    );
  } catch (error) {
    console.error("Error calculating targetable tiles:", error);
    // Continue with empty targetable tiles
  }
  
  return {
    ...state,
    selectedSpecialMoveId: action.moveId,
    targetableTiles
  };
}

// Modified special move execution to handle segments
export function handleExecuteSpecialMove(state: GameState, action: GameAction): GameState {
  // Validate that we have needed values
  if (!state.selectedUnitId || !state.selectedSpecialMoveId) {
    return addErrorEntry(state, "Missing unit or special move selection");
  }
  
  const sourceUnit = state.units.find(unit => unit.id === state.selectedUnitId);
  if (!sourceUnit) {
    return addErrorEntry(state, "Selected unit not found");
  }
  
  // Find the special move in either unit moves or pilot moves
  let selectedMove: SpecialMove | undefined;
  let moveSource = 'unit';
  
  try {
    // First check unit special moves
    selectedMove = sourceUnit.specialMoves.find(
      move => move.id === state.selectedSpecialMoveId
    );
    
    // If not found in unit moves, check pilot moves
    if (!selectedMove && sourceUnit.pilotId) {
      const pilot = state.pilots.find(p => p.id === sourceUnit.pilotId);
      if (pilot) {
        selectedMove = pilot.specialMoves.find(move => move.id === state.selectedSpecialMoveId);
        if (selectedMove) {
          moveSource = 'pilot';
        }
      }
    }
  } catch (error) {
    console.error("Error finding special move:", error);
    return addErrorEntry(state, "Error finding special move");
  }
  
  if (!selectedMove) {
    return addErrorEntry(state, "Special move not found");
  }
  
  // Check if the move is on cooldown
  if (selectedMove.currentCooldown > 0) {
    return addErrorEntry(
      state, 
      `${selectedMove.name} is on cooldown for ${selectedMove.currentCooldown} more turns.`
    );
  }
  
  // Target validation based on targeting type
  let validTarget = true;
  let target: Unit | undefined;
  
  if (state.targetUnitId) {
    target = state.units.find(unit => unit.id === state.targetUnitId);
    if (!target) {
      validTarget = false;
    } else if (selectedMove.targeting === 'ally' && target.id !== sourceUnit.id) {
      // For ally targeting, unit must be an ally (for now, this means the same unit)
      validTarget = false;
    } else if (selectedMove.targeting === 'enemy' && target.id === sourceUnit.id) {
      // For enemy targeting, unit cannot be self
      validTarget = false;
    }
  } else if (selectedMove.targeting !== 'self' && selectedMove.targeting !== 'area') {
    // If no target is selected but the move requires one, that's an error
    validTarget = false;
  }
  
  if (!validTarget) {
    return addErrorEntry(state, `Invalid target for ${selectedMove.name}.`);
  }
  
  // Process the special move effects based on effect type
  let updatedState = {
    ...state,
    specialMoveMode: false,
    targetUnitId: undefined,
    targetSegmentId: undefined,
    selectedSpecialMoveId: undefined,
    targetableTiles: []
  };
  
  // Apply cooldown to the move
  try {
    if (moveSource === 'unit') {
      updatedState = {
        ...updatedState,
        units: updatedState.units.map(unit => 
          unit.id === sourceUnit.id
            ? {
                ...unit,
                specialMoves: unit.specialMoves.map(move =>
                  move.id === selectedMove?.id
                    ? { ...move, currentCooldown: selectedMove.cooldown }
                    : move
                )
              }
            : unit
        )
      };
    } else if (moveSource === 'pilot' && sourceUnit.pilotId) {
      updatedState = {
        ...updatedState,
        pilots: updatedState.pilots.map(pilot => 
          pilot.id === sourceUnit.pilotId
            ? {
                ...pilot,
                specialMoves: pilot.specialMoves.map(move =>
                  move.id === selectedMove?.id
                    ? { ...move, currentCooldown: selectedMove.cooldown }
                    : move
                )
              }
            : pilot
        )
      };
    }
  } catch (error) {
    console.error("Error applying cooldown:", error);
    // Continue with the game state update even if cooldown application fails
  }
  
  // Apply effects based on move type
  switch (selectedMove.effect) {
    case 'damage': {
      // For damage moves targeting a specific enemy
      if (selectedMove.targeting === 'enemy' && target) {
        // Determine which segment to damage (if targeting segments)
        const targetSegment = state.targetSegmentId && target.segments.length > 0
          ? target.segments.find(s => s.id === state.targetSegmentId)
          : target.segments.length > 0 
            ? target.segments[Math.floor(Math.random() * target.segments.length)] // Random segment
            : null;
            
        // Use the same combat calculation as regular attacks
        const sourceUnitPilot = sourceUnit.pilotId ? state.pilots.find(p => p.id === sourceUnit.pilotId) : null;
        const targetPilot = target.pilotId ? state.pilots.find(p => p.id === target.pilotId) : null;
        
        // For special moves, use base values
        const moveForce = 3;
        const movePenetration = 2;
        const moveDifficulty = 1;
        
        // Calculate attack roll
        const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2d6
        const attackRoll = diceRoll + (sourceUnitPilot?.aggression || 0) - moveDifficulty;
        
        // Calculate defense target
        const defenseTarget = (targetPilot?.preservation || 0) + target.agility;
        
        // Check if attack hits
        const attackHits = attackRoll > defenseTarget;
        
        let damageAmount = 0;
        let resultMessage = "";
        
        if (attackHits) {
          // Calculate damage components
          const forceComponent = Math.max(0, moveForce - Math.floor(target.mass / 2));
          const penetrationComponent = targetSegment
            ? Math.max(0, movePenetration - targetSegment.armor)
            : Math.max(0, movePenetration - target.armor);
            
          damageAmount = forceComponent + penetrationComponent;
          
          if (targetSegment) {
            resultMessage = `${sourceUnit.name} uses ${selectedMove.name} on ${target.name}'s ${targetSegment.name} and hits! ` +
              `(Roll: ${diceRoll} + ${sourceUnitPilot?.aggression || 0} - ${moveDifficulty} = ${attackRoll} vs ${defenseTarget}) ` +
              `Dealing ${damageAmount} damage!`;
          } else {
            resultMessage = `${sourceUnit.name} uses ${selectedMove.name} on ${target.name} and hits! ` +
              `(Roll: ${diceRoll} + ${sourceUnitPilot?.aggression || 0} - ${moveDifficulty} = ${attackRoll} vs ${defenseTarget}) ` +
              `Dealing ${damageAmount} damage!`;
          }
        } else {
          resultMessage = `${sourceUnit.name} uses ${selectedMove.name} on ${target.name} but misses! ` +
            `(Roll: ${diceRoll} + ${sourceUnitPilot?.aggression || 0} - ${moveDifficulty} = ${attackRoll} vs ${defenseTarget})`;
        }
        
        // Apply damage if it hit
        if (attackHits) {
          if (targetSegment) {
            // Update segments and check subsystems
            let updatedSegments = target.segments.map(segment => 
              segment.id === targetSegment.id
                ? {
                    ...segment,
                    durability: Math.max(0, segment.durability - damageAmount)
                  }
                : segment
            );
            
            // Check if any subsystems in the segment are now damaged
            const subsystemsInSegment = target.subsystems.filter(s => 
              targetSegment.subsystemIds.includes(s.id)
            );
            
            let updatedSubsystems = [...target.subsystems];
            const newDurability = Math.max(0, targetSegment.durability - damageAmount);
            const durabilityPercentage = (newDurability / targetSegment.maxDurability) * 100;
            
            for (const subsystem of subsystemsInSegment) {
              if (subsystem.functional && durabilityPercentage < subsystem.durabilityThreshold) {
                // Update the subsystem to non-functional
                updatedSubsystems = updatedSubsystems.map(s => 
                  s.id === subsystem.id ? { ...s, functional: false } : s
                );
                
                // Add to result message
                resultMessage += ` ${target.name}'s ${subsystem.name} subsystem is damaged!`;
              }
            }
            
            updatedState = {
              ...updatedState,
              units: updatedState.units.map(unit =>
                unit.id === target.id
                  ? {
                      ...unit,
                      segments: updatedSegments,
                      subsystems: updatedSubsystems
                    }
                  : unit
              )
            };
          } else if (target.durability) {
            // Apply damage to overall durability
            updatedState = {
              ...updatedState,
              units: updatedState.units.map(unit =>
                unit.id === target.id && unit.durability
                  ? {
                      ...unit,
                      durability: {
                        ...unit.durability,
                        current: Math.max(0, unit.durability.current - damageAmount)
                      }
                    }
                  : unit
              )
            };
          }
        }
        
        return addLogEntry(updatedState, resultMessage);
      }
      
      // For area damage
      if (selectedMove.targeting === 'area') {
        // Find all units in targetable tiles
        const unitsInArea = state.units.filter(unit => 
          unit.position && state.targetableTiles.some(
            tile => tile.q === unit.position?.x && tile.r === unit.position?.y
          ) && unit.id !== sourceUnit.id // Don't damage self with area attacks
        );
        
        if (unitsInArea.length === 0) {
          return addLogEntry(
            updatedState, 
            `${sourceUnit.name} uses ${selectedMove.name}, but there are no targets in the area.`
          );
        }
        
        // For area attacks, use lower force and penetration values
        const moveForce = 2; 
        const movePenetration = 1;
        
        // Roll just once for an area attack
        const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2d6
        const sourceUnitPilot = sourceUnit.pilotId ? state.pilots.find(p => p.id === sourceUnit.pilotId) : null;
        const attackRoll = diceRoll + (sourceUnitPilot?.aggression || 0) - 0; // Area attacks have no difficulty
        
        // Process each unit in the area
        let hitCount = 0;
        const hitMessages: string[] = [];
        
        updatedState = {
          ...updatedState,
          units: updatedState.units.map(unit => {
            // If unit is in the affected area
            if (unitsInArea.some(areaUnit => areaUnit.id === unit.id)) {
              const targetPilot = unit.pilotId ? state.pilots.find(p => p.id === unit.pilotId) : null;
              const defenseTarget = (targetPilot?.preservation || 0) + unit.agility;
              
              // Check if this specific unit is hit
              const unitIsHit = attackRoll > defenseTarget;
              
              if (unitIsHit) {
                hitCount++;
                
                // If unit has segments, damage a random segment
                if (unit.segments.length > 0) {
                  const randomSegment = unit.segments[Math.floor(Math.random() * unit.segments.length)];
                  const forceComponent = Math.max(0, moveForce - Math.floor(unit.mass / 2));
                  const penetrationComponent = Math.max(0, movePenetration - randomSegment.armor);
                  const segmentDamage = forceComponent + penetrationComponent;
                  
                  hitMessages.push(`${unit.name}'s ${randomSegment.name} took ${segmentDamage} damage`);
                  
                  // Update segment durability
                  const updatedSegments = unit.segments.map(segment => 
                    segment.id === randomSegment.id
                      ? {
                          ...segment,
                          durability: Math.max(0, segment.durability - segmentDamage)
                        }
                      : segment
                  );
                  
                  // Check subsystems
                  const newDurability = Math.max(0, randomSegment.durability - segmentDamage);
                  const durabilityPercentage = (newDurability / randomSegment.maxDurability) * 100;
                  
                  const updatedSubsystems = unit.subsystems.map(subsystem => {
                    if (randomSegment.subsystemIds.includes(subsystem.id) && 
                        subsystem.functional && 
                        durabilityPercentage < subsystem.durabilityThreshold) {
                      hitMessages.push(`${unit.name}'s ${subsystem.name} subsystem was damaged`);
                      return { ...subsystem, functional: false };
                    }
                    return subsystem;
                  });
                  
                  return {
                    ...unit,
                    segments: updatedSegments,
                    subsystems: updatedSubsystems
                  };
                } 
                // Otherwise damage overall durability
                else if (unit.durability) {
                  // Calculate damage for this specific unit
                  const forceComponent = Math.max(0, moveForce - Math.floor(unit.mass / 2));
                  const penetrationComponent = Math.max(0, movePenetration - unit.armor);
                  const unitDamage = forceComponent + penetrationComponent;
                  
                  hitMessages.push(`${unit.name} took ${unitDamage} damage`);
                  
                  // Apply damage
                  return {
                    ...unit,
                    durability: {
                      ...unit.durability,
                      current: Math.max(0, unit.durability.current - unitDamage)
                    }
                  };
                }
              }
            }
            return unit;
          })
        };
        
        let resultMessage = `${sourceUnit.name} uses ${selectedMove.name}, hitting ${hitCount} out of ${unitsInArea.length} targets! (Roll: ${diceRoll} + ${sourceUnitPilot?.aggression || 0} = ${attackRoll})`;
        
        // Add hit details if there are any
        if (hitMessages.length > 0) {
          resultMessage += ` Details: ${hitMessages.join(', ')}.`;
        }
        
        return addLogEntry(updatedState, resultMessage);
      }
      break;
    }
    
    case 'defense': {
      // For defensive moves, typically self-targeted
      if (selectedMove.targeting === 'self') {
        // Apply a temporary defensive buff
        // For now, we'll just add a log message
        return addLogEntry(
          updatedState, 
          `${sourceUnit.name} uses ${selectedMove.name}, taking a defensive stance.`
        );
      }
      break;
    }
    
    case 'utility': {
      // For utility moves that apply status effects
      if (selectedMove.name === 'Take Aim' && selectedMove.targeting === 'self') {
        // Apply the 'prone' status to the unit
        updatedState = {
          ...updatedState,
          units: updatedState.units.map(unit =>
            unit.id === sourceUnit.id
              ? {
                  ...unit,
                  status: {
                    ...unit.status,
                    prone: true
                  }
                }
              : unit
          )
        };
        
        return addLogEntry(
          updatedState, 
          `${sourceUnit.name} takes aim, going prone to improve accuracy.`
        );
      }
      
      if (selectedMove.name === 'Roar' && selectedMove.targeting === 'area') {
        // Find all enemy units in targetable tiles
        const unitsInArea = state.units.filter(unit => 
          unit.position && state.targetableTiles.some(
            tile => tile.q === unit.position?.x && tile.r === unit.position?.y
          ) && unit.id !== sourceUnit.id
        );
        
        if (unitsInArea.length === 0) {
          return addLogEntry(
            updatedState, 
            `${sourceUnit.name} uses ${selectedMove.name}, but there are no targets in the area.`
          );
        }
        
        // Apply the 'dazed' status to affected units
        updatedState = {
          ...updatedState,
          units: updatedState.units.map(unit =>
            unitsInArea.some(areaUnit => areaUnit.id === unit.id)
              ? {
                  ...unit,
                  status: {
                    ...unit.status,
                    dazed: true
                  }
                }
              : unit
          )
        };
        
        return addLogEntry(
          updatedState, 
          `${sourceUnit.name} lets out a terrifying roar, dazing ${unitsInArea.length} nearby units!`
        );
      }
      break;
    }
    
    case 'healing': {
      // For healing moves
      if (selectedMove.targeting === 'self' || (selectedMove.targeting === 'ally' && target)) {
        const healTarget = selectedMove.targeting === 'self' ? sourceUnit : target;
        const healAmount = 5; // Base healing amount
        
        // If target has segments, heal a random damaged segment or all segments partially
        if (healTarget && healTarget.segments.length > 0) {
          // Find damaged segments
          const damagedSegments = healTarget.segments.filter(s => s.durability < s.maxDurability);
          
          if (damagedSegments.length > 0) {
            // Heal all segments partially
            const updatedSegments = healTarget.segments.map(segment => ({
              ...segment,
              durability: Math.min(segment.maxDurability, segment.durability + Math.ceil(healAmount / damagedSegments.length))
            }));
            
            updatedState = {
              ...updatedState,
              units: updatedState.units.map(unit =>
                unit.id === healTarget.id
                  ? {
                      ...unit,
                      segments: updatedSegments
                    }
                  : unit
              )
            };
            
            return addLogEntry(
              updatedState, 
              `${sourceUnit.name} uses ${selectedMove.name}, repairing damage to ${
                selectedMove.targeting === 'self' ? 'its segments' : `${healTarget.name}'s segments`
              }.`
            );
          }
        } 
        // Otherwise heal overall durability
        else if (healTarget && healTarget.durability) {
          updatedState = {
            ...updatedState,
            units: updatedState.units.map(unit =>
              unit.id === healTarget.id && unit.durability
                ? {
                    ...unit,
                    durability: {
                      ...unit.durability,
                      current: Math.min(
                        unit.durability.max, 
                        unit.durability.current + healAmount
                      )
                    }
                  }
                : unit
            )
          };
          
          return addLogEntry(
            updatedState, 
            `${sourceUnit.name} uses ${selectedMove.name}, healing ${
              selectedMove.targeting === 'self' ? 'itself' : healTarget.name
            } for ${healAmount} durability.`
          );
        }
      }
      break;
    }
    
    case 'buff': {
      // For buff moves like 'Focus'
      if (selectedMove.name === 'Focus' && selectedMove.targeting === 'self') {
        // For now, just add a log message
        return addLogEntry(
          updatedState, 
          `${sourceUnit.name} focuses, improving their next attack accuracy.`
        );
      }
      break;
    }
  }
  
  // Default case if no specific effect handling matched
  return addLogEntry(
    updatedState, 
    `${sourceUnit.name} uses ${selectedMove.name}!`
  );
}