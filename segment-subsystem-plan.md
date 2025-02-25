# Segmentation and Subsystem Implementation Plan

## Overview
We will implement two new systems to enhance the combat mechanics:
1. **Segments**: Major structural components with independent durability pools
2. **Subsystems**: Functional components that provide capabilities/weapons, attached to segments

## Data Structure Changes

### 1. Types/Interfaces
- Create new interfaces for `Segment` and `Subsystem`
- Update `Mecha` interface to include segments and subsystems
- Update combat calculations to account for segment targeting

### 2. New Types

```typescript
interface Segment {
  id: string;
  name: string;
  type: SegmentType; // "HEAD" | "TORSO" | "ARM_LEFT" | "ARM_RIGHT" | "LEG_LEFT" | "LEG_RIGHT" | "TAIL" | etc.
  durability: number;
  maxDurability: number;
  armor: number;
  subsystems: string[]; // IDs of subsystems attached to this segment
}

interface Subsystem {
  id: string;
  name: string;
  type: SubsystemType; // "WEAPON" | "SENSOR" | "MOBILITY" | "SHIELD" | etc.
  functional: boolean;
  durabilityThreshold: number; // % of segment durability at which subsystem is damaged
  weaponId?: string; // If the subsystem is a weapon mount
  effect?: string; // Description of special effect when active
  description: string;
}

// Update Mecha interface
interface Mecha {
  // existing properties...
  segments: Segment[];
  subsystems: Subsystem[];
}
```

## UI Modifications

### 1. Combat Interface
- Update `HexTile` to show targeted segment
- Create a segment selection panel for targeting
- Add visual indicators for damaged segments/subsystems

### 2. Unit Display
- Update `DetailsPanel` to show segment information
- Add subsystem status indicators
- Create a visual mecha diagram showing segments and their status

### 3. Attack Panel
- Add segment targeting dropdown
- Update combat log to show segment/subsystem damage
- Show subsystem status changes

## Game Logic Changes

### 1. Combat System
- Modify damage application to target specific segments
- Implement subsystem damage when segment durability falls below threshold
- Add special effects for subsystem damage (movement reduction, accuracy loss, etc.)

### 2. Unit Creation/Management
- Add UI for assigning subsystems to segments
- Allow customization of segment durability and armor

## Implementation Steps

1. **Create/Update Type Definitions**
   - Create new type files for segments and subsystems
   - Update existing Mecha type

2. **Update State Management**
   - Modify reducers to handle segment damage
   - Add actions for targeting segments
   - Add subsystem status management

3. **UI Components**
   - Create segment selection interface
   - Update unit display to show segment health
   - Add subsystem status indicators

4. **Combat Logic**
   - Implement segment-specific damage calculations
   - Add subsystem failure logic
   - Modify combat effects based on damaged subsystems

5. **Testing & Refinement**
   - Test segment targeting
   - Verify subsystem failure conditions
   - Balance segment durability values

## Future Enhancements
- Critical hits that directly damage subsystems
- Repair mechanics for segments and subsystems
- Special abilities that target specific segments
- Segment-specific buffs/debuffs