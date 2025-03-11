import React, { useState } from 'react';
import { useGameState } from '../context';
import EditableStat from './UnitCard';
import SegmentDetails from './SegmentDetails';

const DetailsPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  // Get the currently selected unit and pilot
  const selectedUnit = state.selectedUnitId 
    ? state.units.find(unit => unit.id === state.selectedUnitId)
    : null;
    
  const selectedPilot = selectedUnit?.pilotId 
    ? state.pilots.find(pilot => pilot.id === selectedUnit.pilotId)
    : state.selectedPilotId 
      ? state.pilots.find(pilot => pilot.id === state.selectedPilotId)
      : null;

  if (!selectedUnit && !selectedPilot) {
    return (
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f5f5f5',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: '#666'
      }}>
        <h3>No Unit or Pilot Selected</h3>
        <p>Select a unit or pilot from the right sidebar to view details</p>
      </div>
    );
  }

  // Get selected segment if any
  const selectedSegment = selectedUnit && selectedSegmentId 
    ? selectedUnit.segments.find(s => s.id === selectedSegmentId) 
    : null;

  // Calculate total durability and wounds
  const calculateTotalDurability = () => {
    if (!selectedUnit) return { current: 0, max: 0 };
    return selectedUnit.durability || { current: 0, max: 0 };
  };

  const totalDurability = calculateTotalDurability();
  
  // Create a durability bar component
  const DurabilityBar: React.FC<{current: number, max: number, wounds: number, armor: number}> = ({current, max, wounds, armor}) => {
    // Fixed number of cells for display
    const cellCount = 20;
    
    // Health display constants
    const healthCells = cellCount; 
    const healthPerCell = Math.ceil(max / healthCells);
    const healthFilledCells = Math.min(Math.ceil(current / healthPerCell), healthCells);
    
    // Wounds display constants
    const woundsCells = cellCount;
    const woundsPerCell = Math.ceil(armor / woundsCells);
    const woundsFilledCells = Math.min(Math.ceil(wounds / woundsPerCell), woundsCells);
    
    // Determine health color based on absolute health values
    const getHealthColor = (currentHealth: number, maxHealth: number) => {
      if (currentHealth >= (maxHealth * 2/3)) return '#10b981'; // Green (> 66%)
      if (currentHealth >= (maxHealth * 1/3)) return '#f59e0b'; // Orange (> 33%)
      return '#ef4444'; // Red (< 33%)
    };
    
    const healthColor = getHealthColor(current, max);
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {/* Health information */}
        <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Durability</span>
          <span>{current}/{max}</span>
        </div>
        
        {/* Vertical health bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          height: '40px',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', height: '100%', width: '90%' }}>
            {/* Generate cells for health display */}
            {Array.from({ length: healthCells }).map((_, index) => {
              const isFilled = index < healthFilledCells;
              
              return (
                <div key={index} style={{ 
                  flex: 1,
                  height: '100%', 
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  padding: '0 1px'
                }}>
                  <div style={{
                    backgroundColor: isFilled ? healthColor : '#ffcdd2', // Use calculated color or light red
                    height: '100%',
                    borderRadius: '2px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    opacity: isFilled ? 1 : 0.4,
                    transition: 'opacity 0.3s ease'
                  }} />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Structural wounds display */}
        {wounds > 0 && (
          <div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: '#9c27b0' }}>Structural Wounds</span>
              <span>{wounds}/{armor} pts</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              height: '20px',
              marginBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', height: '100%', width: '90%' }}>
                {/* Generate cells for wounds display */}
                {Array.from({ length: armor }).map((_, index) => {
                  const isWound = index < woundsFilledCells;
                  
                  return (
                    <div key={index} style={{ 
                      flex: 1,
                      height: '100%', 
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      padding: '0 1px'
                    }}>
                      <div style={{
                        backgroundColor: '#9c27b0', // Purple for structural wounds
                        height: '100%',
                        borderRadius: '2px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        opacity: isWound ? 1 : 0.1,
                        transition: 'opacity 0.3s ease'
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', marginRight: '4px', borderRadius: '2px' }}></div>
            <span>Health</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#ffcdd2', 
              marginRight: '4px', 
              borderRadius: '2px',
              opacity: 0.4,
              border: '1px solid rgba(0,0,0,0.1)'
            }}></div>
            <span>Empty</span>
          </div>
          {wounds > 0 && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#9c27b0', marginRight: '4px', borderRadius: '2px' }}></div>
              <span>Structural</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '1rem',
      height: '100%',
      overflowY: 'auto'
    }}>
      {selectedUnit && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            marginBottom: '1rem',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: (() => {
                  // Hash function for color
                  const hash = selectedUnit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const hue = hash % 360;
                  return `hsl(${hue}, 80%, 70%)`;
                })(),
                marginRight: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                border: '1px solid rgba(0,0,0,0.2)'
              }}
            >
              {selectedUnit.name.substring(0, 1)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedUnit.name}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.875rem', 
                  backgroundColor: '#f0f0f0', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  color: '#666'
                }}>
                  {selectedUnit.type}
                </span>
                {selectedUnit.position && (
                  <span style={{ 
                    fontSize: '0.875rem', 
                    backgroundColor: '#e8f4fe', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    color: '#0078d4'
                  }}>
                    On Field
                  </span>
                )}
              </div>
            </div>
          </div>
            
            {/* Status Effects in the name card (if present) */}
            {selectedUnit.status && Object.keys(selectedUnit.status).some(key => selectedUnit.status[key]) && (
              <div style={{ 
                marginTop: '0.75rem',
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem'
              }}>
                {Object.entries(selectedUnit.status).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div 
                      key={key}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: (() => {
                          switch (key) {
                            case 'dazed': return '#fee2e2';
                            case 'prone': return '#fef3c7';
                            case 'downed': return '#fee2e2';
                            case 'grappled': return '#fee2e2';
                            case 'stunned': return '#fee2e2';
                            default: return '#f3f4f6';
                          }
                        })(),
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: (() => {
                          switch (key) {
                            case 'dazed': return '#dc2626';
                            case 'prone': return '#d97706';
                            case 'downed': return '#dc2626';
                            case 'grappled': return '#dc2626';
                            case 'stunned': return '#dc2626';
                            default: return '#6b7280';
                          }
                        })()
                      }}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <h3>Unit Stats</h3>
          {/* Durability Bar as a full-width component */}
          <div style={{ marginBottom: '1rem' }}>
            <DurabilityBar 
              current={totalDurability.current} 
              max={totalDurability.max}
              wounds={selectedUnit.wounds || 0}
              armor={selectedUnit.armor || 1}
            />
          </div>
          
          {/* Other stats in a grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <EditableStat
              label="Armor"
              value={selectedUnit.armor}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_UNIT', 
                  unitId: selectedUnit.id, 
                  changes: { armor: newValue } 
                });
              }}
            />
            <EditableStat
              label="Agility"
              value={selectedUnit.agility}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_UNIT', 
                  unitId: selectedUnit.id, 
                  changes: { agility: newValue } 
                });
              }}
            />
            <EditableStat
              label="Mass"
              value={selectedUnit.mass}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_UNIT', 
                  unitId: selectedUnit.id, 
                  changes: { mass: newValue } 
                });
              }}
            />
            <EditableStat
              label="Precision"
              value={selectedUnit.precision || 0}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_UNIT', 
                  unitId: selectedUnit.id, 
                  changes: { precision: newValue } 
                });
              }}
            />
          </div>

          {/* Segments section */}
          {selectedUnit.segments && selectedUnit.segments.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3>Segments</h3>
                {selectedSegmentId && (
                  <button 
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedSegmentId(null)}
                  >
                    Back to list
                  </button>
                )}
              </div>

              {selectedSegment && selectedUnit ? (
                <SegmentDetails unit={selectedUnit} segment={selectedSegment} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                  {selectedUnit.segments.map(segment => {
                    const durabilityPercent = (segment.durability / segment.maxDurability) * 100;
                    const healthColor = durabilityPercent > 66 ? '#10b981' : durabilityPercent > 33 ? '#f59e0b' : '#ef4444';
                    
                    return (
                      <div 
                        key={segment.id}
                        style={{
                          padding: '0.75rem',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedSegmentId(segment.id)}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {segment.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                          {segment.type}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span>Durability</span>
                          <span>{segment.durability}/{segment.maxDurability}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              height: '100%', 
                              backgroundColor: healthColor,
                              width: `${durabilityPercent}%`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          <h3>Weapons</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            {selectedUnit.weapons.map((weapon, index) => {
              // Check if weapon is linked to a subsystem
              const linkedSubsystem = selectedUnit.subsystems.find(s => s.weaponId === weapon.id);
              const isWeaponFunctional = !linkedSubsystem || linkedSubsystem.functional;
              
              return (
                <div 
                  key={index}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: isWeaponFunctional ? 'white' : '#fee2e2',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      {weapon.name}
                      <span style={{ 
                        marginLeft: '0.5rem',
                        fontWeight: 'normal',
                        fontSize: '0.8rem',
                        backgroundColor: weapon.range === 'melee' ? '#fef3c7' : '#e8f4fe',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: weapon.range === 'melee' ? '#d97706' : '#0078d4'
                      }}>
                        {weapon.range === 'melee' ? 'Melee' : `Range: ${weapon.range}`}
                      </span>
                    </div>
                    {linkedSubsystem && (
                      <span style={{
                        fontSize: '0.8rem',
                        backgroundColor: isWeaponFunctional ? '#d1fae5' : '#fee2e2',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: isWeaponFunctional ? '#10b981' : '#ef4444'
                      }}>
                        {isWeaponFunctional ? 'Functional' : 'Damaged'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', marginBottom: '4px' }}>
                    <span style={{
                      backgroundColor: (() => {
                        switch(weapon.type) {
                          case 'impact': return '#e8eaf6';
                          case 'bladed': return '#e8f5e9';
                          case 'ballistic': return '#fff3e0';
                          default: return '#f3f4f6';
                        }
                      })(),
                      color: (() => {
                        switch(weapon.type) {
                          case 'impact': return '#3f51b5';
                          case 'bladed': return '#43a047';
                          case 'ballistic': return '#ef6c00';
                          default: return '#6b7280';
                        }
                      })(),
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}>
                      {weapon.type?.charAt(0).toUpperCase() + weapon.type?.slice(1) || 'Unknown'}
                    </span>
                    <span>DIFF: {weapon.difficulty} | ARC: {weapon.arcWidth}°</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {weapon.type === 'impact' && weapon.force !== undefined && (
                      <span style={{ marginRight: '8px' }}>Force: {weapon.force}</span>
                    )}
                    {weapon.type === 'ballistic' && weapon.penetration !== undefined && (
                      <span style={{ marginRight: '8px' }}>Penetration: {weapon.penetration}</span>
                    )}
                    {weapon.type === 'bladed' && (
                      <>
                        {weapon.edge !== undefined && <span style={{ marginRight: '8px' }}>Edge: {weapon.edge}</span>}
                        {weapon.power !== undefined && <span style={{ marginRight: '8px' }}>Power: {weapon.power}</span>}
                        {weapon.precision !== undefined && <span style={{ marginRight: '8px' }}>Precision: {weapon.precision}</span>}
                      </>
                    )}
                  </div>
                  {linkedSubsystem && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#6b7280' }}>
                      Linked to: {linkedSubsystem.name} subsystem
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedUnit.specialMoves.length > 0 && (
            <>
              <h3>Special Moves</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {selectedUnit.specialMoves.map((move) => (
                  <div 
                    key={move.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        {move.name}
                        <span style={{ 
                          marginLeft: '0.5rem',
                          fontWeight: 'normal',
                          fontSize: '0.8rem',
                          backgroundColor: (() => {
                            switch (move.effect) {
                              case 'damage': return '#fee2e2';
                              case 'defense': return '#d1fae5';
                              case 'utility': return '#e0e7ff';
                              case 'buff': return '#fef3c7';
                              default: return '#f3f4f6';
                            }
                          })(),
                          padding: '2px 6px',
                          borderRadius: '10px',
                          color: (() => {
                            switch (move.effect) {
                              case 'damage': return '#dc2626';
                              case 'defense': return '#10b981';
                              case 'utility': return '#4f46e5';
                              case 'buff': return '#d97706';
                              default: return '#6b7280';
                            }
                          })()
                        }}>
                          {move.effect}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem',
                        backgroundColor: move.currentCooldown > 0 ? '#f3f4f6' : '#d1fae5',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: move.currentCooldown > 0 ? '#6b7280' : '#10b981'
                      }}>
                        {move.currentCooldown > 0 ? `CD: ${move.currentCooldown}` : 'Ready'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {move.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Targeting: {move.targeting}{move.range ? ` | Range: ${move.range}` : ''} | Cooldown: {move.cooldown}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Status Effects section removed since we're showing them at the top */}
        </div>
      )}

      {selectedPilot && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            marginBottom: '1rem',
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ff9800',
                marginRight: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                color: 'white',
                border: '1px solid rgba(0,0,0,0.2)'
              }}
            >
              {selectedPilot.name.substring(0, 1)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedPilot.name}</h2>
              <div>
                {state.units.find(unit => unit.pilotId === selectedPilot.id) ? (
                  <span style={{ 
                    fontSize: '0.875rem', 
                    backgroundColor: '#fff3e0', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    color: '#ff9800'
                  }}>
                    Piloting: {state.units.find(unit => unit.pilotId === selectedPilot.id)?.name}
                  </span>
                ) : (
                  <span style={{ 
                    fontSize: '0.875rem', 
                    backgroundColor: '#f0f0f0', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    color: '#666'
                  }}>
                    Not Piloting
                  </span>
                )}
              </div>
            </div>
          </div>
            
            {/* Pilot Status Effects in the name card (if present) */}
            {selectedPilot.status && Object.keys(selectedPilot.status).some(key => selectedPilot.status[key]) && (
              <div style={{ 
                marginTop: '0.75rem',
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.5rem'
              }}>
                {Object.entries(selectedPilot.status).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <div 
                      key={key}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: (() => {
                          switch (key) {
                            case 'stressed': return '#fee2e2';
                            case 'injured': return '#fee2e2';
                            case 'panicked': return '#fee2e2';
                            default: return '#f3f4f6';
                          }
                        })(),
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold',
                        color: (() => {
                          switch (key) {
                            case 'stressed': return '#dc2626';
                            case 'injured': return '#dc2626';
                            case 'panicked': return '#dc2626';
                            default: return '#6b7280';
                          }
                        })()
                      }}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <h3>Pilot Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <EditableStat
              label="Aggression"
              value={selectedPilot.aggression}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_PILOT', 
                  pilotId: selectedPilot.id, 
                  changes: { aggression: newValue } 
                });
              }}
            />
            <EditableStat
              label="Preservation"
              value={selectedPilot.preservation}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_PILOT', 
                  pilotId: selectedPilot.id, 
                  changes: { preservation: newValue } 
                });
              }}
            />
            <EditableStat
              label="Psyche"
              value={selectedPilot.psyche}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_PILOT', 
                  pilotId: selectedPilot.id, 
                  changes: { psyche: newValue } 
                });
              }}
            />
            <EditableStat
              label="Sync Rate"
              value={selectedPilot.sync}
              onChange={(newValue) => {
                dispatch({ 
                  type: 'UPDATE_PILOT', 
                  pilotId: selectedPilot.id, 
                  changes: { sync: newValue } 
                });
              }}
            />
          </div>

          {selectedPilot.specialMoves.length > 0 && (
            <>
              <h3>Pilot Special Moves</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {selectedPilot.specialMoves.map((move) => (
                  <div 
                    key={move.id}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        {move.name}
                        <span style={{ 
                          marginLeft: '0.5rem',
                          fontWeight: 'normal',
                          fontSize: '0.8rem',
                          backgroundColor: (() => {
                            switch (move.effect) {
                              case 'damage': return '#fee2e2';
                              case 'defense': return '#d1fae5';
                              case 'utility': return '#e0e7ff';
                              case 'buff': return '#fef3c7';
                              default: return '#f3f4f6';
                            }
                          })(),
                          padding: '2px 6px',
                          borderRadius: '10px',
                          color: (() => {
                            switch (move.effect) {
                              case 'damage': return '#dc2626';
                              case 'defense': return '#10b981';
                              case 'utility': return '#4f46e5';
                              case 'buff': return '#d97706';
                              default: return '#6b7280';
                            }
                          })()
                        }}>
                          {move.effect}
                        </span>
                      </div>
                      <div style={{ 
                        fontSize: '0.8rem',
                        backgroundColor: move.currentCooldown > 0 ? '#f3f4f6' : '#d1fae5',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        color: move.currentCooldown > 0 ? '#6b7280' : '#10b981'
                      }}>
                        {move.currentCooldown > 0 ? `CD: ${move.currentCooldown}` : 'Ready'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {move.description}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      Targeting: {move.targeting} | Cooldown: {move.cooldown}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {/* Pilot Status Effects section removed since we're showing them at the top */}
        </div>
      )}
    </div>
  );
};

export default DetailsPanel;