import React, { useState } from 'react';
import { useGameState } from '../context';
import { Unit, Weapon, WeaponType } from '../types';
import TabPanel from './TabPanel';

// Reusable Weapon Form component
interface WeaponFormProps {
    weaponName: string;
    setWeaponName: (name: string) => void;
    weaponType: WeaponType;
    setWeaponType: (type: WeaponType) => void;
    weaponForce: number;
    setWeaponForce: (force: number) => void;
    weaponPenetration: number;
    setWeaponPenetration: (penetration: number) => void;
    weaponEdge: number;
    setWeaponEdge: (edge: number) => void;
    weaponPower: number;
    setWeaponPower: (power: number) => void;
    weaponPrecision: number;
    setWeaponPrecision: (precision: number) => void;
    weaponDifficulty: number;
    setWeaponDifficulty: (difficulty: number) => void;
    weaponRange: 'melee' | number;
    setWeaponRange: (range: 'melee' | number) => void;
    weaponArcWidth: number;
    setWeaponArcWidth: (arcWidth: number) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    onRemove?: () => void;
    index?: number;
}

// Helper function for numeric inputs
const NumberInput: React.FC<{
    value: number;
    onChange: (value: number) => void;
    label?: string;
    description?: string;
    min?: number;
    max?: number;
    step?: number;
}> = ({ value, onChange, label, description, min, max, step }) => {
    return (
        <div style={{ marginBottom: '0.75rem' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '0.25rem' }}>{label}</label>
            )}
            <input
                type="number"
                value={value === 0 ? '' : value}
                onChange={(e) => {
                    const inputValue = e.target.value;
                    onChange(inputValue === '' ? 0 : Number(inputValue));
                }}
                style={{ 
                    padding: '0.5rem',
                    width: '100%',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                }}
                min={min}
                max={max}
                step={step}
            />
            {description && (
                <small style={{ color: '#666', fontSize: '11px' }}>
                    {description}
                </small>
            )}
        </div>
    );
};

const WeaponForm: React.FC<WeaponFormProps> = ({
    weaponName, setWeaponName,
    weaponType, setWeaponType,
    weaponForce, setWeaponForce,
    weaponPenetration, setWeaponPenetration,
    weaponEdge, setWeaponEdge,
    weaponPower, setWeaponPower,
    weaponPrecision, setWeaponPrecision,
    weaponDifficulty, setWeaponDifficulty,
    weaponRange, setWeaponRange,
    weaponArcWidth, setWeaponArcWidth,
    isCollapsed, setIsCollapsed,
    onRemove,
    index
}) => {
    return (
        <div style={{ 
            marginBottom: '1rem', 
            backgroundColor: '#f9f9f9', 
            padding: '1rem', 
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: isCollapsed ? 0 : '0.75rem',
                cursor: 'pointer'
            }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <h4 style={{ margin: 0 }}>
                    {index !== undefined ? `Weapon #${index + 1}` : 'Weapon'}: {weaponName || 'New Weapon'}
                </h4>
                <div>
                    {onRemove && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent collapse toggle
                                onRemove();
                            }}
                            style={{
                                marginRight: '8px',
                                padding: '2px 8px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Remove
                        </button>
                    )}
                    <span style={{ fontSize: '18px' }}>
                        {isCollapsed ? '▼' : '▲'}
                    </span>
                </div>
            </div>
            
            {!isCollapsed && (
                <>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Weapon Name:</label>
                        <input 
                            type="text"
                            value={weaponName}
                            onChange={(e) => setWeaponName(e.target.value)}
                            placeholder="Enter weapon name"
                            style={{ 
                                padding: '0.5rem',
                                width: '100%',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    
                    <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Weapon Type:</label>
                        <select
                            value={weaponType}
                            onChange={(e) => setWeaponType(e.target.value as WeaponType)}
                            style={{ 
                                padding: '0.5rem',
                                width: '100%',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="impact">Impact (Crushing/Blunt)</option>
                            <option value="bladed">Bladed (Cutting/Slashing)</option>
                            <option value="ballistic">Ballistic (Ranged/Projectile)</option>
                        </select>
                    </div>
                    
                    {weaponType === 'impact' && (
                        <NumberInput 
                            value={weaponForce}
                            onChange={setWeaponForce}
                            label="Force:"
                            description="Impact damage (only for impact weapons)"
                        />
                    )}
                    
                    {weaponType === 'ballistic' && (
                        <NumberInput 
                            value={weaponPenetration}
                            onChange={setWeaponPenetration}
                            label="Penetration:"
                            description="Armor penetration value"
                        />
                    )}
                    
                    {weaponType === 'bladed' && (
                        <>
                            <NumberInput 
                                value={weaponEdge}
                                onChange={setWeaponEdge}
                                label="Edge:"
                                description="Cutting damage"
                            />
                            
                            <NumberInput 
                                value={weaponPower}
                                onChange={setWeaponPower}
                                label="Power:"
                                description="Secondary force for bladed weapons"
                            />
                            
                            <NumberInput 
                                value={weaponPrecision}
                                onChange={setWeaponPrecision}
                                label="Precision:"
                                description="Used for critical hits"
                            />
                        </>
                    )}
                    
                    <NumberInput 
                        value={weaponDifficulty}
                        onChange={setWeaponDifficulty}
                        label="Difficulty:"
                        description="Added to defense target"
                    />
                    
                    <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>Range:</label>
                        <select
                            value={weaponRange === 'melee' ? 'melee' : 'ranged'}
                            onChange={(e) => {
                                if (e.target.value === 'melee') {
                                    setWeaponRange('melee');
                                } else {
                                    setWeaponRange(3); // Default ranged value
                                }
                            }}
                            style={{ 
                                padding: '0.5rem',
                                width: '100%',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="melee">Melee (same tile)</option>
                            <option value="ranged">Ranged</option>
                        </select>
                        
                        {weaponRange !== 'melee' && (
                            <NumberInput 
                                value={weaponRange === 'melee' ? 0 : weaponRange as number}
                                onChange={(value) => setWeaponRange(value)}
                                label="Range (tiles):"
                                min={1}
                            />
                        )}
                    </div>
                    
                    <NumberInput 
                        value={weaponArcWidth}
                        onChange={setWeaponArcWidth}
                        label="Arc Width (degrees):"
                        description="How wide the weapon can attack (30-360°)"
                        min={30}
                        max={360}
                        step={30}
                    />
                </>
            )}
        </div>
    );
};

// Define a type for weapon form state
interface WeaponFormState {
    name: string;
    type: WeaponType;
    force: number;
    penetration: number;
    edge: number;
    power: number;
    precision: number;
    difficulty: number;
    range: 'melee' | number;
    arcWidth: number;
    isCollapsed: boolean;
}

// Function to create a default weapon form
const createDefaultWeaponForm = (namePrefix: string = "Weapon"): WeaponFormState => ({
    name: `${namePrefix}`,
    type: 'impact',
    force: 8,
    penetration: 1,
    edge: 0,
    power: 0,
    precision: 0,
    difficulty: 1,
    range: 'melee',
    arcWidth: 120,
    isCollapsed: false
});

const RightBar: React.FC = () => {
    // Unit form state with sensible defaults
    const [unitName, setUnitName] = React.useState("");
    const [unitType, setUnitType] = React.useState<'mecha' | 'kaiju'>('mecha');
    const [durability, setDurability] = React.useState(10);
    const [armor, setArmor] = React.useState(2);
    const [agility, setAgility] = React.useState(2);
    const [mass, setMass] = React.useState(5);
    const [precision, setPrecision] = React.useState(2);
    
    // Multiple weapons state
    const [weapons, setWeapons] = React.useState<WeaponFormState[]>([
        createDefaultWeaponForm("Primary Weapon")
    ]);
    
    // Function to add a new weapon form
    const addWeaponForm = () => {
        setWeapons([...weapons, createDefaultWeaponForm(`Weapon #${weapons.length + 1}`)]);
    };
    
    // Function to update a specific weapon form
    const updateWeaponForm = (index: number, updates: Partial<WeaponFormState>) => {
        const updatedWeapons = [...weapons];
        updatedWeapons[index] = { ...updatedWeapons[index], ...updates };
        setWeapons(updatedWeapons);
    };
    
    // Function to remove a weapon form
    const removeWeaponForm = (index: number) => {
        const updatedWeapons = [...weapons];
        updatedWeapons.splice(index, 1);
        setWeapons(updatedWeapons);
    };
    
    // Pilot form state with sensible defaults
    const [pilotName, setPilotName] = React.useState("");
    const [aggression, setAggression] = React.useState(1);
    const [preservation, setPreservation] = React.useState(1);
    const [psyche, setPsyche] = React.useState(1);
    
    // Confirmation state
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);
    const [showUnplaceConfirm, setShowUnplaceConfirm] = React.useState<string | null>(null);
    const [showGrappleTargets, setShowGrappleTargets] = React.useState<string | null>(null);
    
    const { state, dispatch } = useGameState();

    const handleAddUnit = () => {

        if (unitName.trim() !== "") {
            // Create default special moves based on unit type
            const defaultSpecialMoves = [
            ];

            // Set up timestamp for IDs
            const timestamp = Date.now();
            
            // Generate default segments (head, core, and arms)
            const defaultDurability = durability || 10;
            const defaultArmor = armor || 2;

            // Create weapons from user inputs
            const unitWeapons = weapons.map((weaponForm, index) => {
                // Create a weapon based on the weapon form
                return {
                    id: `weapon-${timestamp}-${index}`,
                    name: weaponForm.name || `${unitName}'s Weapon ${index + 1}`,
                    type: weaponForm.type,
                    // Apply force only for impact weapons
                    force: weaponForm.type === 'impact' ? (weaponForm.force || 8) : undefined,
                    // Apply penetration only for ballistic weapons
                    penetration: weaponForm.type === 'ballistic' ? (weaponForm.penetration || 6) : undefined,
                    // Apply edge/power/precision only for bladed weapons
                    edge: weaponForm.type === 'bladed' ? (weaponForm.edge || 6) : undefined,
                    power: weaponForm.type === 'bladed' ? (weaponForm.power || 4) : undefined,
                    precision: weaponForm.type === 'bladed' ? (weaponForm.precision || 1) : undefined,
                    difficulty: weaponForm.difficulty || 1,
                    range: weaponForm.range || 'melee',
                    arcWidth: weaponForm.arcWidth || 120
                };
            });
            
            // Create a backup basic weapon if no weapons were added
            if (unitWeapons.length === 0) {
                unitWeapons.push({ 
                    id: `weapon-${timestamp}-backup`,
                    name: `${unitName}'s Backup Weapon`, 
                    type: 'impact' as const,
                    force: 4, // Force for impact weapon
                    difficulty: 1,
                    range: 'melee',
                    arcWidth: 60
                });
            }
            
            // Create subsystems for weapon mounts
            const weaponSubsystems = unitWeapons.map((weapon, index) => ({
                id: `subsystem-${timestamp}-weapon-${index}`,
                name: `${weapon.name} Mount`,
                type: 'WEAPON' as const,
                functional: true,
                durabilityThreshold: 40,
                weaponId: weapon.id,
                description: `Mount for ${weapon.name}`
            }));
                
                
            const newUnit: Unit = {
                id: String(timestamp),
                name: unitName,
                type: unitType,
                durability: { current: durability || 10, max: durability || 10 }, // Default to 10 if 0
                armor: armor || 2, // Default to 2 if 0
                agility: agility || 2, // Default to 2 if 0
                precision: precision || 2, // Default to 2 if 0
                mass: mass || 5, // Default to 5 if 0
                wounds: 0, // Start with no wounds
                weapons: unitWeapons,
                specialMoves: defaultSpecialMoves,
                subsystems: weaponSubsystems,
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
            setPrecision(2);
            setMass(5);
            
            // Reset weapons to a single default weapon
            setWeapons([createDefaultWeaponForm("Primary Weapon")]);
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
                aggression: aggression || 1, // Default to 1 if 0
                preservation: preservation || 1, // Default to 1 if 0
                psyche: psyche || 1, // Default to 1 if 0
                sync: 0, // Always starts at 0
                specialMoves: defaultPilotMoves,
                status: {}
            };
            
            console.log('Adding pilot:', newPilot);
            dispatch({ type: 'ADD_PILOT', pilot: newPilot });
            setPilotName("");
            setAggression(1);
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
                <NumberInput 
                    value={durability}
                    onChange={setDurability}
                    label="Durability:"
                    description="Unit's health points"
                />
                <NumberInput 
                    value={armor}
                    onChange={setArmor}
                    label="Armor:"
                    description="Damage reduction"
                />
                <NumberInput 
                    value={agility}
                    onChange={setAgility}
                    label="Agility:"
                    description="Affects dodging and movement"
                />
                <NumberInput 
                    value={mass}
                    onChange={setMass}
                    label="Mass:"
                    description="Affects grappling and physical impact"
                />
                <NumberInput 
                    value={precision}
                    onChange={setPrecision}
                    label="Precision:"
                    description="Accuracy bonus for attacks"
                />
                
                {/* Weapons Section */}
                <div style={{ 
                    marginBottom: '1rem', 
                    backgroundColor: '#f0f0f0', 
                    padding: '1rem', 
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '0.75rem' 
                    }}>
                        <h3 style={{ margin: 0 }}>Weapons ({weapons.length})</h3>
                        <button
                            onClick={addWeaponForm}
                            style={{
                                padding: '4px 10px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            Add Weapon
                        </button>
                    </div>
                    
                    {/* Render all weapon forms */}
                    {weapons.map((weaponForm, index) => (
                        <WeaponForm
                            key={index}
                            index={index}
                            weaponName={weaponForm.name}
                            setWeaponName={(name) => updateWeaponForm(index, { name })}
                            weaponType={weaponForm.type}
                            setWeaponType={(type) => updateWeaponForm(index, { type })}
                            weaponForce={weaponForm.force}
                            setWeaponForce={(force) => updateWeaponForm(index, { force })}
                            weaponPenetration={weaponForm.penetration}
                            setWeaponPenetration={(penetration) => updateWeaponForm(index, { penetration })}
                            weaponEdge={weaponForm.edge}
                            setWeaponEdge={(edge) => updateWeaponForm(index, { edge })}
                            weaponPower={weaponForm.power}
                            setWeaponPower={(power) => updateWeaponForm(index, { power })}
                            weaponPrecision={weaponForm.precision}
                            setWeaponPrecision={(precision) => updateWeaponForm(index, { precision })}
                            weaponDifficulty={weaponForm.difficulty}
                            setWeaponDifficulty={(difficulty) => updateWeaponForm(index, { difficulty })}
                            weaponRange={weaponForm.range}
                            setWeaponRange={(range) => updateWeaponForm(index, { range })}
                            weaponArcWidth={weaponForm.arcWidth}
                            setWeaponArcWidth={(arcWidth) => updateWeaponForm(index, { arcWidth })}
                            isCollapsed={weaponForm.isCollapsed}
                            setIsCollapsed={(isCollapsed) => updateWeaponForm(index, { isCollapsed })}
                            onRemove={weapons.length > 1 ? () => removeWeaponForm(index) : undefined}
                        />
                    ))}
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
                <NumberInput 
                    value={aggression}
                    onChange={setAggression}
                    label="Aggression:"
                    description="Used in attack rolls"
                />
                <NumberInput 
                    value={preservation}
                    onChange={setPreservation}
                    label="Preservation:"
                    description="Affects defense rolls"
                />
                <NumberInput 
                    value={psyche}
                    onChange={setPsyche}
                    label="Psyche:"
                    description="Affects sanity rolls"
                />
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
                                <span style={{ display: 'inline-block', marginRight: '10px' }}>AGG: {pilot.aggression}</span>
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
                          <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  
                                  // Enter placement mode with this unit
                                  dispatch({ type: 'ENTER_PLACEMENT_MODE', unitId: unit.id });
                                  
                                  // Then show message to user
                                  dispatch({ 
                                    type: 'LOG_ACTION', 
                                    message: `${unit.name} ready to deploy! Click anywhere on the map to place it.` 
                                  });
                              }}
                              style={{
                                  padding: '2px 6px',
                                  fontSize: '10px',
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '3px',
                                  cursor: 'pointer'
                              }}
                            >
                              Place Unit
                            </button>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(unit.id);
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
                              Delete Unit
                            </button>
                          </div>
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
                          {!unit.pilotId && unit.type === 'mecha' && (
                            <div style={{ marginTop: '5px' }}>
                                {state.selectedPilotId ? (
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
                                ) : (
                                    <div>
                                        <select
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                if (e.target.value) {
                                                    dispatch({ 
                                                        type: 'ASSIGN_PILOT', 
                                                        unitId: unit.id, 
                                                        pilotId: e.target.value
                                                    });
                                                }
                                            }}
                                            style={{
                                                padding: '2px 6px',
                                                fontSize: '11px',
                                                border: '1px solid #ccc',
                                                borderRadius: '3px',
                                                width: '100%',
                                                marginBottom: '3px'
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select a pilot</option>
                                            {state.pilots.map(pilot => (
                                                <option key={pilot.id} value={pilot.id}>
                                                    {pilot.name} (AGG:{pilot.aggression} PRS:{pilot.preservation} PSY:{pilot.psyche})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
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
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>  
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
                            {/* Get Up! button - only shows when the unit is downed */}
                            {unit.status.downed && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Execute Get Up! action on this unit
                                        dispatch({ 
                                            type: 'EXECUTE_SPECIAL_MOVE', 
                                            moveData: {
                                                id: 'get-up-action',
                                                name: 'Get Up!', 
                                                effect: 'buff',
                                                targeting: 'self'
                                            }
                                        });
                                    }}
                                    style={{ 
                                        padding: '0.3rem 0.5rem', 
                                        border: 'none', 
                                        backgroundColor: '#757575', 
                                        color: 'white', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        flex: '1'
                                    }}
                                >
                                    🔄 Get Up!
                                </button>
                            )}
                            
                            {/* Grapple button - only shows when unit is not downed */}
                            {!unit.status.downed && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        
                                        // Find any units in the same tile with this unit
                                        const unitsInSameTile = state.units.filter(u => 
                                            u.id !== unit.id && // Not self
                                            u.position && unit.position && // Both have positions
                                            u.position.x === unit.position.x && // Same x coordinate  
                                            u.position.y === unit.position.y // Same y coordinate
                                        );
                                        
                                        if (unitsInSameTile.length === 0) {
                                            // No units to grapple
                                            dispatch({ 
                                                type: 'LOG_ACTION',
                                                message: 'No other units in the same tile to grapple'
                                            });
                                        } else if (unitsInSameTile.length === 1) {
                                            // Only one unit available, target it automatically
                                            dispatch({ type: 'SELECT_TARGET', unitId: unitsInSameTile[0].id });
                                            // Then execute grapple immediately
                                            dispatch({ 
                                                type: 'EXECUTE_SPECIAL_MOVE', 
                                                moveData: {
                                                    id: 'grapple-action',
                                                    name: 'Grapple Enemy',
                                                    effect: 'grapple',
                                                    targeting: 'enemy'
                                                }
                                            });
                                        } else {
                                            // Multiple units, need to select one
                                            dispatch({ 
                                                type: 'LOG_ACTION',
                                                message: 'Multiple units in tile. Select which unit to grapple.'
                                            });
                                            
                                            // Show a temporary selection UI for grapple targets
                                            setShowGrappleTargets(unit.id);
                                        }
                                    }}
                                    style={{ 
                                        padding: '0.3rem 0.5rem', 
                                        border: 'none', 
                                        backgroundColor: '#9575cd', 
                                        color: 'white', 
                                        borderRadius: '4px', 
                                        cursor: 'pointer',
                                        flex: '1'
                                    }}
                                >
                                    🤼 Grapple
                                </button>
                            )}
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUnplaceConfirm(unit.id);
                                }}
                                style={{ 
                                    padding: '0.3rem 0.5rem', 
                                    border: 'none', 
                                    backgroundColor: '#6c757d', 
                                    color: 'white', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer',
                                    flex: '1'
                                }}
                            >
                                ⬇ Remove from Field
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    // Confirmation dialog component
    const ConfirmationDialog = ({ 
        isOpen, 
        message, 
        onConfirm, 
        onCancel 
    }: { 
        isOpen: boolean; 
        message: string; 
        onConfirm: () => void; 
        onCancel: () => void 
    }) => {
        if (!isOpen) return null;
        
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '300px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                }}>
                    <h3 style={{ marginTop: 0 }}>Confirm Action</h3>
                    <p>{message}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                            onClick={onCancel}
                            style={{
                                padding: '8px 12px',
                                border: 'none',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            style={{
                                padding: '8px 12px',
                                border: 'none',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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
            
            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm !== null}
                message={`Are you sure you want to delete this unit? This action cannot be undone.`}
                onConfirm={() => {
                    if (showDeleteConfirm) {
                        dispatch({ type: 'REMOVE_UNIT', unitId: showDeleteConfirm });
                        setShowDeleteConfirm(null);
                    }
                }}
                onCancel={() => setShowDeleteConfirm(null)}
            />
            
            {/* Unplace Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showUnplaceConfirm !== null}
                message={`Are you sure you want to remove this unit from the battlefield?`}
                onConfirm={() => {
                    if (showUnplaceConfirm) {
                        dispatch({ type: 'UNPLACE_UNIT', unitId: showUnplaceConfirm });
                        setShowUnplaceConfirm(null);
                    }
                }}
                onCancel={() => setShowUnplaceConfirm(null)}
            />
            
            {/* Grapple Target Selection Dialog */}
            {showGrappleTargets && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '300px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Select Grapple Target</h3>
                        <p>Choose a unit in the same tile to grapple:</p>
                        
                        <div style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto',
                            marginBottom: '15px'
                        }}>
                            {state.units
                                .filter(u => {
                                    const grapplingUnit = state.units.find(unit => unit.id === showGrappleTargets);
                                    return (
                                        u.id !== showGrappleTargets && // Not self
                                        u.position && grapplingUnit?.position && // Both have positions
                                        u.position.x === grapplingUnit.position.x && // Same x
                                        u.position.y === grapplingUnit.position.y // Same y
                                    );
                                })
                                .map(unit => (
                                    <div 
                                        key={unit.id}
                                        onClick={() => {
                                            // Select the target
                                            dispatch({ type: 'SELECT_TARGET', unitId: unit.id });
                                            // Execute the grapple
                                            dispatch({ 
                                                type: 'EXECUTE_SPECIAL_MOVE', 
                                                moveData: {
                                                    id: 'grapple-action',
                                                    name: 'Grapple Enemy',
                                                    effect: 'grapple',
                                                    targeting: 'enemy'
                                                }
                                            });
                                            // Close dialog
                                            setShowGrappleTargets(null);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '10px',
                                            margin: '5px 0',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            backgroundColor: (() => {
                                                const hash = unit.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                const hue = hash % 360;
                                                return `hsl(${hue}, 80%, 70%)`;
                                            })(),
                                            marginRight: '10px'
                                        }} />
                                        <div>
                                            <strong>{unit.name}</strong>
                                            <div style={{ fontSize: '12px' }}>
                                                HP: {unit.durability.current}/{unit.durability.max} | Mass: {unit.mass}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowGrappleTargets(null)}
                                style={{
                                    padding: '8px 12px',
                                    border: 'none',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightBar;