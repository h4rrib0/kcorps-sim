// damageTypes.ts - Combat damage calculation utilities
import { Weapon, Unit } from '../../components/types';

// Result interfaces for damage calculations
export interface DamageResult {
  damage: number;
  newWounds: number;
  subsystemDamage: boolean;
  statusEffect?: 'dazed' | 'downed';
  description: string;
}

export interface AttackResult {
  success: boolean;
  successMargin?: number;  // How much the attack succeeded by
  criticalHit?: boolean;
  damage?: number;
  statusEffect?: 'dazed' | 'downed';
  newWounds?: number;
  description: string;
}

export interface PenetratingDamageResult {
  subsystemDamaged: boolean;
  subsystemName?: string;
  description: string;
}

// Roll utilities
export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

// Get effective stats considering pilot caps
export function getEffectiveStats(unit: Unit, pilotAggression?: number, pilotPreservation?: number): { precision: number, agility: number } {
  // Apply pilot stat caps
  const effectivePrecision = pilotAggression !== undefined 
    ? Math.min(unit.precision, pilotAggression)
    : unit.precision;
    
  const effectiveAgility = pilotPreservation !== undefined
    ? Math.min(unit.agility, pilotPreservation)
    : unit.agility;
    
  return { precision: effectivePrecision, agility: effectiveAgility };
}

// Check if attack hits
export function calculateAttackSuccess(
  attacker: Unit, 
  defender: Unit,
  weapon: Weapon,
  attackerPilotAggression?: number,
  defenderPilotPreservation?: number
): { success: boolean, roll: number, attackValue: number, defenseValue: number, successMargin: number } {
  const { precision: effectivePrecision } = getEffectiveStats(attacker, attackerPilotAggression, undefined);
  const { agility: effectiveAgility } = getEffectiveStats(defender, undefined, defenderPilotPreservation);
  
  // Attack is 1d6 + Precision
  const diceRoll = rollD6();
  const attackValue = diceRoll + effectivePrecision;
  
  // Defense is Agility + Difficulty
  const defenseValue = effectiveAgility + weapon.difficulty;
  
  // Success margin for critical calculations
  const successMargin = attackValue - defenseValue;
  
  return {
    success: attackValue > defenseValue,
    roll: diceRoll,
    attackValue,
    defenseValue,
    successMargin
  };
}

// Impact damage calculation
export function calculateImpactDamage(
  weapon: Weapon,
  defender: Unit
): DamageResult {
  // Calculate force damage, reduced by mass
  const damage = Math.max(0, weapon.force - Math.floor(defender.mass / 2));
  
  // Check for status effects from impact
  let statusEffect: 'dazed' | 'downed' | undefined;
  let statusDescription = '';
  
  // Only attempt force impact effects if force exceeds mass
  if (weapon.force > defender.mass) {
    const forceExcess = weapon.force - defender.mass;
    const impactRoll = rollD6() + forceExcess;
    
    if (impactRoll >= 10) {
      statusEffect = 'downed';
      statusDescription = ' The impact knocks the target down!';
    } else if (impactRoll >= 7) {
      statusEffect = 'dazed';
      statusDescription = ' The impact dazes the target!';
    }
  }
  
  // Calculate wound chance (Force / Armor)
  const woundChance = defender.armor > 0 ? weapon.force / defender.armor : 1;
  
  // Initial wound (guaranteed if force > armor)
  let newWounds = 0;
  let woundDescription = '';
  
  // Check if unit already has maximum wounds
  const canAddWounds = defender.wounds < defender.armor;
  
  if (canAddWounds) {
    if (weapon.force > defender.armor) {
      newWounds = 1;
      woundDescription = ' The force creates a structural wound!';
      
      // Check if there's room for a second wound
      if (defender.wounds + 1 < defender.armor) {
        // Additional wound chance
        const additionalWoundChance = (weapon.force - defender.armor) / defender.armor;
        if (Math.random() < additionalWoundChance) {
          newWounds += 1;
          woundDescription = ' The force creates multiple structural wounds!';
        }
      }
    } else if (Math.random() < woundChance) {
      newWounds = 1;
      woundDescription = ' The impact creates a structural wound!';
    }
  } else {
    woundDescription = ' The unit cannot take any more structural wounds!';
  }
  
  return {
    damage,
    newWounds,
    subsystemDamage: false, // Impact doesn't directly damage subsystems
    statusEffect,
    description: `Impact force deals ${damage} damage.${woundDescription}${statusDescription}`
  };
}

// Bladed damage calculation
export function calculateBladedDamage(
  weapon: Weapon,
  defender: Unit,
  successMargin: number
): DamageResult {
  // Default values if edge/precision/power not specified
  const edge = weapon.edge || 0;
  const precision = weapon.precision || 0;
  const power = weapon.power || 0;
  
  // Effective armor (reduced by wounds)
  const effectiveArmor = Math.max(1, defender.armor - defender.wounds);
  
  let damage = 0;
  let newWounds = 0;
  let description = '';
  
  // Check if unit already has maximum wounds
  const canAddWounds = defender.wounds < defender.armor;
  
  // Critical hit check
  if ((successMargin + precision) > effectiveArmor) {
    // Double damage on critical hit
    damage = edge * 2;
    if (canAddWounds) {
      newWounds = 1;
      description = `Critical hit! Blade slips through a weak point for ${damage} damage and creates a structural wound!`;
    } else {
      description = `Critical hit! Blade slips through a weak point for ${damage} damage but cannot create more structural wounds!`;
    }
  }
  // Regular hit check
  else if ((successMargin + power) > effectiveArmor) {
    damage = edge;
    if (canAddWounds) {
      newWounds = 1;
      description = `Blade cuts through for ${damage} damage and creates a structural wound!`;
    } else {
      description = `Blade cuts through for ${damage} damage but cannot create more structural wounds!`;
    }
  }
  // Glancing blow, just apply power as impact
  else {
    damage = Math.max(0, power - Math.floor(defender.mass / 2));
    description = `Attack glances off armor but still applies ${damage} force damage!`;
  }
  
  return {
    damage,
    newWounds,
    subsystemDamage: false,
    description
  };
}

// Roll on penetrating damage table (subsystem damage)
export function rollPenetratingDamageEffect(
  defender: Unit
): PenetratingDamageResult {
  const functionalSubsystems = defender.subsystems.filter(s => s.functional);
  
  // If no functional subsystems, can't damage any
  if (functionalSubsystems.length === 0) {
    return {
      subsystemDamaged: false,
      description: "No functional subsystems to damage!"
    };
  }
  
  // Roll 2d6 for penetrating effect
  const roll = rollD6() + rollD6();
  
  // On 10+, damage a random subsystem
  if (roll >= 10) {
    // Select random subsystem
    const targetSubsystem = functionalSubsystems[Math.floor(Math.random() * functionalSubsystems.length)];
    
    return {
      subsystemDamaged: true,
      subsystemName: targetSubsystem.name,
      description: `Penetrating damage affects the ${targetSubsystem.name} subsystem!`
    };
  }
  
  return {
    subsystemDamaged: false,
    description: "Penetrating damage doesn't affect any critical systems."
  };
}

// Ballistic damage calculation
export function calculateBallisticDamage(
  weapon: Weapon,
  defender: Unit
): DamageResult {
  const penetration = weapon.penetration || 0;
  
  // Penetration damage reduced by armor/2
  const damage = Math.max(0, penetration - Math.floor(defender.armor / 2));
  
  // Penetration excess determines subsystem damage chance
  const penetrationExcess = Math.max(0, penetration - defender.armor);
  let subsystemDamage = false;
  let subsystemDescription = '';
  
  // Roll on penetrating damage table once for each point of excess penetration
  for (let i = 0; i < penetrationExcess; i++) {
    const penetrationResult = rollPenetratingDamageEffect(defender);
    if (penetrationResult.subsystemDamaged) {
      subsystemDamage = true;
      subsystemDescription += ` ${penetrationResult.description}`;
    }
  }
  
  return {
    damage,
    newWounds: 0, // Ballistic doesn't cause wounds by default
    subsystemDamage,
    description: `Penetrating rounds deal ${damage} damage.${subsystemDescription}`
  };
}

// Process damage based on weapon type
export function processDamage(
  weapon: Weapon, 
  attacker: Unit,
  defender: Unit,
  attackResult: { success: boolean, successMargin: number }
): DamageResult | null {
  if (!attackResult.success) {
    return null;
  }
  
  switch (weapon.type) {
    case 'impact':
      return calculateImpactDamage(weapon, defender);
    
    case 'bladed':
      return calculateBladedDamage(weapon, defender, attackResult.successMargin);
    
    case 'ballistic':
      return calculateBallisticDamage(weapon, defender);
    
    default:
      // Fallback to generic damage calculation
      const damage = Math.max(0, (weapon.force || 0) - Math.floor(defender.mass / 2));
      return {
        damage,
        newWounds: 0,
        subsystemDamage: false,
        description: `Weapon deals ${damage} generic damage.`
      };
  }
}