# Combat System V2 Implementation

This document summarizes the changes made to implement the new combat system as specified in combatv2.md.

## Data Model Changes

1. Added new weapon types: 'impact', 'bladed', and 'ballistic'
2. Updated Weapon interface to include new damage properties:
   - edge - Cutting damage for bladed weapons
   - power - Secondary force for bladed weapons
   - precision - Used for critical hits with bladed weapons
3. Added wounds to Unit model to track structural damage that reduces effective armor
4. Added precision to Unit model as a new combat stat (capped by pilot aggression)

## Combat System Changes

1. New attack resolution:
   - Attack roll is now 1d6 + Precision (capped by pilot Aggression)
   - Defense is Agility (capped by pilot Preservation) + Weapon Difficulty

2. New damage types:
   - **Impact:** Force damage reduced by mass/2, chance to cause wounds based on Force/Armor ratio, and status effects
   - **Bladed:** Edge damage that can cause critical hits or regular cuts based on success margin + precision/power vs armor
   - **Ballistic:** Penetration damage reduced by armor/2, with chance to damage subsystems

3. Grapple mechanics:
   - Now uses 2*Mass + Agility + 1d6 for opposed checks

## Code Organization

1. Created a new utility module for damage calculation in `/src/utils/combat/damageTypes.ts`
2. Updated unitUtils.ts with helpers to create default units with the new properties
3. Modified the combat reducers to use the new damage system

## Helper Functions

1. Added utility functions to calculate different damage types:
   - `calculateImpactDamage`
   - `calculateBladedDamage`
   - `calculateBallisticDamage`
   
2. Added a `processDamage` function that selects the appropriate damage calculation based on weapon type

3. Created functions to generate default weapons of each type for testing

## Migration Path

1. Added backward compatibility in the handleAddUnit function to upgrade legacy units with new required properties
2. Enhanced the damage handling to track wounds separately from durability

## Next Steps

1. Update the UI to show wounds/structural damage
2. Add more weapon variety using the new damage types
3. Create specialized subsystems that interact with specific damage types
4. Implement weapon traits like armor-piercing, explosive, etc.