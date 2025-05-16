import React from 'react';
import './ImpactMetrics.css';

const ImpactMetrics = () => {
  // Sample data - replace with API or backend values
  const metrics = {
    hIndex: 15,
    i10Index: 12,
    totalCitations: 320,
  };

  return (
    <div className="impact-metrics-container">
      <h2>Impact Metrics</h2>
      <div className="metrics-cards">
        <div className="metric-card">
          <h3>h-index</h3>
          <p>{metrics.hIndex}</p>
        </div>
        <div className="metric-card">
          <h3>i10-index</h3>
          <p>{metrics.i10Index}</p>
        </div>
        <div className="metric-card">
          <h3>Total Citations</h3>
          <p>{metrics.totalCitations}</p>
        </div>
      </div>

      <div className="metrics-chart">
        <h4>Citations Over Years</h4>
        <img src="/chart-placeholder.png" alt="Citations Chart" />
      </div>
    </div>
  );
};

export default ImpactMetrics;
