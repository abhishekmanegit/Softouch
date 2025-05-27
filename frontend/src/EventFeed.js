import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Card, CardContent, CardActions, Button, Typography, Alert, Grid, Box } from '@mui/material';

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
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Events</Typography>
      {loading && <Typography>Loading events...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <Grid container spacing={3}>
        {events.map(event => (
          <Grid item xs={12} sm={6} key={event._id}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{event.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{event.description}</Typography>
                <Typography><b>Date:</b> {new Date(event.date).toLocaleString()}</Typography>
                <Typography><b>Location:</b> {event.location}</Typography>
                <Typography><b>Organizer:</b> {event.organizer}</Typography>
                <Typography><b>Skills Required:</b> {event.skillsRequired.join(', ')}</Typography>
              </CardContent>
              <CardActions>
                {user && (
                  <Button onClick={() => handleRegister(event._id)} disabled={registering === event._id} variant="contained" size="small">
                    {registering === event._id ? 'Registering...' : 'Register'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default EventFeed; 