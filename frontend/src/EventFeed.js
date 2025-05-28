import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Card, CardContent, CardActions, Button, Typography, Alert, Grid, Box, CardMedia, Modal, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';

function EventFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useContext(AuthContext);
  const [registering, setRegistering] = useState(null);
  const [success, setSuccess] = useState('');
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationFormData, setRegistrationFormData] = useState({
    contact: '',
  });

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

  const handleOpenRegistrationModal = (event) => {
    if (!user) {
      setError('You must be logged in to register.');
      return;
    }
    setSelectedEvent(event);
    setOpenRegistrationModal(true);
    setRegistrationFormData({ contact: '' }); // Reset form data
  };

  const handleCloseRegistrationModal = () => {
    setOpenRegistrationModal(false);
    setSelectedEvent(null);
    setError(''); // Clear errors on modal close
    setSuccess(''); // Clear success on modal close
  };

  const handleRegistrationFormChange = (e) => {
    const { name, value } = e.target;
    setRegistrationFormData({ ...registrationFormData, [name]: value });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedEvent) return;
    setRegistering(selectedEvent._id); // Indicate registration is in progress for this event

    try {
      const res = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registrationFormData), // Send form data
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setSuccess('Registered successfully! Awaiting organizer approval.');
      handleCloseRegistrationModal(); // Close modal on success
      // Optionally refresh events or update the specific event in the list

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
            <Card elevation={2} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {event.eventImage && (
                <CardMedia
                  component="img"
                  sx={{ width: { xs: '100%', sm: 150 }, height: { xs: 150, sm: 'auto' }, flexShrink: 0 }}
                  image={event.eventImage}
                  alt={event.title}
                />
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    component={Link}
                    to={`/events/${event._id}`}
                    sx={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{event.description}</Typography>
                  <Typography variant="body2"><b>Date:</b> {new Date(event.date).toLocaleString()}</Typography>
                  <Typography variant="body2"><b>Location:</b> {event.location}</Typography>
                  <Typography variant="body2"><b>Organizer:</b> {event.organizer}</Typography>
                  <Typography variant="body2"><b>Skills Required:</b> {event.skillsRequired.join(', ')}</Typography>
                </CardContent>
                <CardActions>
                  {user ? (
                    // Open modal on register click
                    <Button onClick={() => handleOpenRegistrationModal(event)} disabled={registering === event._id} variant="contained" size="small">
                      {registering === event._id ? 'Processing...' : 'Register'}
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>Login to register</Typography>
                  )}
                </CardActions>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Registration Modal */}
      <Modal
        open={openRegistrationModal}
        onClose={handleCloseRegistrationModal}
        aria-labelledby="registration-modal-title"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleCloseRegistrationModal}><CloseIcon /></IconButton>
          </Box>
          <Typography id="registration-modal-title" variant="h6" component="h2" gutterBottom>
            Register for {selectedEvent?.title}
          </Typography>
          <Box component="form" onSubmit={handleRegistrationSubmit} sx={{ mt: 2 }}>
            <TextField
              label="Contact Info (Email or Phone)"
              name="contact"
              value={registrationFormData.contact}
              onChange={handleRegistrationFormChange}
              fullWidth
              margin="normal"
              required
            />
            {/* Add more fields here if needed */}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={registering !== null}>
              Submit Registration
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {/* Success message is shown outside the modal for now, can be changed */}
        </Box>
      </Modal>
    </Box>
  );
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

export default EventFeed; 