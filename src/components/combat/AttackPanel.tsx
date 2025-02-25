import React from 'react';
import { useGameState } from '../context';

const AttackPanel: React.FC = () => {
  const { state, dispatch } = useGameState();
  
  // Get the attacker and target units
  const attacker = state.units.find(unit => unit.id === state.selectedUnitId);
  const target = state.units.find(unit => unit.id === state.targetUnitId);
  
  // Handle weapon selection
  const handleWeaponSelect = (weaponId: string) => {
    dispatch({ type: 'SELECT_WEAPON', weaponId });
  };

  // Handle segment selection from dropdown
  const handleSegmentSelect = (segmentId: string) => {
    dispatch({ type: 'SELECT_TARGET_SEGMENT', segmentId });
  };

  // Handle attack execution
  const handleExecuteAttack = () => {
    dispatch({ type: 'EXECUTE_ATTACK' });
  };

  // Handle cancel
  const handleCancel = () => {
    dispatch({ type: 'EXIT_ATTACK_MODE' });
  };

  // Calculate total durability from segments if available
  const calculateDurability = (unit: any) => {
    if (!unit) return { current: 0, max: 0 };
    
    if (unit.segments && unit.segments.length > 0) {
      const current = unit.segments.reduce((sum: number, segment: any) => sum + segment.durability, 0);
      const max = unit.segments.reduce((sum: number, segment: any) => sum + segment.maxDurability, 0);
      return { current, max };
    }
    
    return unit.durability || { current: 0, max: 0 };
  };

  // Check if attack is valid (attacker, target, and weapon are all selected)
  const isAttackValid = !!attacker && !!target && !!state.selectedWeaponId && attacker?.id !== target?.id;

  // Check if the target has segments that can be targeted
  const hasTargetableSegments = target && target.segments && target.segments.length > 0;

  // Get the currently targeted segment if any
  const targetSegment = target && state.targetSegmentId 
    ? target.segments.find(s => s.id === state.targetSegmentId) 
    : null;

  if (!state.attackMode) return null;

  const attackerDurability = calculateDurability(attacker);
  const targetDurability = calculateDurability(target);

  return (
    <div className="attack-panel" style={{
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
      <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>Attack Mode</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Attacker</h4>
        {attacker ? (
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
                const hash = attacker.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
              {attacker.name.substring(0, 1)}
            </div>
            <div>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{attacker.name}</p>
              <p style={{ margin: '0', fontSize: '12px' }}>
                HP: {attackerDurability.current}/{attackerDurability.max} | 
                Weapons: {attacker.weapons.length}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ color: 'red', fontSize: '14px' }}>Select an attacking unit</p>
        )}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          margin: '0 0 5px 0'
        }}>
          <h4 style={{ margin: 0, borderBottom: '1px solid #ddd', paddingBottom: '5px', flexGrow: 1 }}>Target</h4>
          
          {/* Segment targeting dropdown */}
          {hasTargetableSegments && target && (
            <select 
              value={state.targetSegmentId || ''} 
              onChange={(e) => handleSegmentSelect(e.target.value)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#fff',
                marginLeft: '8px'
              }}
            >
              <option value="">Target Whole</option>
              {target.segments.map(segment => (
                <option key={segment.id} value={segment.id}>
                  {segment.name} ({segment.durability}/{segment.maxDurability})
                </option>
              ))}
            </select>
          )}
        </div>
        
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
            <div style={{ flexGrow: 1 }}>
              <p style={{ margin: '0 0 2px 0', fontWeight: 'bold' }}>{target.name}</p>
              <p style={{ margin: '0', fontSize: '12px' }}>
                HP: {targetDurability.current}/{targetDurability.max} | 
                Armor: {target.armor}
              </p>
              {targetSegment && (
                <p style={{ 
                  margin: '2px 0 0 0', 
                  fontSize: '12px',
                  backgroundColor: '#e8f5e9',
                  padding: '2px 4px',
                  borderRadius: '2px' 
                }}>
                  Targeting: {targetSegment.name} ({targetSegment.durability}/{targetSegment.maxDurability})
                </p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: 'red', fontSize: '14px' }}>Select a target unit</p>
        )}
      </div>
      
      {/* Show all targetable units */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Targetable Units</h4>
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
              // Find the attacker and their currently selected weapon
              const attacker = state.units.find(unit => unit.id === state.selectedUnitId);
              const weapon = attacker?.weapons.find(w => w.id === state.selectedWeaponId) || 
                             attacker?.weapons[0];
              
              // Unit must have a position
              if (!u.position) return false;
              
              // Unit must not be the attacker (can't target self)
              if (u.id === state.selectedUnitId) return false;
              
              // For melee weapons, units MUST share the same tile (stacked)
              if (weapon?.range === 'melee') {
                if (!attacker?.position) return false;
                
                // Must be on the same tile
                return attacker.position.x === u.position.x && 
                       attacker.position.y === u.position.y;
              }
              
              // For ranged weapons, check attackable tiles
              return state.attackableTiles.some(
                tile => tile.q === u.position?.x && tile.r === u.position?.y
              );
            })
            .map(unit => {
              const unitDurability = calculateDurability(unit);
              return (
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
                      HP: {unitDurability.current}/{unitDurability.max} | 
                      Pos: ({unit.position.x}, {unit.position.y})
                    </p>
                  </div>
                </div>
              );
            })
          }
          {state.units.filter(u => {
              // Reusing the same logic as above to maintain consistency
              const attacker = state.units.find(unit => unit.id === state.selectedUnitId);
              const weapon = attacker?.weapons.find(w => w.id === state.selectedWeaponId) || 
                             attacker?.weapons[0];
              
              if (!u.position || u.id === state.selectedUnitId || !attacker?.position) return false;
              
              if (weapon?.range === 'melee') {
                // For melee weapons, units MUST share the same tile
                return attacker.position.x === u.position.x && 
                       attacker.position.y === u.position.y;
              }
              
              return state.attackableTiles.some(
                tile => tile.q === u.position?.x && tile.r === u.position?.y
              );
            }).length === 0 && (
              <p style={{ color: '#666', fontStyle: 'italic', margin: '5px 0', fontSize: '13px', textAlign: 'center' }}>
                No targetable units in range
              </p>
            )}
        </div>
      </div>
      
      {attacker && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>Select Weapon</h4>
          {attacker.weapons.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '5px',
              backgroundColor: '#fff',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}>
              {attacker.weapons.map((weapon) => {
                // Check if weapon is linked to a subsystem
                const linkedSubsystem = attacker.subsystems?.find(s => s.weaponId === weapon.id);
                const isWeaponFunctional = !linkedSubsystem || linkedSubsystem.functional;
                
                return (
                  <button
                    key={weapon.id}
                    onClick={() => handleWeaponSelect(weapon.id)}
                    disabled={!isWeaponFunctional}
                    style={{
                      padding: '6px 8px',
                      backgroundColor: !isWeaponFunctional 
                        ? '#f8d7da' 
                        : state.selectedWeaponId === weapon.id ? '#e6f2ff' : 'transparent',
                      color: !isWeaponFunctional ? '#dc3545' : 'black',
                      border: state.selectedWeaponId === weapon.id ? '1px solid #007bff' : '1px solid #eee',
                      borderLeft: state.selectedWeaponId === weapon.id ? '4px solid #007bff' : '1px solid #eee',
                      borderRadius: '3px',
                      cursor: isWeaponFunctional ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%'
                    }}>
                      <span>{weapon.name}</span>
                      {!isWeaponFunctional && (
                        <span style={{ fontSize: '10px', color: '#dc3545' }}>DAMAGED</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', marginTop: '2px' }}>
                      Force: {weapon.force} | PEN: {weapon.penetration} | DIFF: {weapon.difficulty}
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      {weapon.range === 'melee' ? '⚔️ Melee' : `🎯 Range: ${weapon.range}`} | 
                      Arc: {weapon.arcWidth || 60}°
                    </div>
                    {linkedSubsystem && (
                      <div style={{ 
                        fontSize: '10px', 
                        marginTop: '2px',
                        backgroundColor: isWeaponFunctional ? '#e8f5e9' : '#f8d7da',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        color: isWeaponFunctional ? '#2e7d32' : '#c62828'
                      }}>
                        {linkedSubsystem.name} subsystem: {isWeaponFunctional ? 'OPERATIONAL' : 'DAMAGED'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>No weapons available</p>
          )}
        </div>
      )}
      
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
          onClick={handleExecuteAttack}
          disabled={!isAttackValid}
          style={{
            padding: '8px 0',
            backgroundColor: isAttackValid ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isAttackValid ? 'pointer' : 'not-allowed',
            flex: '1',
            fontWeight: 'bold'
          }}
        >
          ✓ Attack
        </button>
      </div>
    </div>
  );
};

export default AttackPanel;