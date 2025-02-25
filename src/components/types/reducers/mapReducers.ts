// mapReducers.ts - Map-related reducers
import { GameState } from '../state';
import { GameAction } from '../actions';
import { v4 as uuidv4 } from 'uuid';

// Helper to get the current active map
const getCurrentMap = (state: GameState) => {
  const selectedMapId = state.selectedMapId || state.maps[0]?.id;
  return state.maps.find(map => map.id === selectedMapId);
};

// Reducer for map-related actions
export const mapReducers = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'ENTER_EDITOR_MODE':
      return {
        ...state,
        editorMode: true
      };

    case 'EXIT_EDITOR_MODE':
      return {
        ...state,
        editorMode: false,
        selectedTerrain: undefined
      };

    case 'SELECT_TERRAIN_TYPE':
      return {
        ...state,
        selectedTerrain: action.terrainType
      };

    case 'SET_TILE_TERRAIN': {
      // Must be in editor mode and have a selected map
      if (!state.editorMode || !state.selectedMapId) {
        return state;
      }

      const mapIndex = state.maps.findIndex(map => map.id === state.selectedMapId);
      if (mapIndex === -1) return state;

      // Create a copy of the current map
      const updatedMap = { ...state.maps[mapIndex] };
      
      // Create a copy of the terrain data
      const updatedTerrain = { ...updatedMap.terrain };
      
      // Set the new terrain for the tile
      const key = `${action.coord.q},${action.coord.r}`;
      updatedTerrain[key] = action.terrainType;
      
      // Update the map with the new terrain
      updatedMap.terrain = updatedTerrain;
      
      // Replace the map in the maps array
      const updatedMaps = [...state.maps];
      updatedMaps[mapIndex] = updatedMap;
      
      return {
        ...state,
        maps: updatedMaps
      };
    }

    case 'ADD_MAP': {
      // Create a new map with the given data and a unique ID
      const newMap = {
        ...action.map,
        id: action.map.id || uuidv4()
      };
      
      return {
        ...state,
        maps: [...state.maps, newMap],
        selectedMapId: newMap.id
      };
    }

    case 'UPDATE_MAP': {
      const mapIndex = state.maps.findIndex(map => map.id === action.mapId);
      if (mapIndex === -1) return state;
      
      // Create updated map
      const updatedMap = {
        ...state.maps[mapIndex],
        ...action.changes
      };
      
      // Replace in maps array
      const updatedMaps = [...state.maps];
      updatedMaps[mapIndex] = updatedMap;
      
      return {
        ...state,
        maps: updatedMaps
      };
    }

    case 'DELETE_MAP': {
      // Can't delete if it's the only map
      if (state.maps.length <= 1) {
        return state;
      }
      
      // Filter out the map to delete
      const updatedMaps = state.maps.filter(map => map.id !== action.mapId);
      
      // If we're deleting the currently selected map, select the first one
      let updatedSelectedMapId = state.selectedMapId;
      if (state.selectedMapId === action.mapId) {
        updatedSelectedMapId = updatedMaps[0].id;
      }
      
      return {
        ...state,
        maps: updatedMaps,
        selectedMapId: updatedSelectedMapId
      };
    }

    case 'SELECT_MAP': {
      // When changing maps, remove all units from the battlefield
      const unitsOffBoard = state.units.map(unit => ({
        ...unit,
        position: undefined  // Clear position to take unit off the board
      }));
      
      return {
        ...state,
        selectedMapId: action.mapId,
        units: unitsOffBoard,
        // Clear any active combat modes or selections
        attackMode: false,
        specialMoveMode: false,
        placementMode: false,
        segmentTargetingMode: false,
        selectedUnitId: undefined,
        targetUnitId: undefined,
        selectedWeaponId: undefined,
        selectedSpecialMoveId: undefined,
        attackableTiles: [],
        targetableTiles: []
      };
    }

    default:
      return state;
  }
};