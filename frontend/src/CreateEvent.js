import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return <div style={{ margin: 40 }}>You must be logged in to create an event.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          organizer,
          date,
          location,
          skillsRequired: skillsRequired.split(',').map(s => s.trim())
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Event creation failed');
      setSuccess('Event created!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <h2>Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
        <input type="text" placeholder="Organizer" value={organizer} onChange={e => setOrganizer(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
        <input type="datetime-local" placeholder="Date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
        <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} required style={{ width: '100%', marginBottom: 8 }} />
        <input type="text" placeholder="Skills Required (comma separated)" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} style={{ width: '100%', marginBottom: 8 }} />
        <button type="submit" style={{ width: '100%' }}>Create Event</button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
    </div>
  );
}

export default CreateEvent; 