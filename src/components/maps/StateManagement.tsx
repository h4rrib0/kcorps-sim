// src/components/maps/StateManagement.tsx
import React, { useRef } from 'react';
import { useGameState } from '../context';
import { importGameState } from '../../utils/persistState';

interface StateManagementProps {
  onClose: () => void;
}

const StateManagement: React.FC<StateManagementProps> = ({ onClose }) => {
  const { saveState, exportState, resetState } = useGameState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useGameState();
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const importedState = await importGameState(file);
      
      if (importedState) {
        if (window.confirm('Are you sure you want to import this state? This will replace your current game state.')) {
          dispatch({ type: 'LOAD_STATE', state: importedState });
          alert('Game state imported successfully!');
        }
      } else {
        alert('Failed to import game state. The file may be corrupted or invalid.');
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleClickImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Game State Management</h2>
        <button 
          onClick={onClose}
          style={{ padding: '8px 16px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
        >
          Close
        </button>
      </header>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Save Game</h3>
          <p style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#666' }}>
            Save the current game state to local storage.
          </p>
          <button 
            onClick={saveState}
            style={{ 
              padding: '12px 20px', 
              background: '#4caf50', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '80%'
            }}
          >
            Save Game State
          </button>
        </div>
        
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Export Game</h3>
          <p style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#666' }}>
            Export the current game state to a file.
          </p>
          <button 
            onClick={exportState}
            style={{ 
              padding: '12px 20px', 
              background: '#2196f3', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '80%'
            }}
          >
            Export Game State
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '20px'
      }}>
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Import Game</h3>
          <p style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#666' }}>
            Import a game state from a file.
          </p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImport} 
            accept=".json"
            style={{ display: 'none' }}
          />
          <button 
            onClick={handleClickImport}
            style={{ 
              padding: '12px 20px', 
              background: '#ff9800', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '80%'
            }}
          >
            Import Game State
          </button>
        </div>
        
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Reset Game</h3>
          <p style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#666' }}>
            Reset the game state to default values.
          </p>
          <button 
            onClick={resetState}
            style={{ 
              padding: '12px 20px', 
              background: '#f44336', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '80%'
            }}
          >
            Reset Game State
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', padding: '15px', background: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
        <h4 style={{ margin: '0 0 10px 0' }}>About State Management</h4>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>
          Your game state is automatically saved to your browser's local storage every 30 seconds while you play. 
          This ensures that your progress is not lost if you accidentally close the browser or if there's an unexpected error.
        </p>
        <p style={{ margin: '0', fontSize: '14px', color: '#555' }}>
          For extra safety, you can manually save your game, export it to a file for backup, or import a previously exported state.
          The reset option will clear all data and return the game to its initial state.
        </p>
      </div>
    </div>
  );
};

export default StateManagement;