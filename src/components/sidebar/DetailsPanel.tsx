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

  // Calculate total durability from segments if available
  const calculateTotalDurability = () => {
    if (!selectedUnit) return { current: 0, max: 0 };
    
    if (selectedUnit.segments && selectedUnit.segments.length > 0) {
      const current = selectedUnit.segments.reduce((sum, segment) => sum + segment.durability, 0);
      const max = selectedUnit.segments.reduce((sum, segment) => sum + segment.maxDurability, 0);
      return { current, max };
    }
    
    return selectedUnit.durability || { current: 0, max: 0 };
  };

  const totalDurability = calculateTotalDurability();

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <EditableStat
              label="Durability"
              value={totalDurability.current}
              max={totalDurability.max}
              onChange={(newValue) => {
                // Not implementing onChange for segment-based durability
              }}
            />
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
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    FOR: {weapon.force} | PEN: {weapon.penetration} | DIFF: {weapon.difficulty} | ARC: {weapon.arcWidth}°
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