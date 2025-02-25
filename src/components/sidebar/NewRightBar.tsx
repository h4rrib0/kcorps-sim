import React, { useState } from 'react';
import { useGameState } from '../context';
import { Unit } from '../types';
import TabPanel from './TabPanel';

const NewRightBar: React.FC = () => {
    // Unit form state with sensible defaults
    const [unitName, setUnitName] = React.useState("");
    const [unitType, setUnitType] = React.useState<'mecha' | 'kaiju'>('mecha');
    const [durability, setDurability] = React.useState(10);
    const [armor, setArmor] = React.useState(2);
    const [agility, setAgility] = React.useState(2);
    const [mass, setMass] = React.useState(5);
    
    // Pilot form state with sensible defaults
    const [pilotName, setPilotName] = React.useState("");
    const [precision, setPrecision] = React.useState(1);
    const [preservation, setPreservation] = React.useState(1);
    const [psyche, setPsyche] = React.useState(1);
    
    const { state, dispatch } = useGameState();

    const handleAddUnit = () => {

        if (unitName.trim() !== "") {
            // Create default special moves based on unit type
            const defaultSpecialMoves = [
            ];

            const newUnit: Unit = {
                id: String(Date.now()),
                name: unitName,
                type: unitType,
                durability: { current: durability || 10, max: durability || 10 }, // Default to 10 if 0
                armor: armor || 2, // Default to 2 if 0
                agility: agility || 2, // Default to 2 if 0
                mass: mass || 5, // Default to 5 if 0
                weapons: [
                    { 
                        name: `${unitName}'s Melee Weapon`, 
                        damage: 3, 
                        penetration: 1, 
                        difficulty: 1,
                        range: 'melee',
                        arcWidth: 120
                    },
                    { 
                        name: `${unitName}'s Ranged Weapon`, 
                        damage: 2, 
                        penetration: 1, 
                        difficulty: 2,
                        range: 3,
                        arcWidth: 60
                    }
                ],
                specialMoves: defaultSpecialMoves,
                subsystems: [],
                status: {}
                // Note: no "position", so it's off‑field.
            };

            console.log('Adding unit:', newUnit);
            dispatch({ type: 'ADD_UNIT', unit: newUnit });
            // Reset form after adding unit, keeping sensible defaults
            setUnitName("");
            setDurability(10);
            setArmor(2);
            setAgility(2);
            setMass(5);
        }
    };

    // Add pilot handler
    const handleAddPilot = () => {

        if (pilotName.trim() !== "") {
            // Create default pilot special moves
            const defaultPilotMoves = [];
            
            const newPilot = {
                id: String(Date.now()),
                name: pilotName,
                precision: precision || 1, // Default to 1 if 0
                preservation: preservation || 1, // Default to 1 if 0
                psyche: psyche || 1, // Default to 1 if 0
                sync: 0, // Always starts at 0
                specialMoves: defaultPilotMoves,
                status: {}
            };
            
            console.log('Adding pilot:', newPilot);
            dispatch({ type: 'ADD_PILOT', pilot: newPilot });
            setPilotName("");
            setPrecision(1);
            setPreservation(1);
            setPsyche(1);
            
            // Log state after dispatch
            console.log('State after add pilot dispatch:', state);
        }
    };

    // Render content for the different tabs
    // Log state in render for debugging

    const renderCreateTabContent = () => (
        <div style={{ padding: '0.5rem', overflowY: 'auto' }}>
            {/* Unit Creation Form */}
            <div style={{ 
                backgroundColor: 'white', 
                padding: '1rem', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '1rem'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Create New Unit</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Unit Name:</label>
                    <input 
                        type="text"
                        value={unitName}
                        onChange={(e) => setUnitName(e.target.value)}
                        placeholder="Enter unit name"
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Unit Type:</label>
                    <select
                        value={unitType}
                        onChange={(e) => setUnitType(e.target.value as any)}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    >
                        <option value="mecha">Mecha (Pilotable)</option>
                        <option value="kaiju">Kaiju (Non-Pilotable)</option>
                    </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Durability:</label>
                    <input
                        type="number"
                        value={durability}
                        onChange={(e) => setDurability(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Armor:</label>
                    <input
                        type="number"
                        value={armor}
                        onChange={(e) => setArmor(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Agility:</label>
                    <input
                        type="number"
                        value={agility}
                        onChange={(e) => setAgility(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Mass:</label>
                    <input
                        type="number"
                        value={mass}
                        onChange={(e) => setMass(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <button 
                    style={{ 
                        padding: '0.5rem 1rem', 
                        width: '100%',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }} 
                    onClick={handleAddUnit}
                >
                    Add Unit
                </button>
            </div>

            {/* Pilot Creation Form */}
            <div style={{ 
                backgroundColor: 'white', 
                padding: '1rem', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginBottom: '1rem' }}>Create New Pilot</h3>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Pilot Name:</label>
                    <input 
                        type="text"
                        value={pilotName}
                        onChange={(e) => setPilotName(e.target.value)}
                        placeholder="Enter pilot name"
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Precision:</label>
                    <input
                        type="number"
                        value={precision}
                        onChange={(e) => setPrecision(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Preservation:</label>
                    <input
                        type="number"
                        value={preservation}
                        onChange={(e) => setPreservation(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Psyche:</label>
                    <input
                        type="number"
                        value={psyche}
                        onChange={(e) => setPsyche(Number(e.target.value))}
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                        }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Sync Rate:</label>
                    <input
                        type="number"
                        value={0}
                        disabled
                        style={{ 
                            padding: '0.5rem',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            backgroundColor: '#f0f0f0'
                        }}
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                        All pilots start with 0 sync rate
                    </small>
                </div>
                <button 
                    style={{ 
                        padding: '0.5rem 1rem', 
                        width: '100%',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }} 
                    onClick={handleAddPilot}
                >
                    Add Pilot
                </button>
            </div>
        </div>
    );

    const renderPilotsTabContent = () => (
        <div style={{ padding: '0.5rem', overflowY: 'auto' }}>
            <h3>Available Pilots ({state.pilots.length})</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {state.pilots.length === 0 ? (
                    <li style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', margin: '0.5rem 0', borderRadius: '4px' }}>
                        No pilots available. Create a pilot in the Create tab.
                    </li>
                ) : state.pilots.map((pilot) => (
                    <li 
                        key={pilot.id} 
                        onClick={() => dispatch({ type: 'SELECT_PILOT', pilotId: pilot.id })}
                        style={{ 
                            cursor: 'pointer', 
                            padding: '0.75rem',
                            backgroundColor: state.selectedPilotId === pilot.id ? '#e0e0e0' : 'white',
                            margin: '0.5rem 0',
                            borderRadius: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderLeft: '5px solid #ff9800'
                        }}
                    >
                        <div>
                            <strong>{pilot.name}</strong> <br />
                            <div style={{ marginTop: '5px', fontSize: '13px' }}>
                                <span style={{ display: 'inline-block', marginRight: '10px' }}>PRE: {pilot.precision}</span>
                                <span style={{ display: 'inline-block', marginRight: '10px' }}>PRS: {pilot.preservation}</span>
                                <span style={{ display: 'inline-block', marginRight: '10px' }}>PSY: {pilot.psyche}</span>
                                <span style={{ display: 'inline-block' }}>SYNC: {pilot.sync}</span>
                            </div>
                            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                                Special Moves: {pilot.specialMoves.map(m => m.name).join(', ')}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ type: 'REMOVE_PILOT_ENTRY', pilotId: pilot.id });
                                }}
                                style={{
                                    marginTop: '5px',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            >
                                Remove Pilot
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderUnitsTabContent = () => (
        <div style={{ padding: '0.5rem', overflowY: 'auto' }}>
            <h3>Off‑Field Units ({state.units.filter(unit => !unit.position).length})</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {state.units.length === 0 ? (
                    <li style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', margin: '0.5rem 0', borderRadius: '4px' }}>
                        No units available. Create a unit in the Create tab.
                    </li>
                ) : state.units.filter(unit => !unit.position).length === 0 ? (
                    <li style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', margin: '0.5rem 0', borderRadius: '4px' }}>
                        All units are currently placed on the field.
                    </li>
                ) : state.units.filter(unit => !unit.position).map((unit) => (
                    <li 
                        key={unit.id} 
                        onClick={() => dispatch({ type: 'SELECT_UNIT', unitId: unit.id })}
                        style={{ 
                            cursor: 'pointer', 
                            padding: '0.75rem',
                            backgroundColor: state.selectedUnitId === unit.id ? '#e0e0e0' : 'white',
                            margin: '0.5rem 0',
                            borderRadius: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            borderLeft: `5px solid ${(() => {
                              // Same hash function as in Unit component
                              const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                              const hue = hash % 360;
                              return `hsl(${hue}, 80%, 70%)`;
                            })()}`
                        }}
                    >
                        <div 
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: (() => {
                              // Same hash function as in Unit component
                              const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                              const hue = hash % 360;
                              return `hsl(${hue}, 80%, 70%)`;
                            })(),
                            marginRight: '10px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            border: '1px solid rgba(0,0,0,0.2)'
                          }}
                        >
                          {unit.name.substring(0, 1)}
                        </div>
                        <div>
                          <strong>{unit.name}</strong> 
                          <span style={{ 
                              marginLeft: '8px', 
                              fontSize: '12px', 
                              backgroundColor: '#f0f0f0', 
                              padding: '2px 6px', 
                              borderRadius: '10px', 
                              color: '#666'
                          }}>
                            {unit.type}
                          </span>
                          {unit.pilotId && (
                            <span style={{
                                marginLeft: '8px',
                                fontSize: '12px',
                                backgroundColor: '#fff3e0',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                color: '#ff9800',
                                border: '1px solid #ffcc80'
                            }}>
                                Piloted
                            </span>
                          )}
                          <br />
                          Durability: {unit.durability.current}/{unit.durability.max} <br />
                          Armor: {unit.armor} | Agility: {unit.agility} | Mass: {unit.mass} <br />
                          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                              Special Moves: {unit.specialMoves.map(m => m.name).join(', ')}
                          </div>
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                dispatch({ type: 'REMOVE_UNIT', unitId: unit.id });
                            }}
                            style={{
                                marginTop: '5px',
                                padding: '2px 6px',
                                fontSize: '10px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                          >
                            Delete Unit
                          </button>
                          {unit.pilotId && (
                            <div style={{ 
                                marginTop: '5px', 
                                fontSize: '12px', 
                                display: 'flex',
                                alignItems: 'center' 
                            }}>
                                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                                    Pilot: {state.pilots.find(p => p.id === unit.pilotId)?.name}
                                </span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ type: 'REMOVE_PILOT', unitId: unit.id });
                                    }}
                                    style={{
                                        padding: '2px 6px',
                                        fontSize: '10px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Eject
                                </button>
                            </div>
                          )}
                          {!unit.pilotId && state.selectedPilotId && unit.type === 'mecha' && (
                            <div style={{ marginTop: '5px' }}>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ 
                                            type: 'ASSIGN_PILOT', 
                                            unitId: unit.id, 
                                            pilotId: state.selectedPilotId 
                                        });
                                    }}
                                    style={{
                                        padding: '2px 6px',
                                        fontSize: '11px',
                                        backgroundColor: '#4caf50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Assign Selected Pilot
                                </button>
                            </div>
                          )}
                          {!unit.pilotId && unit.type === 'kaiju' && (
                            <div style={{ 
                                marginTop: '5px', 
                                fontSize: '11px',
                                color: '#ff9800',
                                fontStyle: 'italic'
                            }}>
                                Kaiju cannot be piloted
                            </div>
                          )}
                        </div>
                    </li>
                ))}
            </ul>

            <h3>Placed Units ({state.units.filter(unit => unit.position).length})</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {state.units.filter(unit => unit.position).length === 0 ? (
                    <li style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', margin: '0.5rem 0', borderRadius: '4px' }}>
                        No units placed on the field yet.
                    </li>
                ) : state.units.filter(unit => unit.position).map((unit) => (
                    <li 
                        key={unit.id}
                        onClick={() => dispatch({ type: 'SELECT_UNIT', unitId: unit.id })}
                        style={{ 
                            cursor: 'pointer', 
                            padding: '0.75rem', 
                            backgroundColor: state.selectedUnitId === unit.id ? '#e0e0e0' : 'white',
                            margin: '0.5rem 0',
                            borderRadius: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            borderLeft: `5px solid ${(() => {
                              // Same hash function as in Unit component
                              const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                              const hue = hash % 360;
                              return `hsl(${hue}, 80%, 70%)`;
                            })()}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div 
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: (() => {
                                  // Same hash function as in Unit component
                                  const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                  const hue = hash % 360;
                                  return `hsl(${hue}, 80%, 70%)`;
                                })(),
                                marginRight: '10px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                border: '1px solid rgba(0,0,0,0.2)'
                              }}
                            >
                              {unit.name.substring(0, 1)}
                            </div>
                            <div>
                                <strong>{unit.name}</strong> <br />
                                Position: ({unit.position?.x}, {unit.position?.y}) - Facing: {unit.position?.facing}° <br />
                                HP: {unit.durability.current}/{unit.durability.max}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ type: 'ROTATE_UNIT_COUNTERCLOCKWISE', unitId: unit.id });
                                }}
                                style={{ 
                                    padding: '0.3rem 0.5rem', 
                                    border: 'none', 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                ⟲ Rotate
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ type: 'ROTATE_UNIT_CLOCKWISE', unitId: unit.id });
                                }}
                                style={{ 
                                    padding: '0.3rem 0.5rem', 
                                    border: 'none', 
                                    backgroundColor: '#007bff', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                ⟳ Rotate
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ type: 'MOVE_UNIT_FORWARD', unitId: unit.id });
                                }}
                                style={{ 
                                    padding: '0.3rem 0.5rem', 
                                    border: 'none', 
                                    backgroundColor: '#28a745', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                ⬆ Move
                            </button>
                            
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ type: 'ENTER_ATTACK_MODE', unitId: unit.id });
                                }}
                                style={{ 
                                    padding: '0.3rem 0.5rem', 
                                    border: 'none', 
                                    backgroundColor: '#dc3545', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                ⚔️ Attack
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    dispatch({ type: 'ENTER_SPECIAL_MOVE_MODE', unitId: unit.id, sourceType: 'unit' });
                                }}
                                style={{ 
                                    padding: '0.3rem 0.5rem', 
                                    border: 'none', 
                                    backgroundColor: '#9c27b0', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                ✨ Unit Special
                            </button>
                            {unit.type === 'mecha' && unit.pilotId && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ type: 'ENTER_SPECIAL_MOVE_MODE', unitId: unit.id, sourceType: 'pilot' });
                                    }}
                                    style={{ 
                                        padding: '0.3rem 0.5rem', 
                                        border: 'none', 
                                        backgroundColor: '#ff9800', 
                                        color: 'white', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        flex: '1'
                                    }}
                                >
                                    👤 Pilot Special
                                </button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div style={{ 
            width: '350px', 
            height: '100vh',  
            backgroundColor: '#f5f5f5', 
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #ddd',
            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
            flexShrink: 0
        }}>
            <TabPanel defaultTab="controls">
                <TabPanel.Tab id="controls" label="Controls">
                    {renderUnitsTabContent()}
                </TabPanel.Tab>
                <TabPanel.Tab id="create" label="Create">
                    {renderCreateTabContent()}
                </TabPanel.Tab>
                <TabPanel.Tab id="pilots" label="Pilots">
                    {renderPilotsTabContent()}
                </TabPanel.Tab>
            </TabPanel>
        </div>
    );
};

export default NewRightBar;