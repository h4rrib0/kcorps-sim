// types.ts
export interface Position {
  x: number;
  y: number;
  facing: 0 | 60 | 120 | 180 | 240 | 300;
}

export interface Weapon {
  name: string;
  damage: number;
  penetration: number;
  difficulty: number;
  special?: string; // Special effects as text for GM reference
}

export interface Subsystem {
  name: string;
  type: 'Internal' | 'External' | 'Vulnerable';
  durability: number;
  status: 'Operational' | 'Damaged' | 'Destroyed';
  special?: string;
}

export interface Unit {
  id: string;
  name: string;
  position?: Position;
  durability: {
    current: number;
    max: number;
  };
  armor: number;
  agility: number;
  strength: number;
  weapons: Weapon[];
  subsystems: Subsystem[];
  status: {
    dazed?: boolean;
    downed?: boolean;
    grappled?: boolean;
    stunned?: boolean;
  };
}

export interface GameState {
  units: Unit[];
  selectedUnitId?: string;
  turn: number;
  phase: 'movement' | 'action' | 'end';
  initiativeOrder: string[]; // Array of unit IDs
  log: string[];
}

// actions.ts
export type GameAction = 
  | { type: 'SELECT_UNIT'; unitId: string }
  | { type: 'MOVE_UNIT'; unitId: string; position: Position }
  | { type: "MOVE_UNIT_FORWARD"; unitId: string }
  | { type: "MOVE_UNIT_BACKWARD"; unitId: string }
  | { type: 'DAMAGE_UNIT'; unitId: string; amount: number }
  | { type: 'APPLY_STATUS'; unitId: string; status: keyof Unit['status'] }
  | { type: 'REMOVE_STATUS'; unitId: string; status: keyof Unit['status'] }
  | { type: 'LOG_ACTION'; message: string }
  | { type: 'ADD_UNIT'; unit: Unit }
  | { type: 'PLACE_UNIT'; unitId: string; position: Position }
  | { type: 'UNPLACE_UNIT'; unitId: string }
  | { type: 'ROTATE_UNIT_CLOCKWISE'; unitId: string }
  | { type: 'ROTATE_UNIT_COUNTERCLOCKWISE'; unitId: string }
  | { type: 'NEXT_TURN' };

// reducer.ts
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_UNIT':
      return {
        ...state,
        selectedUnitId: action.unitId
      };

    case 'MOVE_UNIT':
      return {
        ...state,
        units: state.units.map(unit =>
          unit.id === action.unitId ? { ...unit, position: action.position } : unit
        )
      };

    case 'DAMAGE_UNIT':
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

    case 'ADD_UNIT':
      return {
        ...state,
        units: [...state.units, action.unit]
      };

    case 'PLACE_UNIT': {
      // Find the unit to be placed
      const unitToPlace = state.units.find(unit => unit.id === action.unitId);
      // Prevent re-placing if the unit already has a position
      if (unitToPlace && unitToPlace.position !== undefined) {
        return state;
      }
      return {
        ...state,
        units: state.units.map(unit =>
          unit.id === action.unitId ? { ...unit, position: action.position } : unit
        ),
        selectedUnitId: undefined // Unselect the unit once placed
      };
    }

    case 'UNPLACE_UNIT':
      return {
        ...state,
        units: state.units.map(unit =>
          unit.id === action.unitId ? { ...unit, position: undefined } : unit
        )
      };

    case 'ROTATE_UNIT_CLOCKWISE':
      return {
        ...state,
        units: state.units.map(unit =>
          unit.id === action.unitId
        ? {
            ...unit,
            position: unit.position
          ? {
              ...unit.position,
              facing: ((unit.position.facing + 60) % 360) as Position['facing']
            }
          : undefined
          }
        : unit
        )
      };

        case 'ROTATE_UNIT_COUNTERCLOCKWISE':
      return {
        ...state,
        units: state.units.map(unit =>
          unit.id === action.unitId
        ? {
            ...unit,
            position: unit.position
          ? {
              ...unit.position,
              facing: ((unit.position.facing + 300) % 360) as Position['facing']
            }
          : undefined
          }
        : unit
        )
      };
    case 'MOVE_UNIT_FORWARD': {
      const unit = state.units.find(u => u.id === action.unitId);
      if (!unit?.position) return state;

      let newX = unit.position.x;
      let newY = unit.position.y;

      switch (unit.position.facing) {
        case 0:
          newY = unit.position.y - 1;
          break;
        case 60:
          newX = unit.position.x + 1;
          newY = unit.position.y - 1;
          break;
        case 120:
          newX = unit.position.x + 1;
          // newY remains the same
          break;
        case 180:
          newY = unit.position.y + 1;
          break;
        case 240:
          newX = unit.position.x - 1;
          newY = unit.position.y + 1;
          break;
        case 300:
          newX = unit.position.x - 1;
          // newY remains the same
          break;
        default:
          break;
      }

      // Check if new position is within bounds (assuming grid positions 0-19)
      const isInBounds = true;

      return {
        ...state,
        units: state.units.map(u =>
          u.id === action.unitId
            ? {
                ...u,
                position: isInBounds
                  ? { ...unit.position, x: newX, y: newY }
                  : unit.position // Remain at current position if out of bounds
              }
            : u
        )
      };
    }

    default:
      return state;
  }
}