import React, { useEffect, useRef } from 'react';
import { useGameState } from '../context';

interface LogPanelProps {
  maxHeight?: string;
  width?: string;
}

const LogPanel: React.FC<LogPanelProps> = ({ 
  maxHeight = '150px',
  width = 'auto'
}) => {
  const { state, dispatch } = useGameState();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new log entries are added
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.log.length]);

  if (state.log.length === 0) {
    return null;
  }

  if (!state.showLog) {
    return (
      <button
        onClick={() => dispatch({ type: 'TOGGLE_LOG' })}
        style={{
          position: 'fixed',
          left: '20px',
          bottom: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '8px',
          padding: '8px 12px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          zIndex: 900,
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'monospace'
        }}
      >
        <span style={{ fontSize: '16px', marginRight: '8px' }}>📋</span>
        Show Combat Log
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: '20px',
        bottom: '20px',
        width: width,
        maxWidth: '400px',
        maxHeight: maxHeight,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '8px',
        padding: '12px',
        overflowY: 'auto',
        zIndex: 900,
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        fontFamily: 'monospace'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h3 style={{ margin: 0, color: '#ffc107', fontSize: '16px' }}>Combat Log</h3>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_LOG' })}
          style={{
            background: 'none',
            border: 'none',
            color: '#ffc107',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 6px',
            fontFamily: 'monospace'
          }}
        >
          Hide
        </button>
      </div>
      <hr style={{ borderColor: '#ffc107', opacity: 0.3, margin: '0 0 10px 0' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {state.log.map((entry, index) => (
          <div 
            key={index}
            style={{
              padding: '4px 8px',
              backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderLeft: entry.includes('ERROR:') ? '3px solid #ff5252' : 
                         entry.includes('failed') ? '3px solid #dc3545' : 
                         '3px solid #28a745',
              fontSize: '13px',
              lineHeight: '1.3',
              color: entry.includes('ERROR:') ? '#ff5252' : 'inherit',
              fontWeight: entry.includes('ERROR:') ? 'bold' : 'normal'
            }}
          >
            {entry}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default LogPanel;