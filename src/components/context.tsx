// context.tsx
import React from 'react';
import { createContext, useContext, useReducer } from 'react';
import { GameState, GameAction, gameReducer } from './types';

const GameStateContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    units: [],
    turn: 1,
    phase: 'movement',
    initiativeOrder: [],
    log: []
  });

  return (
    <GameStateContext.Provider value={{ state, dispatch }}>
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