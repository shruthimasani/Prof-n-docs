import React, { useState } from 'react';
import './FetchPublications.css';

const FetchPublications = ({ publications = [] }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleView = (pub) => {
    alert(`Viewing "${pub.title}"`);
  };

  const handleEdit = (pub) => {
    alert(`Editing "${pub.title}"`);
  };

  const handleDelete = (pub) => {
    if (window.confirm(`Are you sure to delete "${pub.title}"?`)) {
      alert('Deleted successfully (simulate backend call).');
    }
  };

  return (
    <div className="fetched-publications-container">
      <h2>Fetched Publications</h2>
      {publications.length === 0 ? (
        <p>No publications available.</p>
      ) : (
        publications.map((pub, index) => (
          <div
            key={index}
            className={`publication-card ${expandedIndex === index ? 'expanded' : ''}`}
            onClick={() => toggleExpand(index)}
            title={`DOI: ${pub.doi || 'N/A'} | Citations: ${pub.citations || 0}`}
          >
            <div className="publication-header">
              <h4>{pub.title}</h4>
              <p>{pub.authors} | {pub.year} | {pub.journal}</p>
            </div>

            {expandedIndex === index && (
              <div className="publication-actions">
                <button onClick={(e) => { e.stopPropagation(); handleView(pub); }}>View</button>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(pub); }}>Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(pub); }}>Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FetchPublications;
