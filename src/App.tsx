import React from 'react';
import './App.css';
import HexGrid from './components/combat/HexGrid';
import RightBar from './components/sidebar/RightBar';
import DetailsPanel from './components/sidebar/DetailsPanel';
import AttackPanel from './components/combat/AttackPanel';
import SpecialMovePanel from './components/combat/SpecialMovePanel';
import LogPanel from './components/combat/LogPanel';
import { GameStateProvider, useGameState } from './components/context';
import { HexCoord } from './utils/hexCalculations';

function AppContent() {
  const { state, dispatch } = useGameState();

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
            radius={5}
            onTileClick={handleTileClick}
          />
        </div>
        <LogPanel />
        <AttackPanel />
        <SpecialMovePanel />
      </div>

      {/* Right sidebar with tabs */}
      <RightBar />
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