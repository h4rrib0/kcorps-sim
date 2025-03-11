// utils.ts - Utility functions for the reducer
import { GameState } from '../state';

// Helper function to add log entries
export function addLogEntry(state: GameState, message: string, type: 'info' | 'error' | 'combat' | 'system' = 'info'): GameState {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return {
    ...state,
    log: [...state.log, { message: message, type }],
    error: undefined // Clear any errors when adding a log entry
  };
}

// Helper function to add error messages
export function addErrorEntry(state: GameState, errorMessage: string): GameState {
  return {
    ...state,
    log: [...state.log, { message: errorMessage, type: 'error' }],
    error: errorMessage
  };
}