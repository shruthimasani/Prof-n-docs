import React, { useState } from 'react';
import './ResearchModule.css';
import AutoFetchPublications from './AutoFetchPublications';
import ManualEntry from './ManualEntry';
import ImpactMetrics from './ImpactMetrics';
import CollaborationGraph from './CollaborationGraph';
import PatentTracker from './PatentTracker';
import PlagiarismCheck from './PlagiarismCheck';
import FetchPublications from './FetchPublications';

const ResearchModule = () => {
  const [activeTab, setActiveTab] = useState('autoFetch');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'autoFetch':
        return <AutoFetchPublications />;
      case 'manualEntry':
        return <ManualEntry />;
      case 'impactMetrics':
        return <ImpactMetrics />;
      case 'collaboration':
        return <CollaborationGraph />;
      case 'patentTracker':
        return <PatentTracker />;
      case 'plagiarism':
        return <PlagiarismCheck />;
      case 'fetched':
        return <FetchPublications />;
      default:
        return null;
    }
  };

  return (
    <div className="research-container">
      <h2 className="research-heading">📚 Research Contributions</h2>

      <div className="tab-bar">
        <button onClick={() => setActiveTab('autoFetch')} className={activeTab === 'autoFetch' ? 'active' : ''}>📥 Auto Fetch</button>
        <button onClick={() => setActiveTab('manualEntry')} className={activeTab === 'manualEntry' ? 'active' : ''}>🧾 Manual Entry</button>
        <button onClick={() => setActiveTab('impactMetrics')} className={activeTab === 'impactMetrics' ? 'active' : ''}>📊 Impact Metrics</button>
        <button onClick={() => setActiveTab('collaboration')} className={activeTab === 'collaboration' ? 'active' : ''}>🤝 Collaboration</button>
        <button onClick={() => setActiveTab('patentTracker')} className={activeTab === 'patentTracker' ? 'active' : ''}>⚙️ Patent Tracker</button>
        <button onClick={() => setActiveTab('plagiarism')} className={activeTab === 'plagiarism' ? 'active' : ''}>🔍 Plagiarism Check</button>
        <button onClick={() => setActiveTab('fetched')} className={activeTab === 'fetched' ? 'active' : ''}>📑 Fetched Publications</button>
      </div>

      <div className="research-card">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ResearchModule;
