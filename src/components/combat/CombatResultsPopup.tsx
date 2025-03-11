// CombatResultsPopup.tsx - A popup that shows detailed combat results
import React from 'react';
import { useGameState } from '../context';

interface CombatDetailsData {
  title: string;
  attackerName: string;
  defenderName: string;
  weaponName: string;
  attackRoll?: number;
  attackerPrecision?: number;
  attackTotal?: number;
  defenderAgility?: number;
  defenderDifficulty?: number;
  defenseTotal?: number;
  damage?: number; 
  newWounds?: number;
  durabilityBefore?: number;
  durabilityAfter?: number;
  subsystemsAffected?: string[];
  statusEffects?: string[];
  success: boolean;
  description?: string;
  successMargin?: number;
}

export const CombatResultsPopup: React.FC = () => {
  const { state, dispatch } = useGameState();
  const { showCombatPopup, combatDetails } = state;

  const handleClose = () => {
    dispatch({ type: 'HIDE_COMBAT_POPUP' });
  };

  if (!showCombatPopup || !combatDetails) return null;

  const {
    title,
    attackerName,
    defenderName,
    weaponName,
    attackRoll,
    attackerPrecision,
    attackTotal,
    defenderAgility,
    defenderDifficulty,
    defenseTotal,
    damage,
    newWounds,
    durabilityBefore,
    durabilityAfter,
    subsystemsAffected,
    statusEffects,
    success,
    description,
    successMargin
  } = combatDetails as CombatDetailsData;

  return (
    <div className="combat-popup-overlay" onClick={handleClose}>
      <div className="combat-popup" onClick={(e) => e.stopPropagation()}>
        <div className="combat-popup-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="combat-popup-body">
          <div className="combat-popup-section">
            <h3>Attack Details</h3>
            <div className="combat-detail-row">
              <span className="detail-label">Attacker:</span>
              <span className="detail-value">{attackerName}</span>
            </div>
            <div className="combat-detail-row">
              <span className="detail-label">Weapon:</span>
              <span className="detail-value">{weaponName}</span>
            </div>
            <div className="combat-detail-row">
              <span className="detail-label">Defender:</span>
              <span className="detail-value">{defenderName}</span>
            </div>

            {attackRoll !== undefined && attackerPrecision !== undefined && attackTotal !== undefined && (
              <div className="combat-calculation">
                <div className="calculation-title">Attack Roll</div>
                <div className="calculation-formula">
                  {attackRoll} (dice) + {attackerPrecision} (precision) = {attackTotal}
                </div>
              </div>
            )}

            {defenderAgility !== undefined && defenderDifficulty !== undefined && defenseTotal !== undefined && (
              <div className="combat-calculation">
                <div className="calculation-title">Defense Value</div>
                <div className="calculation-formula">
                  {defenderAgility} (agility) + {defenderDifficulty} (difficulty) = {defenseTotal}
                </div>
              </div>
            )}

            {successMargin !== undefined && (
              <div className="combat-calculation">
                <div className="calculation-title">Success Margin</div>
                <div className="calculation-formula">
                  {attackTotal} - {defenseTotal} = {successMargin}
                </div>
              </div>
            )}
          </div>

          {success && (
            <div className="combat-popup-section">
              <h3>Damage Results</h3>
              
              {damage !== undefined && (
                <div className="combat-detail-row">
                  <span className="detail-label">Damage Dealt:</span>
                  <span className="detail-value">{damage}</span>
                </div>
              )}
              
              {newWounds !== undefined && (
                <div className="combat-detail-row">
                  <span className="detail-label">Wounds Inflicted:</span>
                  <span className="detail-value">{newWounds}</span>
                </div>
              )}
              
              {durabilityBefore !== undefined && durabilityAfter !== undefined && (
                <div className="combat-detail-row">
                  <span className="detail-label">Durability Change:</span>
                  <span className="detail-value">{durabilityBefore} → {durabilityAfter}</span>
                </div>
              )}
              
              {subsystemsAffected && subsystemsAffected.length > 0 && (
                <div className="combat-detail-column">
                  <span className="detail-label">Subsystems Affected:</span>
                  <ul className="detail-list">
                    {subsystemsAffected.map((system, index) => (
                      <li key={index}>{system}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {statusEffects && statusEffects.length > 0 && (
                <div className="combat-detail-column">
                  <span className="detail-label">Status Effects:</span>
                  <ul className="detail-list">
                    {statusEffects.map((effect, index) => (
                      <li key={index}>{effect}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {description && (
            <div className="combat-popup-section">
              <h3>Result</h3>
              <div className="combat-description">{description}</div>
            </div>
          )}
        </div>
        
        <div className="combat-popup-footer">
          <button onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Add CSS to App.css
/*
.combat-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.combat-popup {
  background-color: #2a2a2a;
  border: 2px solid #4a4a4a;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  color: #f0f0f0;
}

.combat-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #4a4a4a;
  background-color: #333;
}

.combat-popup-header h2 {
  margin: 0;
  color: #f0f0f0;
}

.close-button {
  background: none;
  border: none;
  color: #f0f0f0;
  font-size: 24px;
  cursor: pointer;
}

.combat-popup-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.combat-popup-section {
  margin-bottom: 20px;
}

.combat-popup-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #aaddff;
  border-bottom: 1px solid #4a4a4a;
  padding-bottom: 8px;
}

.combat-detail-row {
  display: flex;
  margin-bottom: 8px;
}

.combat-detail-column {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.detail-label {
  font-weight: bold;
  width: 40%;
  color: #aaddff;
}

.detail-value {
  width: 60%;
}

.detail-list {
  margin: 4px 0 0 20px;
  padding: 0;
}

.combat-calculation {
  background-color: #333;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 8px 0;
}

.calculation-title {
  font-weight: bold;
  color: #aaddff;
  margin-bottom: 4px;
}

.calculation-formula {
  font-family: monospace;
  letter-spacing: 0.5px;
}

.combat-description {
  background-color: #333;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  padding: 12px;
  font-style: italic;
}

.combat-popup-footer {
  padding: 12px 16px;
  border-top: 1px solid #4a4a4a;
  display: flex;
  justify-content: flex-end;
}

.combat-popup-footer button {
  background-color: #aaddff;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.combat-popup-footer button:hover {
  background-color: #88bbdd;
}
*/