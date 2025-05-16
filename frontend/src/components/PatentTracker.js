import React, { useEffect, useState } from 'react';
import './PatentTracker.css';

const dummyPatents = [
  {
    title: 'AI-based Diagnostic Tool',
    dateFiled: '2021-03-15',
    renewalDue: '2025-03-15',
    status: 'Active',
  },
  {
    title: 'Smart Irrigation System',
    dateFiled: '2018-07-22',
    renewalDue: '2024-07-22',
    status: 'Due Soon',
  },
  {
    title: 'Secure Voting Protocol',
    dateFiled: '2015-02-10',
    renewalDue: '2023-02-10',
    status: 'Expired',
  },
];

const PatentTracker = () => {
  const [patents, setPatents] = useState([]);

  useEffect(() => {
    // You can replace this with a real API call
    setPatents(dummyPatents);
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Due Soon':
        return 'status-due-soon';
      case 'Expired':
        return 'status-expired';
      default:
        return '';
    }
  };

  return (
    <div className="patent-tracker-container">
      <h2>Patent Tracker</h2>
      <table className="patent-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Date Filed</th>
            <th>Renewal Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {patents.map((patent, index) => (
            <tr key={index}>
              <td>{patent.title}</td>
              <td>{patent.dateFiled}</td>
              <td>{patent.renewalDue}</td>
              <td className={getStatusClass(patent.status)}>{patent.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatentTracker;
