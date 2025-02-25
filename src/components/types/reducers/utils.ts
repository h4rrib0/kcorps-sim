// utils.ts - Utility functions for the reducer
import { GameState } from '../state';

// Helper function to add log entries
export function addLogEntry(state: GameState, message: string): GameState {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedMessage = `[${timestamp}] ${message}`;
  return {
    ...state,
    log: [...state.log, formattedMessage],
    error: undefined // Clear any errors when adding a log entry
  };
}

// Helper function to add error messages
export function addErrorEntry(state: GameState, errorMessage: string): GameState {
  // Also add to log with a different format to distinguish errors
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedMessage = `[${timestamp}] ERROR: ${errorMessage}`;
  return {
    ...state,
    log: [...state.log, formattedMessage],
    error: errorMessage
  };
}