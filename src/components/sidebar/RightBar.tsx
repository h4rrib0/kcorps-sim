import React from 'react';
import { useGameState } from '../context';
import { Unit } from '../types';

const RightBar: React.FC = () => {
    const [unitName, setUnitName] = React.useState("");
    const [durability, setDurability] = React.useState(0);
    const [armor, setArmor] = React.useState(0);
    const [agility, setAgility] = React.useState(0);
    const [strength, setStrength] = React.useState(0);
    const { state, dispatch } = useGameState();

    const handleAddUnit = () => {
        if (unitName.trim() !== "") {
            const newUnit: Unit = {
                id: String(Date.now()),
                name: unitName,
                durability: { current: durability, max: durability },
                armor,
                agility,
                strength,
                weapons: [],
                subsystems: [],
                status: {}
                // Note: no "position", so it's off‑field.
            };
            dispatch({ type: 'ADD_UNIT', unit: newUnit });
            setUnitName("");
            // Removed auto-selection.
        }
    };

    return (
        <div style={{ 
            position: 'fixed', 
            right: 0, 
            top: 0, 
            width: 400, 
            height: '100vh', 
            backgroundColor: '#f5f5f5', 
            padding: '1rem', 
            overflowY: 'auto' 
        }}>
            <div style={{ 
                backgroundColor: 'white', 
                padding: '1rem', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                    <label style={{ display: 'block', marginBottom: '0.25rem' }}>Strength:</label>
                    <input
                        type="number"
                        value={strength}
                        onChange={(e) => setStrength(Number(e.target.value))}
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

            {/* Off‐field units list */}
            <div style={{ marginTop: '1rem' }}>
                <h3>Off‑Field Units</h3>
                <ul>
                    {state.units.filter(unit => !unit.position).map((unit) => (
                        <li 
                            key={unit.id} 
                            onClick={() => dispatch({ type: 'SELECT_UNIT', unitId: unit.id })}
                            style={{ 
                                cursor: 'pointer', 
                                padding: '0.5rem',
                                backgroundColor: state.selectedUnitId === unit.id ? '#e0e0e0' : 'transparent'
                            }}
                        >
                            <strong>{unit.name}</strong> <br />
                            Durability: {unit.durability.current}/{unit.durability.max} <br />
                            Armor: {unit.armor} | Agility: {unit.agility} | Strength: {unit.strength}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Optionally, a separate list for placed units */}
            <div style={{ marginTop: '1rem' }}>
                <h3>Placed Units</h3>
                <ul>
                    {state.units.filter(unit => unit.position).map((unit) => (
                        <li 
                            key={unit.id}
                            onClick={() => dispatch({ type: 'SELECT_UNIT', unitId: unit.id })}
                            style={{ 
                                cursor: 'pointer', 
                                padding: '0.5rem', 
                                backgroundColor: state.selectedUnitId === unit.id ? '#e0e0e0' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div>
                                <strong>{unit.name}</strong> <br />
                                Position: ({unit.position?.x}, {unit.position?.y}) - Facing: {unit.position?.facing}
                            </div>
                            <div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ type: 'ROTATE_UNIT_CLOCKWISE', unitId: unit.id });
                                    }}
                                    style={{ 
                                        padding: '0.3rem 0.5rem', 
                                        marginRight: '0.5rem',
                                        border: 'none', 
                                        backgroundColor: '#007bff', 
                                        color: 'white', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer'
                                    }}
                                >
                                    Rotate CW
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch({ type: 'ROTATE_UNIT_COUNTERCLOCKWISE', unitId: unit.id });
                                    }}
                                    style={{ 
                                        padding: '0.3rem 0.5rem', 
                                        marginRight: '0.5rem',
                                        border: 'none', 
                                        backgroundColor: '#007bff', 
                                        color: 'white', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer'
                                    }}
                                >
                                    Rotate CCW
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
                                        cursor: 'pointer'
                                    }}
                                >
                                    Move Forward
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RightBar;