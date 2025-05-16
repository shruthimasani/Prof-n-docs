import React, { useState } from 'react';
import './ManualEntry.css';

const ManualEntryForm = () => {
  const [form, setForm] = useState({
    title: '',
    journal: '',
    authors: '',
    doi: '',
    citations: ''
  });

  const [showToast, setShowToast] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Replace this with API call to save data
    console.log('Manual Entry Submitted:', form);

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    // Reset form
    setForm({
      title: '',
      journal: '',
      authors: '',
      doi: '',
      citations: ''
    });
  };

  return (
    <div className="manual-form-container">
      <h2>Manual Entry</h2>
      <form onSubmit={handleSubmit} className="manual-form">
        <div className="input-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Journal</label>
          <input
            type="text"
            name="journal"
            value={form.journal}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Authors</label>
          <input
            type="text"
            name="authors"
            value={form.authors}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>DOI</label>
          <input
            type="text"
            name="doi"
            value={form.doi}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Citations</label>
          <input
            type="number"
            name="citations"
            value={form.citations}
            onChange={handleChange}
          />
        </div>

        <div className="submit-wrapper">
          <button type="submit">Submit</button>
        </div>

        {showToast && (
          <div className="toast">Publication added successfully!</div>
        )}
      </form>
    </div>
  );
};

export default ManualEntryForm;
