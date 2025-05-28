import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Typography, Box, Card, CardContent, CircularProgress, Alert, List, ListItem, ListItemText, Button, Paper } from '@mui/material';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch event');
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleUpdateStatus = async (registrationId, status) => {
    if (!user || !event || event.createdBy._id !== user.id) {
      setError('Not authorized.');
      return;
    }
    setUpdatingStatus(registrationId); // Indicate which registration is being updated

    try {
      const res = await fetch(`http://localhost:5000/api/events/${event._id}/registrations/${registrationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');

      // Update the local state to reflect the status change
      setEvent(prevEvent => ({
        ...prevEvent,
        registeredUsers: prevEvent.registeredUsers.map(reg =>
          reg._id === registrationId ? { ...reg, status: data.registration.status } : reg
        ),
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!event) return <Alert severity="info" sx={{ mt: 4 }}>Event not found.</Alert>;

  // Check if the logged-in user is the creator of the event
  const isOrganizer = user && event.createdBy && event.createdBy._id === user.id;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{event.title}</Typography>
      {event.eventImage && (
        <Box sx={{ mb: 3, maxWidth: '100%', height: 300, overflow: 'hidden' }}>
          <img src={event.eventImage} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      )}
      <Typography variant="body1" paragraph>{event.description}</Typography>
      <Typography variant="body2" color="text.secondary"><b>Date:</b> {new Date(event.date).toLocaleString()}</Typography>
      <Typography variant="body2" color="text.secondary"><b>Location:</b> {event.location}</Typography>
      <Typography variant="body2" color="text.secondary"><b>Organizer:</b> {event.organizer} ({event.organizerEmail})</Typography>
      <Typography variant="body2" color="text.secondary"><b>Skills Required:</b> {event.skillsRequired.join(', ')}</Typography>
      <Typography variant="body2" color="text.secondary"><b>Created By:</b> {event.createdBy.name} ({event.createdBy.email})</Typography>

      {isOrganizer && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Registered Users</Typography>
          {event.registeredUsers.length === 0 ? (
            <Typography>No users registered yet.</Typography>
          ) : (
            <List>
              {event.registeredUsers.map(registration => (
                <Paper key={registration._id} sx={{ mb: 2, p: 2 }}>
                  <ListItem disablePadding>
                    <ListItemText
                      primary={<Typography variant="body1"><b>User:</b> {registration.userId.name} ({registration.userId.email})</Typography>}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary"><b>Status:</b> {registration.status}</Typography>
                          {registration.registrationDetails?.contact && (
                            <Typography variant="body2" color="text.secondary"><b>Contact:</b> {registration.registrationDetails.contact}</Typography>
                          )}
                          <Typography variant="body2" color="text.secondary"><b>Registered At:</b> {new Date(registration.registeredAt).toLocaleString()}</Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {registration.status === 'pending' && ( // Only show buttons for pending registrations
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleUpdateStatus(registration._id, 'approved')}
                        disabled={updatingStatus === registration._id}
                      >
                        {updatingStatus === registration._id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleUpdateStatus(registration._id, 'rejected')}
                        disabled={updatingStatus === registration._id}
                      >
                        {updatingStatus === registration._id ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </Box>
                  )}
                </Paper>
              ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}

export default EventDetails; 