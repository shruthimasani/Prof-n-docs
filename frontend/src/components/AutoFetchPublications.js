import React, { useState } from 'react';
import './AutoFetchPublications.css'; // We'll style it after this

const AutoFetchForm = () => {
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);

  const handleFetch = async () => {
    if (!author.trim()) return;
    setLoading(true);
    setResults([]);
    setSelected([]);

    try {
      const response = await fetch(`https://api.crossref.org/works?query.author=${author}`);
      const data = await response.json();
      const works = data.message.items.slice(0, 10); // Limit for preview
      setResults(works);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (doi) => {
    setSelected((prev) =>
      prev.includes(doi) ? prev.filter((id) => id !== doi) : [...prev, doi]
    );
  };

  const handleImportSelected = () => {
    const selectedPublications = results.filter(pub => selected.includes(pub.DOI));
    console.log('Importing:', selectedPublications); // Replace with backend call
    alert('Selected publications imported successfully!');
  };

  return (
    <div className="autofetch-container">
      <h2>Auto Fetch Publications</h2>
      <div className="form-row">
        <input
          type="text"
          placeholder="Enter Author Name or ORCID"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button onClick={handleFetch} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch from CrossRef'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="results-table">
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Title</th>
                <th>Year</th>
                <th>Journal</th>
              </tr>
            </thead>
            <tbody>
              {results.map((pub) => (
                <tr key={pub.DOI}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(pub.DOI)}
                      onChange={() => handleCheckboxChange(pub.DOI)}
                    />
                  </td>
                  <td>{pub.title?.[0] || 'Untitled'}</td>
                  <td>{pub.issued?.['date-parts']?.[0]?.[0] || 'N/A'}</td>
                  <td>{pub['container-title']?.[0] || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="import-btn" onClick={handleImportSelected}>
            Import Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoFetchForm;
