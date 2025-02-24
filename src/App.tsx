import React from 'react';
import './App.css';
import HexGrid from './components/combat/HexGrid';
import RightBar from './components/sidebar/RightBar';
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
    <div className="flex">
      <div className="p-4 flex-1">
        <HexGrid
          radius={4}
          hexSize={40}
          onTileClick={handleTileClick}
        />
      </div>
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
