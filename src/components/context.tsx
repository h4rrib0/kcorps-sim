// context.tsx
import React, { useEffect } from 'react';
import { createContext, useContext, useReducer, useCallback } from 'react';
import { GameState, GameAction, gameReducer, initialGameState } from './types';
import { saveGameState, loadGameState, startAutoSave } from '../utils/persistState';

const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  saveState: () => void;
  loadState: () => void;
  exportState: () => void;
  resetState: () => void;
} | null>(null);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  // Try to load saved state, fall back to initial state if none exists
  const savedState = loadGameState();
  const [state, dispatch] = useReducer(gameReducer, savedState || initialGameState);

  // Create a wrapped dispatch function that auto-saves state after each action
  const wrappedDispatch = useCallback((action: GameAction) => {
    dispatch(action);
    // We don't save immediately after each dispatch to avoid performance issues
    // The auto-save mechanism will handle periodic saves
  }, []);
  
  // Set up auto-save
  useEffect(() => {
    const stopAutoSave = startAutoSave(() => state);
    return () => {
      // Save one last time when unmounting and clean up auto-save
      saveGameState(state);
      stopAutoSave();
    };
  }, [state]);
  
  // Manual save function
  const saveState = useCallback(() => {
    saveGameState(state);
  }, [state]);
  
  // Manual load function
  const loadState = useCallback(() => {
    const loadedState = loadGameState();
    if (loadedState) {
      // Use a special action to completely replace the state
      dispatch({ type: 'LOAD_STATE', state: loadedState });
    }
  }, []);
  
  // Export state function
  const exportState = useCallback(() => {
    // Import dynamically to avoid bundling issues
    import('../utils/persistState').then(({ exportGameState }) => {
      exportGameState(state);
    });
  }, [state]);
  
  // Reset state function
  const resetState = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all game data? This cannot be undone.')) {
      dispatch({ type: 'RESET_STATE' });
    }
  }, []);

  return (
    <GameStateContext.Provider value={{ 
      state, 
      dispatch: wrappedDispatch,
      saveState,
      loadState,
      exportState,
      resetState
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
}

// Usage in components:
/*
function Sidebar() {
  const { state, dispatch } = useGameState();
  const selectedUnit = state.units.find(u => u.id === state.selectedUnitId);

  // Render sidebar with selected unit info...
}

function HexGrid() {
  const { state, dispatch } = useGameState();
  
  // Render grid with units...
}
*/