// src/components/maps/MapEditor.tsx
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useGameState } from '../context';
import { MapData, TerrainType, generateHexGrid, HexCoord } from '../../utils/hexCalculations';
import HexTile from '../combat/HexTile';

const terrainOptions: TerrainType[] = ['blank', 'locale', 'mountain', 'water', 'forest', 'desert', 'swamp'];

interface MapEditorProps {
  onClose: () => void;
}

const MapEditor: React.FC<MapEditorProps> = ({ onClose }) => {
  const { state, dispatch } = useGameState();
  const [mapName, setMapName] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [mapRadius, setMapRadius] = useState(4);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [hexSize, setHexSize] = useState(30);
  
  // Find the current map in the maps array
  const currentMap = state.selectedMapId 
    ? state.maps.find(map => map.id === state.selectedMapId) 
    : state.maps[0];
  
  // Function to handle clicking on a hex tile to set terrain
  const handleTileClick = (coord: HexCoord) => {
    if (state.selectedTerrain) {
      dispatch({
        type: 'SET_TILE_TERRAIN',
        coord,
        terrainType: state.selectedTerrain as TerrainType
      });
    }
  };
  
  // Function to select a terrain type for painting
  const handleTerrainSelect = (terrainType: TerrainType) => {
    dispatch({
      type: 'SELECT_TERRAIN_TYPE',
      terrainType
    });
  };
  
  // Function to create a new map
  const handleCreateMap = () => {
    if (!mapName.trim()) {
      alert('Please enter a map name');
      return;
    }
    
    const newMapData: MapData = {
      id: uuidv4(),
      name: mapName,
      description: mapDescription,
      terrain: {},
      radius: mapRadius
    };
    
    dispatch({
      type: 'ADD_MAP',
      map: newMapData
    });
    
    // Reset form
    setMapName('');
    setMapDescription('');
    setMapRadius(4);
  };
  
  // Function to start editing a map (loads map data into form)
  const handleEditMap = (map: MapData) => {
    setEditingMapId(map.id);
    setMapName(map.name);
    setMapDescription(map.description || '');
    setMapRadius(map.radius);
    
    // Also select the map for editing
    dispatch({
      type: 'SELECT_MAP',
      mapId: map.id
    });
  };
  
  // Function to save changes to an existing map
  const handleUpdateMap = () => {
    if (!editingMapId || !mapName.trim()) {
      alert('Please enter a map name');
      return;
    }
    
    dispatch({
      type: 'UPDATE_MAP',
      mapId: editingMapId,
      changes: {
        name: mapName,
        description: mapDescription,
        radius: mapRadius
      }
    });
    
    // Exit edit mode
    setEditingMapId(null);
    setMapName('');
    setMapDescription('');
    setMapRadius(4);
  };
  
  // Function to delete a map
  const handleDeleteMap = (mapId: string) => {
    if (window.confirm('Are you sure you want to delete this map?')) {
      dispatch({
        type: 'DELETE_MAP',
        mapId
      });
    }
  };
  
  // Function to select a map for the game
  const handleSelectMap = (mapId: string) => {
    dispatch({
      type: 'SELECT_MAP',
      mapId
    });
  };
  
  // Get hex grid coordinates for the current map radius
  const hexes = currentMap ? generateHexGrid(currentMap.radius) : [];
  
  return (
    <div className="map-editor" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f0f0f0' }}>
        <h2 style={{ margin: 0 }}>Map Editor</h2>
        <button onClick={onClose}>Close</button>
      </div>
      
      <div style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left panel - Map controls and list */}
        <div style={{ width: '300px', padding: '10px', borderRight: '1px solid #ccc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {/* Map form */}
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f8f8', borderRadius: '4px' }}>
            <h3>{editingMapId ? 'Edit Map' : 'Create New Map'}</h3>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Map Name:</label>
              <input 
                type="text" 
                value={mapName} 
                onChange={(e) => setMapName(e.target.value)} 
                style={{ width: '100%', padding: '5px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
              <textarea 
                value={mapDescription} 
                onChange={(e) => setMapDescription(e.target.value)} 
                style={{ width: '100%', padding: '5px', minHeight: '60px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Map Radius:</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="2" 
                  max="8" 
                  value={mapRadius} 
                  onChange={(e) => setMapRadius(parseInt(e.target.value))} 
                  style={{ flex: 1, marginRight: '10px' }}
                />
                <span>{mapRadius}</span>
              </div>
            </div>
            
            <div>
              {editingMapId ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleUpdateMap}
                    style={{ flex: 1, padding: '8px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setEditingMapId(null);
                      setMapName('');
                      setMapDescription('');
                      setMapRadius(4);
                    }}
                    style={{ flex: 1, padding: '8px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleCreateMap}
                  style={{ width: '100%', padding: '8px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Create Map
                </button>
              )}
            </div>
          </div>
          
          {/* Map list */}
          <div>
            <h3>Available Maps</h3>
            
            <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
              {state.maps.map(map => (
                <div 
                  key={map.id} 
                  style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee',
                    background: map.id === state.selectedMapId ? '#e3f2fd' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{map.name}</strong>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleSelectMap(map.id)}
                        style={{ padding: '5px 8px', fontSize: '12px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Select
                      </button>
                      <button 
                        onClick={() => handleEditMap(map)}
                        style={{ padding: '5px 8px', fontSize: '12px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      {state.maps.length > 1 && (
                        <button 
                          onClick={() => handleDeleteMap(map.id)}
                          style={{ padding: '5px 8px', fontSize: '12px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  {map.description && <div style={{ fontSize: '12px', color: '#666' }}>{map.description}</div>}
                  <div style={{ fontSize: '12px', color: '#666' }}>Radius: {map.radius}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Terrain selection */}
          <div style={{ marginTop: '20px' }}>
            <h3>Terrain Tools</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
              {terrainOptions.map(terrain => (
                <button
                  key={terrain}
                  onClick={() => handleTerrainSelect(terrain)}
                  style={{
                    padding: '8px',
                    background: state.selectedTerrain === terrain ? '#4caf50' : '#f0f0f0',
                    color: state.selectedTerrain === terrain ? 'white' : 'black',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {terrain}
                </button>
              ))}
            </div>
            
            <div style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              {state.selectedTerrain 
                ? `Click on a hex to paint ${state.selectedTerrain} terrain` 
                : 'Select a terrain type to begin painting'}
            </div>
            
            {/* Hex size slider */}
            <div style={{ marginTop: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Hex Size:</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="15" 
                  max="50" 
                  value={hexSize} 
                  onChange={(e) => setHexSize(parseInt(e.target.value))} 
                  style={{ flex: 1, marginRight: '10px' }}
                />
                <span>{hexSize}px</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right panel - Map preview */}
        <div style={{ flex: 1, overflow: 'auto', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>
            <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
              {currentMap?.name || 'Map Preview'}
            </h3>
            
            <div style={{ 
              border: '1px solid #ccc', 
              background: '#f5f5f5', 
              borderRadius: '4px', 
              padding: '10px',
              overflow: 'auto',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 200px)'
            }}>
              <div style={{ 
                minWidth: hexSize * Math.sqrt(3) * (2 * (currentMap?.radius || 4) + 3),
                minHeight: hexSize * 3/2 * (2 * (currentMap?.radius || 4) + 3)
              }}>
                <svg
                  width={hexSize * Math.sqrt(3) * (2 * (currentMap?.radius || 4) + 3)}
                  height={hexSize * 3/2 * (2 * (currentMap?.radius || 4) + 3)}
                  viewBox={`0 0 ${hexSize * Math.sqrt(3) * (2 * (currentMap?.radius || 4) + 3)} ${hexSize * 3/2 * (2 * (currentMap?.radius || 4) + 3)}`}
                >
                <g transform={`translate(${hexSize * Math.sqrt(3) * (currentMap?.radius || 4) + hexSize * 1.5}, ${hexSize * 3/2 * (currentMap?.radius || 4) + hexSize * 2.5})`}>
                  {hexes.map((coord) => {
                    const key = `${coord.q},${coord.r}`;
                    const terrainType = currentMap?.terrain[key] || 'blank';
                    
                    return (
                      <HexTile
                        key={key}
                        coord={coord}
                        size={hexSize}
                        terrain={terrainType}
                        onClick={() => handleTileClick(coord)}
                        editorMode={true}
                        debugOpacity={0.3}
                      />
                    );
                  })}
                </g>
              </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapEditor;