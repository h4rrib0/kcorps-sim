import React, { useState, ReactNode } from 'react';

interface TabProps {
  label: string;
  id: string;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ label, id, children }) => {
  return <>{children}</>;
};

interface TabPanelProps {
  children: React.ReactElement<TabProps> | React.ReactElement<TabProps>[];
  defaultTab?: string;
}

interface TabPanelComponent extends React.FC<TabPanelProps> {
  Tab: React.FC<TabProps>;
}

const TabPanel: TabPanelComponent = ({ children, defaultTab }) => {
  const tabs = React.Children.toArray(children) as React.ReactElement<TabProps>[];
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs[0]?.props.id || ''));

  if (tabs.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      <div 
        style={{
          display: 'flex', 
          borderBottom: '1px solid #ddd',
          backgroundColor: '#f5f5f5',
          padding: '0.25rem 0.25rem 0',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.props.id}
            onClick={() => setActiveTab(tab.props.id)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: activeTab === tab.props.id ? 'white' : 'transparent',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px',
              borderTop: activeTab === tab.props.id ? '1px solid #ddd' : 'none',
              borderLeft: activeTab === tab.props.id ? '1px solid #ddd' : 'none',
              borderRight: activeTab === tab.props.id ? '1px solid #ddd' : 'none',
              marginBottom: activeTab === tab.props.id ? '-1px' : '0',
              fontWeight: activeTab === tab.props.id ? 'bold' : 'normal',
              color: activeTab === tab.props.id ? '#007bff' : '#666',
              cursor: 'pointer',
              position: 'relative',
              zIndex: activeTab === tab.props.id ? 2 : 1
            }}
          >
            {tab.props.label}
          </button>
        ))}
      </div>
      <div 
        style={{
          flex: 1,
          padding: '1rem',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderTop: 'none',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          overflowY: 'auto',
          height: 'calc(100vh - 80px)' // Adjusted for better control of height
        }}
      >
        {tabs.find(tab => tab.props.id === activeTab)?.props.children}
      </div>
    </div>
  );
};

TabPanel.Tab = Tab;

export default TabPanel;