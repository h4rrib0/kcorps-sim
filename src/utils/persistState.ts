// src/utils/persistState.ts
import { GameState } from '../components/types/state';

const STORAGE_KEY = 'tacticalGameState';

/**
 * Saves the current game state to localStorage
 */
export const saveGameState = (state: GameState): void => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
    console.log('Game state saved successfully');
  } catch (err) {
    console.error('Could not save game state:', err);
  }
};

/**
 * Loads the game state from localStorage
 * Returns null if no saved state exists or if there's an error
 */
export const loadGameState = (): GameState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return null;
    }
    
    const state = JSON.parse(serializedState) as GameState;
    console.log('Game state loaded successfully');
    return state;
  } catch (err) {
    console.error('Could not load game state:', err);
    return null;
  }
};

/**
 * Clears the saved game state from localStorage
 */
export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Game state cleared successfully');
  } catch (err) {
    console.error('Could not clear game state:', err);
  }
};

/**
 * Auto-saves the game state at regular intervals
 * @param state The current game state
 * @param interval Time in milliseconds between saves (default: 30 seconds)
 * @returns A cleanup function to stop auto-saving
 */
export const startAutoSave = (
  getState: () => GameState,
  interval: number = 30000
): () => void => {
  const timerId = setInterval(() => {
    const currentState = getState();
    saveGameState(currentState);
  }, interval);
  
  // Return a cleanup function
  return () => {
    clearInterval(timerId);
  };
};

/**
 * Exports the current game state as a JSON file for download
 */
export const exportGameState = (state: GameState): void => {
  try {
    const serializedState = JSON.stringify(state, null, 2);
    const blob = new Blob([serializedState], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = `tactical-game-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Game state exported successfully');
  } catch (err) {
    console.error('Could not export game state:', err);
  }
};

/**
 * Imports a game state from a JSON file
 * @param file The JSON file containing the game state
 * @returns A Promise that resolves to the imported GameState or null if there's an error
 */
export const importGameState = (file: File): Promise<GameState | null> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const importedState = JSON.parse(content) as GameState;
          console.log('Game state imported successfully');
          resolve(importedState);
        } catch (err) {
          console.error('Could not parse imported file:', err);
          resolve(null);
        }
      };
      
      reader.onerror = () => {
        console.error('Could not read imported file');
        resolve(null);
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('Could not import game state:', err);
      resolve(null);
    }
  });
};