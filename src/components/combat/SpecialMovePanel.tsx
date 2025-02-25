import React from 'react';
import { useGameState } from '../context';
import { SpecialMove, Unit } from '../types';

const SpecialMovePanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  
  // Get the active unit with error handling
  let activeUnit;
  let target;
  let pilot;
  
  try {
    activeUnit = state.units.find(unit => unit.id === state.selectedUnitId);
    target = state.units.find(unit => unit.id === state.targetUnitId);
    
    // Find pilot if the unit has one
    pilot = activeUnit?.pilotId ? state.pilots.find(p => p.id === activeUnit.pilotId) : undefined;
  } catch (error) {
    console.error("Error finding unit/pilot in SpecialMovePanel:", error);
    // Continue with undefined values
  }
  
  // Combine unit and pilot special moves
  const unitSpecialMoves = activeUnit?.specialMoves || [];
  const pilotSpecialMoves = pilot?.specialMoves || [];
  
  // Find the currently selected special move with error handling
  let selectedMove;
  try {
    selectedMove = [...unitSpecialMoves, ...pilotSpecialMoves].find(
      move => move.id === state.selectedSpecialMoveId
    );
  } catch (error) {
    console.error("Error finding selected special move:", error);
    // Leave selectedMove as undefined
  }
  
  // Handle special move selection
  const handleSpecialMoveSelect = (moveId: string) => {
    dispatch({ type: 'SELECT_SPECIAL_MOVE', moveId });
  };

  // Handle special move execution
  const handleExecuteSpecialMove = () => {
    dispatch({ type: 'EXECUTE_SPECIAL_MOVE' });
  };

  // Handle cancel
  const handleCancel = () => {
    dispatch({ type: 'EXIT_SPECIAL_MOVE_MODE' });
  };

  // Check if special move is valid based on targeting type
  const isSpecialMoveValid = (() => {
    try {
      if (!activeUnit || !selectedMove) return false;
      
      switch (selectedMove.targeting) {
        case 'self':
          // Self targeting always valid
          return true;
        case 'ally':
          // For now, allies can only be self
          return !!target && target.id === activeUnit.id;
        case 'enemy':
          // Must have a target that's not self
          return !!target && target.id !== activeUnit.id;
        case 'area':
          // Area targeting is always valid
          return true;
        default:
          return false;
      }
    } catch (error) {
      console.error("Error validating special move:", error);
      return false;
    }
  })();

  // Check if special move is on cooldown
  const isMoveOnCooldown = selectedMove && selectedMove.currentCooldown > 0;

  if (!state.specialMoveMode) return null;

  return (
    <div className="special-move-panel" style={{
      position: 'fixed',
      right: '370px',
      top: '20px',
      width: '300px',
      backgroundColor: 'rgba(245, 245, 245, 0.95)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0,0,0,0.2)',
      zIndex: 1000,
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Special Move</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Active Unit</h4>
        {activeUnit ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: '#fff', 
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <div style={{
              width: '25px',
              height: '25px',
              borderRadius: '50%',
              backgroundColor: (() => {
                const hash = activeUnit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const hue = hash % 360;
                return `hsl(${hue}, 80%, 70%)`;
              })(),
              marginRight: '10px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              border: '1px solid rgba(0,0,0,0.2)'
            }}>
              {activeUnit.name.substring(0, 1)}
            </div>
            <div>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{activeUnit.name}</p>
              <p style={{ margin: '0', fontSize: '12px' }}>
                HP: {activeUnit.durability.current}/{activeUnit.durability.max} | 
                Type: {activeUnit.type}
              </p>
              {pilot && (
                <p style={{ margin: '0', fontSize: '12px', fontStyle: 'italic' }}>
                  Pilot: {pilot.name}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: 'red', fontSize: '14px' }}>No unit selected</p>
        )}
      </div>
      
      {/* Unit Special Moves */}
      {unitSpecialMoves.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Unit Special Moves
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '5px',
            backgroundColor: '#fff',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            {unitSpecialMoves.map((move) => (
              <button
                key={move.id}
                onClick={() => handleSpecialMoveSelect(move.id)}
                disabled={move.currentCooldown > 0}
                style={{
                  padding: '6px 8px',
                  backgroundColor: state.selectedSpecialMoveId === move.id ? '#e6f2ff' : 'transparent',
                  color: move.currentCooldown > 0 ? '#999' : 'black',
                  border: state.selectedSpecialMoveId === move.id ? '1px solid #007bff' : '1px solid #eee',
                  borderLeft: state.selectedSpecialMoveId === move.id ? '4px solid #007bff' : '1px solid #eee',
                  borderRadius: '3px',
                  cursor: move.currentCooldown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {move.name}
                  {move.currentCooldown > 0 && (
                    <span style={{ marginLeft: '8px', color: 'red', fontSize: '12px' }}>
                      CD: {move.currentCooldown}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {move.description}
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {move.effect === 'damage' && '💥 Damage'} 
                  {move.effect === 'defense' && '🛡️ Defense'}
                  {move.effect === 'utility' && '⚙️ Utility'}
                  {move.effect === 'healing' && '❤️ Healing'}
                  {move.effect === 'buff' && '⬆️ Buff'}
                  {' | '}
                  {move.targeting === 'self' && 'Target: Self'}
                  {move.targeting === 'ally' && 'Target: Ally'}
                  {move.targeting === 'enemy' && 'Target: Enemy'}
                  {move.targeting === 'area' && 'Target: Area'}
                  {move.range !== undefined && move.range > 0 && ` | Range: ${move.range}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Pilot Special Moves */}
      {pilotSpecialMoves.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Pilot Special Moves
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '5px',
            backgroundColor: '#fff',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            {pilotSpecialMoves.map((move) => (
              <button
                key={move.id}
                onClick={() => handleSpecialMoveSelect(move.id)}
                disabled={move.currentCooldown > 0}
                style={{
                  padding: '6px 8px',
                  backgroundColor: state.selectedSpecialMoveId === move.id ? '#e6f2ff' : 'transparent',
                  color: move.currentCooldown > 0 ? '#999' : 'black',
                  border: state.selectedSpecialMoveId === move.id ? '1px solid #007bff' : '1px solid #eee',
                  borderLeft: state.selectedSpecialMoveId === move.id ? '4px solid #007bff' : '1px solid #eee',
                  borderRadius: '3px',
                  cursor: move.currentCooldown > 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {move.name}
                  {move.currentCooldown > 0 && (
                    <span style={{ marginLeft: '8px', color: 'red', fontSize: '12px' }}>
                      CD: {move.currentCooldown}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {move.description}
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {move.effect === 'damage' && '💥 Damage'} 
                  {move.effect === 'defense' && '🛡️ Defense'}
                  {move.effect === 'utility' && '⚙️ Utility'}
                  {move.effect === 'healing' && '❤️ Healing'}
                  {move.effect === 'buff' && '⬆️ Buff'}
                  {' | '}
                  {move.targeting === 'self' && 'Target: Self'}
                  {move.targeting === 'ally' && 'Target: Ally'}
                  {move.targeting === 'enemy' && 'Target: Enemy'}
                  {move.targeting === 'area' && 'Target: Area'}
                  {move.range !== undefined && move.range > 0 && ` | Range: ${move.range}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Show target info if needed */}
      {selectedMove && (selectedMove.targeting === 'enemy' || selectedMove.targeting === 'ally') && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Target</h4>
          {target ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: '#fff', 
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              <div style={{
                width: '25px',
                height: '25px',
                borderRadius: '50%',
                backgroundColor: (() => {
                  const hash = target.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const hue = hash % 360;
                  return `hsl(${hue}, 80%, 70%)`;
                })(),
                marginRight: '10px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                border: '1px solid rgba(0,0,0,0.2)'
              }}>
                {target.name.substring(0, 1)}
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{target.name}</p>
                <p style={{ margin: '0', fontSize: '12px' }}>
                  HP: {target.durability.current}/{target.durability.max} | 
                  Armor: {target.armor}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'red', fontSize: '14px' }}>Select a target</p>
          )}
        </div>
      )}
      
      {/* Show all targetable units */}
      {selectedMove && (selectedMove.targeting === 'enemy' || selectedMove.targeting === 'ally') && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Targetable Units
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '5px', 
            backgroundColor: '#fff',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            maxHeight: '150px',
            overflowY: 'auto'
          }}>
            {state.units
              .filter(u => {
                // Unit must have a position
                if (!u.position) return false;
                
                // Check if unit is in targetable tiles
                const isInRange = state.targetableTiles.some(
                  tile => tile.q === u.position?.x && tile.r === u.position?.y
                );
                
                // For ally targeting, unit must be self (for now)
                if (selectedMove.targeting === 'ally') {
                  return isInRange && u.id === activeUnit?.id;
                }
                
                // For enemy targeting, unit must not be self
                if (selectedMove.targeting === 'enemy') {
                  return isInRange && u.id !== activeUnit?.id;
                }
                
                return false;
              })
              .map(unit => (
                <div 
                  key={unit.id}
                  onClick={() => dispatch({ type: 'SELECT_TARGET', unitId: unit.id })}
                  style={{
                    padding: '5px 8px',
                    borderBottom: '1px solid #eee',
                    backgroundColor: state.targetUnitId === unit.id ? '#e0f7fa' : 'transparent',
                    cursor: 'pointer',
                    borderLeft: state.targetUnitId === unit.id ? '4px solid #007bff' : 'none',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {/* Color indicator matching unit's color on the grid */}
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: (() => {
                      // Same hash function as in Unit component
                      const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                      const hue = hash % 360;
                      return `hsl(${hue}, 80%, 70%)`;
                    })(),
                    marginRight: '8px',
                    border: '1px solid #666'
                  }} />
                  
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{unit.name}</p>
                    <p style={{ margin: '0', fontSize: '12px' }}>
                      HP: {unit.durability.current}/{unit.durability.max} | 
                      Pos: ({unit.position.x}, {unit.position.y})
                    </p>
                  </div>
                </div>
              ))
            }
            {state.units.filter(u => {
                if (!u.position) return false;
                const isInRange = state.targetableTiles?.some(
                  tile => tile.q === u.position?.x && tile.r === u.position?.y
                ) || false;
                
                if (selectedMove.targeting === 'ally') {
                  return isInRange && u.id === activeUnit?.id;
                }
                
                if (selectedMove.targeting === 'enemy') {
                  return isInRange && u.id !== activeUnit?.id;
                }
                
                return false;
              }).length === 0 && (
                <p style={{ color: '#666', fontStyle: 'italic', margin: '5px 0', fontSize: '13px', textAlign: 'center' }}>
                  No targetable units in range
                </p>
              )}
          </div>
        </div>
      )}
      
      {/* Show area targeting info */}
      {selectedMove && selectedMove.targeting === 'area' && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
            Area Effect
          </h4>
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}>
            <p style={{ margin: '0', fontSize: '13px' }}>
              {/* Count of affected units */}
              Units in area: {state.units.filter(u => 
                u.position && 
                state.targetableTiles?.some(tile => tile.q === u.position?.x && tile.r === u.position?.y) &&
                u.id !== activeUnit?.id // Don't count self
              ).length}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
              All highlighted tiles will be affected
            </p>
          </div>
        </div>
      )}
      
      {/* Control buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button
          onClick={handleCancel}
          style={{
            padding: '8px 0',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: '1'
          }}
        >
          ✖ Cancel
        </button>
        
        <button
          onClick={handleExecuteSpecialMove}
          disabled={!isSpecialMoveValid || isMoveOnCooldown}
          style={{
            padding: '8px 0',
            backgroundColor: isSpecialMoveValid && !isMoveOnCooldown ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSpecialMoveValid && !isMoveOnCooldown ? 'pointer' : 'not-allowed',
            flex: '1',
            fontWeight: 'bold'
          }}
        >
          {isMoveOnCooldown ? 'On Cooldown' : '✓ Execute'}
        </button>
      </div>
    </div>
  );
};

export default SpecialMovePanel;