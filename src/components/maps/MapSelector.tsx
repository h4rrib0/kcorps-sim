// src/components/maps/MapSelector.tsx
import React, { useState } from 'react';
import { useGameState } from '../context';
import { generateHexGrid } from '../../utils/hexCalculations';
import HexTile from '../combat/HexTile';
import MapEditor from './MapEditor';

interface MapSelectorProps {
  onMapSelect: () => void;
}

const MapSelector: React.FC<MapSelectorProps> = ({ onMapSelect }) => {
  const { state, dispatch } = useGameState();
  const [showEditor, setShowEditor] = useState(false);
  const [previewHexSize, setPreviewHexSize] = useState(20);
  
  // Find the currently selected map
  const selectedMap = state.selectedMapId 
    ? state.maps.find(map => map.id === state.selectedMapId) 
    : state.maps[0];
  
  // Function to select a map
  const handleSelectMap = (mapId: string) => {
    dispatch({
      type: 'SELECT_MAP',
      mapId
    });
  };
  
  // Function to open the map editor
  const handleOpenEditor = () => {
    dispatch({
      type: 'ENTER_EDITOR_MODE'
    });
    setShowEditor(true);
  };
  
  // Function to close the map editor
  const handleCloseEditor = () => {
    dispatch({
      type: 'EXIT_EDITOR_MODE'
    });
    setShowEditor(false);
  };
  
  // Function to confirm map selection and return to the game
  const handleConfirmSelection = () => {
    // Just close the selector and return to the game with the selected map
    onMapSelect();
  };
  
  // If we're showing the editor, render it instead
  if (showEditor) {
    return <MapEditor onClose={handleCloseEditor} />;
  }
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Select Map</h2>
        <div>
          <button 
            onClick={handleOpenEditor}
            style={{ padding: '8px 16px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
          >
            Open Map Editor
          </button>
          <button 
            onClick={handleConfirmSelection}
            style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Confirm Selection
          </button>
        </div>
      </header>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {state.maps.map(map => {
          const hexes = generateHexGrid(map.radius);
          const isSelected = map.id === state.selectedMapId;
          
          return (
            <div 
              key={map.id}
              onClick={() => handleSelectMap(map.id)}
              style={{
                width: '360px',
                border: `2px solid ${isSelected ? '#2196f3' : '#ccc'}`,
                borderRadius: '8px',
                padding: '15px',
                background: isSelected ? '#e3f2fd' : 'white',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{map.name}</div>
              {map.description && <div style={{ color: '#666' }}>{map.description}</div>}
              
              <div style={{ 
                textAlign: 'center', 
                border: '1px solid #eee', 
                borderRadius: '4px', 
                padding: '10px', 
                background: '#f9f9f9',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                <div style={{
                  minWidth: previewHexSize * Math.sqrt(3) * (2 * map.radius + 3),
                  minHeight: previewHexSize * 3/2 * (2 * map.radius + 3)
                }}>
                  <svg
                    width={previewHexSize * Math.sqrt(3) * (2 * map.radius + 3)}
                    height={previewHexSize * 3/2 * (2 * map.radius + 3)}
                    viewBox={`0 0 ${previewHexSize * Math.sqrt(3) * (2 * map.radius + 3)} ${previewHexSize * 3/2 * (2 * map.radius + 3)}`}
                  >
                  <g transform={`translate(${previewHexSize * Math.sqrt(3) * map.radius + previewHexSize}, ${previewHexSize * 3/2 * map.radius + previewHexSize * 2})`}>
                    {hexes.map((coord) => {
                      const key = `${coord.q},${coord.r}`;
                      const terrainType = map.terrain[key] || 'blank';
                      
                      return (
                        <HexTile
                          key={key}
                          coord={coord}
                          size={previewHexSize}
                          terrain={terrainType}
                          debugOpacity={0.2}
                        />
                      );
                    })}
                  </g>
                </svg>
                </div>
              </div>
              
              <div style={{ color: '#666', fontSize: '14px' }}>
                Radius: {map.radius} • {hexes.length} hexes • {Object.keys(map.terrain).length} custom terrain tiles
              </div>
              
              {isSelected && (
                <div style={{ 
                  background: '#4caf50', 
                  color: 'white', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  textAlign: 'center',
                  marginTop: '5px'
                }}>
                  Currently Selected
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MapSelector;