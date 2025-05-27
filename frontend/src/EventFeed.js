import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';

function EventFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);
  const [registering, setRegistering] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/events');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch events');
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    setSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Registered successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setRegistering(null);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <h2>Events</h2>
      {loading && <div>Loading events...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(event => (
          <li key={event._id} style={{ border: '1px solid #eee', marginBottom: 16, padding: 16 }}>
            <h3>{event.title}</h3>
            <div><b>Date:</b> {new Date(event.date).toLocaleString()}</div>
            <div><b>Location:</b> {event.location}</div>
            <div><b>Organizer:</b> {event.organizer}</div>
            <div><b>Skills Required:</b> {event.skillsRequired.join(', ')}</div>
            {user && (
              <button onClick={() => handleRegister(event._id)} disabled={registering === event._id}>
                {registering === event._id ? 'Registering...' : 'Register'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EventFeed; 