// combatReducers.ts - Combat-related reducers including attacks and special moves
import { GameState } from '../state';
import { GameAction } from '../actions';
import { addLogEntry, addErrorEntry } from './utils';
import { getAttackableTiles, getSpecialMoveTargets } from '../../../utils/hexCalculations';
import { SpecialMove, Unit, Subsystem } from '../models';
import { 
  calculateAttackSuccess, 
  processDamage,
  rollD6
} from '../../../utils/combat/damageTypes';

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

// Calculate if a subsystem is functional based on unit durability
function isSubsystemFunctional(
  subsystem: Subsystem,
  unit: Unit
): boolean {
  // Calculate unit durability percentage
  const durabilityPercentage = (unit.durability.current / unit.durability.max) * 100;
  // Check if durability is below the threshold
  return durabilityPercentage >= subsystem.durabilityThreshold;
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

  // Get pilot for attacker and defender
  const attackerPilot = attacker.pilotId ? state.pilots.find(p => p.id === attacker.pilotId) : null;
  const defenderPilot = defender.pilotId ? state.pilots.find(p => p.id === defender.pilotId) : null;
  
  // Use the new attack calculation system
  const attackerAggression = attackerPilot?.aggression;
  const defenderPreservation = defenderPilot?.preservation;
  
  // Calculate if attack hits and by how much (success margin)
  const attackResult = calculateAttackSuccess(
    attacker, 
    defender, 
    weapon, 
    attackerAggression, 
    defenderPreservation
  );
  
  let resultMessage = "";
  
  if (attackResult.success) {
    // Process damage based on weapon type
    const damageResult = processDamage(weapon, attacker, defender, attackResult);
    
    if (!damageResult) {
      return addErrorEntry(state, "Error processing damage");
    }
    
    // Create the hit message
    resultMessage = `${attacker.name} attacks ${defender.name} with ${weapon.name} and hits! ` +
      `(Roll: ${attackResult.roll} + ${attacker.precision} = ${attackResult.attackValue} vs ${attackResult.defenseValue}) ` +
      damageResult.description;
    
    // Calculate new durability
    const newDurability = Math.max(0, defender.durability.current - damageResult.damage);
    
    // Update subsystems if there was subsystem damage
    let updatedSubsystems = [...defender.subsystems];
    if (damageResult.subsystemDamage) {
      // Check for subsystem damage based on durability percentage
      const durabilityPercentage = (newDurability / defender.durability.max) * 100;
      
      // Mark subsystems as damaged when below their threshold
      updatedSubsystems = defender.subsystems.map(subsystem => {
        if (subsystem.functional && durabilityPercentage < subsystem.durabilityThreshold) {
          resultMessage += ` ${defender.name}'s ${subsystem.name} subsystem is damaged!`;
          return { ...subsystem, functional: false };
        }
        return subsystem;
      });
    }
    
    // Update status effects
    let updatedStatus = { ...defender.status };
    if (damageResult.statusEffect) {
      updatedStatus = { 
        ...updatedStatus, 
        [damageResult.statusEffect]: true 
      };
    }
    
    // Update wounds
    const newWounds = defender.wounds + damageResult.newWounds;
    
    // Update the units with the new state
    const updatedState = {
      ...state,
      units: state.units.map(unit =>
        unit.id === defender.id
          ? {
              ...unit,
              durability: {
                ...unit.durability,
                current: newDurability
              },
              wounds: newWounds,
              subsystems: updatedSubsystems,
              status: updatedStatus
            }
          : unit
      ),
      attackMode: false,
      targetUnitId: undefined,
      selectedWeaponId: undefined,
      attackableTiles: []
    };
    
    // Add the log entry with the attack result
    return addLogEntry(updatedState, resultMessage);
  } else {
    // Miss message
    resultMessage = `${attacker.name} attacks ${defender.name} with ${weapon.name} but misses! ` +
      `(Roll: ${attackResult.roll} + ${attacker.precision} = ${attackResult.attackValue} vs ${attackResult.defenseValue})`;
  
    // Exit attack mode without applying damage
    const updatedState = {
      ...state,
      attackMode: false,
      targetUnitId: undefined,
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
  if (action.type !== 'EXECUTE_SPECIAL_MOVE') return state;

  // Check if we have a direct moveData provided (for built-in actions like grapple)
  if (action.moveData) {
    // Handle direct special move with provided data
    const sourceUnit = state.units.find(unit => unit.id === state.selectedUnitId);
    if (!sourceUnit) {
      return addErrorEntry(state, "Selected unit not found");
    }

    // Set up basic state with cleanup
    let updatedState = {
      ...state,
      specialMoveMode: false,
      targetUnitId: undefined,
      targetSegmentId: undefined,
      selectedSpecialMoveId: undefined,
      targetableTiles: []
    };

    // Handle built-in actions
    if (action.moveData.effect === 'buff' && action.moveData.name === 'Get Up!') {
      // Make sure the unit is actually downed
      if (!sourceUnit.status.downed) {
        return addLogEntry(state, `${sourceUnit.name} is not currently downed.`);
      }
      
      // Get Up! action - remove downed status
      updatedState = {
        ...updatedState,
        units: updatedState.units.map(unit =>
          unit.id === sourceUnit.id
            ? {
                ...unit,
                status: {
                  ...unit.status,
                  downed: false
                }
              }
            : unit
        )
      };
      
      return addLogEntry(updatedState, `${sourceUnit.name} gets back up, recovering from downed status!`);
    }
    else if (action.moveData.effect === 'grapple' && action.moveData.name === 'Grapple Enemy') {
      // Grapple Enemy action
      const target = state.units.find(unit => unit.id === state.targetUnitId);
      if (!target) {
        return addLogEntry(updatedState, `No target selected for grapple action.`);
      }

      // Check if units are in the same tile (stacked)
      const sourcePos = sourceUnit.position;
      const targetPos = target.position;
      if (!sourcePos || !targetPos) {
        return addLogEntry(updatedState, `Both units must be on the field to grapple.`);
      }

      // Units must be in the same hex (stacked)
      if (sourcePos.x !== targetPos.x || sourcePos.y !== targetPos.y) {
        return addLogEntry(updatedState, `${target.name} must be in the same tile as ${sourceUnit.name} to grapple.`);
      }

      // Check if source unit is already grappling or being grappled
      if (sourceUnit.status.grappled) {
        return addLogEntry(updatedState, `${sourceUnit.name} is already engaged in a grapple!`);
      }
      
      // Roll opposed grapple check - 2*Mass + Agility + 1d6
      const attackerRoll = (2 * sourceUnit.mass) + sourceUnit.agility + rollD6();
      const defenderRoll = (2 * target.mass) + target.agility + rollD6();
      
      // Check if target is already grappled
      if (target.status.grappled) {
        // If target is grappled, try to down them
        if (attackerRoll > defenderRoll) {
          // Success - down the target and disengage
          updatedState = {
            ...updatedState,
            units: updatedState.units.map(unit => 
              unit.id === target.id
                ? {
                    ...unit,
                    status: {
                      ...unit.status,
                      grappled: false,
                      downed: true
                    }
                  }
                : unit
            )
          };
          
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} overpowers the grappled ${target.name} (${attackerRoll} vs ${defenderRoll}), downing them and breaking the grapple!`
          );
        } else {
          // Failed to down them
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} tries to overpower the grappled ${target.name}, but fails (${attackerRoll} vs ${defenderRoll}).`
          );
        }
      } else if (sourceUnit.status.grappled) {
        // Try to break free from a grapple
        if (attackerRoll > defenderRoll) {
          // Success - break free
          updatedState = {
            ...updatedState,
            units: updatedState.units.map(unit => 
              unit.id === sourceUnit.id
                ? {
                    ...unit,
                    status: {
                      ...unit.status,
                      grappled: false
                    }
                  }
                : unit
            )
          };
          
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} successfully breaks free from ${target.name}'s grapple (${attackerRoll} vs ${defenderRoll})!`
          );
        } else {
          // Failed to break free
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} struggles to break free from ${target.name}'s grapple, but fails (${attackerRoll} vs ${defenderRoll}).`
          );
        }
      } else {
        // Attempt a new grapple
        if (attackerRoll > defenderRoll) {
          // Success - grapple the target
          updatedState = {
            ...updatedState,
            units: updatedState.units.map(unit => 
              unit.id === target.id
                ? {
                    ...unit,
                    status: {
                      ...unit.status,
                      grappled: true
                    }
                  }
                : unit
            )
          };
          
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} successfully grapples ${target.name} (${attackerRoll} vs ${defenderRoll})! ${target.name} is now grappled and certain weapons/systems are restricted.`
          );
        } else {
          // Failed to grapple
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} attempts to grapple ${target.name}, but fails to get a hold (${attackerRoll} vs ${defenderRoll}).`
          );
        }
      }
    }

    // If we reach here, it's an unhandled direct action
    return addLogEntry(updatedState, `Unhandled direct special action: ${action.moveData.name}`);
  }
  
  // If no direct moveData, proceed with normal special move handling
  // Validate that we have needed values for normal special move
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
            ? target.segments.find(s => s.type === 'TORSO') || // Default to TORSO/core segment
              target.segments[Math.floor(Math.random() * target.segments.length)] // Fallback to random if no TORSO
            : null;
            
        // Use the same combat calculation as regular attacks
        const sourceUnitPilot = sourceUnit.pilotId ? state.pilots.find(p => p.id === sourceUnit.pilotId) : null;
        const targetPilot = target.pilotId ? state.pilots.find(p => p.id === target.pilotId) : null;
        
        // For special moves, use base values
        const moveForce = 3;
        const movePenetration = 2;
        const moveDifficulty = 1;
        
        // Check if attacking a non-core segment and apply modifier
        const isNonCoreTarget = targetSegment && targetSegment.type !== 'TORSO';
        const segmentDifficultyModifier = isNonCoreTarget ? 3 : 0;
        
        // Calculate attack roll with segment difficulty modifier
        const diceRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2d6
        const attackRoll = diceRoll + (sourceUnitPilot?.aggression || 0) - moveDifficulty - segmentDifficultyModifier;
        
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
              `(Roll: ${diceRoll} + ${sourceUnitPilot?.aggression || 0} - ${moveDifficulty}${isNonCoreTarget ? ` - ${segmentDifficultyModifier} (non-core)` : ''} = ${attackRoll} vs ${defenseTarget}) ` +
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
      
      // Get Up! move to remove downed status
      if (selectedMove.name === 'Get Up!' && selectedMove.targeting === 'self') {
        // Check if unit is downed
        if (!sourceUnit.status.downed) {
          return addLogEntry(
            updatedState, 
            `${sourceUnit.name} attempts to get up, but is not currently downed.`
          );
        }
        
        // Remove downed status
        updatedState = {
          ...updatedState,
          units: updatedState.units.map(unit => 
            unit.id === sourceUnit.id
              ? {
                  ...unit,
                  status: {
                    ...unit.status,
                    downed: false
                  }
                }
              : unit
          )
        };
        
        return addLogEntry(
          updatedState, 
          `${sourceUnit.name} gets back up, recovering from downed status!`
        );
      }
      break;
    }
    
    case 'grapple': {
      // Grapple Enemy move implementation
      if (selectedMove.name === 'Grapple Enemy' && target) {
        // Check if unit is already grappling or being grappled
        if (sourceUnit.status.grappled) {
          return addLogEntry(
            updatedState,
            `${sourceUnit.name} attempts to grapple ${target.name}, but is already engaged in a grapple!`
          );
        }
        
        // Roll opposed Mass check (1d6 + mass)
        const attackerRoll = Math.floor(Math.random() * 6) + 1 + sourceUnit.mass;
        const defenderRoll = Math.floor(Math.random() * 6) + 1 + target.mass;
        
        // Check if target is already grappled
        if (target.status.grappled) {
          // If target is grappled, try to down them
          if (attackerRoll > defenderRoll) {
            // Success - down the target and disengage
            updatedState = {
              ...updatedState,
              units: updatedState.units.map(unit => 
                unit.id === target.id
                  ? {
                      ...unit,
                      status: {
                        ...unit.status,
                        grappled: false,
                        downed: true
                      }
                    }
                  : unit
              )
            };
            
            return addLogEntry(
              updatedState,
              `${sourceUnit.name} overpowers the grappled ${target.name} (${attackerRoll} vs ${defenderRoll}), downing them and breaking the grapple!`
            );
          } else {
            // Failed to down them
            return addLogEntry(
              updatedState,
              `${sourceUnit.name} tries to overpower the grappled ${target.name}, but fails (${attackerRoll} vs ${defenderRoll}).`
            );
          }
        } else if (sourceUnit.status.grappled) {
          // Try to break free from a grapple
          if (attackerRoll > defenderRoll) {
            // Success - break free
            updatedState = {
              ...updatedState,
              units: updatedState.units.map(unit => 
                unit.id === sourceUnit.id
                  ? {
                      ...unit,
                      status: {
                        ...unit.status,
                        grappled: false
                      }
                    }
                  : unit
              )
            };
            
            return addLogEntry(
              updatedState,
              `${sourceUnit.name} successfully breaks free from ${target.name}'s grapple (${attackerRoll} vs ${defenderRoll})!`
            );
          } else {
            // Failed to break free
            return addLogEntry(
              updatedState,
              `${sourceUnit.name} struggles to break free from ${target.name}'s grapple, but fails (${attackerRoll} vs ${defenderRoll}).`
            );
          }
        } else {
          // Attempt a new grapple
          if (attackerRoll > defenderRoll) {
            // Success - grapple the target
            updatedState = {
              ...updatedState,
              units: updatedState.units.map(unit => 
                unit.id === target.id
                  ? {
                      ...unit,
                      status: {
                        ...unit.status,
                        grappled: true
                      }
                    }
                  : unit
              )
            };
            
            return addLogEntry(
              updatedState,
              `${sourceUnit.name} successfully grapples ${target.name} (${attackerRoll} vs ${defenderRoll})! ${target.name} is now grappled and certain weapons/systems are restricted.`
            );
          } else {
            // Failed to grapple
            return addLogEntry(
              updatedState,
              `${sourceUnit.name} attempts to grapple ${target.name}, but fails to get a hold (${attackerRoll} vs ${defenderRoll}).`
            );
          }
        }
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