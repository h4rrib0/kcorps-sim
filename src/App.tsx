import React, { useState } from 'react';
import './App.css';
import HexGrid from './components/combat/HexGrid';
import RightBar from './components/sidebar/RightBar';
import DetailsPanel from './components/sidebar/DetailsPanel';
import AttackPanel from './components/combat/AttackPanel';
import SpecialMovePanel from './components/combat/SpecialMovePanel';
import LogPanel from './components/combat/LogPanel';
import MapSelector from './components/maps/MapSelector';
import StateManagement from './components/maps/StateManagement';
import { CombatResultsPopup } from './components/combat/CombatResultsPopup';
import { GameStateProvider, useGameState } from './components/context';
import { HexCoord } from './utils/hexCalculations';

function AppContent() {
  const { state, dispatch } = useGameState();
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showStateManager, setShowStateManager] = useState(false);

  const handleTileClick = (coord: HexCoord) => {
    if (state.selectedUnitId) {
      dispatch({
        type: 'PLACE_UNIT',
        unitId: state.selectedUnitId,
        position: { x: coord.q, y: coord.r, facing: 0 }
      });
      // Optionally clear the selected unit:
      // dispatch({ type: 'SELECT_UNIT', unitId: '' });
    } else {
      console.log('Clicked tile:', coord);
    }
  };
  
  const handleOpenMapSelector = () => {
    setShowMapSelector(true);
    setShowStateManager(false);
  };
  
  const handleCloseMapSelector = () => {
    setShowMapSelector(false);
  };
  
  const handleOpenStateManager = () => {
    setShowStateManager(true);
    setShowMapSelector(false);
  };
  
  const handleCloseStateManager = () => {
    setShowStateManager(false);
  };

  // If showing map selector, render that instead of the game UI
  if (showMapSelector) {
    return <MapSelector onMapSelect={handleCloseMapSelector} />;
  }
  
  // If showing state manager, render that instead of the game UI
  if (showStateManager) {
    return <StateManagement onClose={handleCloseStateManager} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Left details panel */}
      <div style={{ 
        width: '350px', 
        height: '100vh', 
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #ddd',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        flexShrink: 0
      }}>
        <DetailsPanel />
      </div>

      {/* Center game area */}
      <div style={{ 
        flex: 1, 
        padding: '1rem', 
        position: 'relative', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' 
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <h2 style={{ margin: 0 }}>Combat Map</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleOpenStateManager}
              style={{
                padding: '8px 15px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Save/Load
            </button>
            <button 
              onClick={handleOpenMapSelector}
              style={{
                padding: '8px 15px',
                background: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Change Map
            </button>
          </div>
        </div>
        
        <div style={{ 
          flex: 1,
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '400px'
        }}>
          <HexGrid
            onTileClick={handleTileClick}
            useSelectedMap={true}
          />
        </div>
        <LogPanel />
        <AttackPanel />
        <SpecialMovePanel />
      </div>

      {/* Right sidebar with tabs */}
      <RightBar />
      
      {/* Combat Results Popup */}
      <CombatResultsPopup />
    </div>
  );
}

function App() {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
}

export default App;