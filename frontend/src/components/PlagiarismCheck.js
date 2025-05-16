import React, { useState } from 'react';
import './PlagiarismCheck.css';

const PlagiarismCheck = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);

    // Simulate API call delay
    setTimeout(() => {
      setResult({
        similarity: '28%',
        flaggedSentences: [
          "Artificial Intelligence is transforming industries rapidly.",
          "Machine learning is a subset of AI.",
        ],
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="plagiarism-check-container">
      <h2>Plagiarism Check</h2>

      <div
        className="drop-box"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {selectedFile ? (
          <p>{selectedFile.name}</p>
        ) : (
          <p>Drag and drop your file here or click to select</p>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      <button className="upload-button" onClick={handleUpload} disabled={loading}>
        {loading ? 'Checking...' : 'Upload & Check'}
      </button>

      {result && (
        <div className="plagiarism-result">
          <p><strong>Similarity:</strong> {result.similarity}</p>
          <p><strong>Flagged Sentences:</strong></p>
          <ul>
            {result.flaggedSentences.map((sentence, idx) => (
              <li key={idx} className="flagged">{sentence}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlagiarismCheck;
