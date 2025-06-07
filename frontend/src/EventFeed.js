import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Card, CardContent, CardActions, Button, Typography, Grid, Box, CardMedia, Modal, TextField, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { SnackbarContext } from './SnackbarContext';

function EventFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [registering, setRegistering] = useState(null);
  const [openRegistrationModal, setOpenRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationFormData, setRegistrationFormData] = useState({
    contact: '',
  });

  // State for filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkills, setFilterSkills] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterSkills) params.append('skills', filterSkills);
      if (filterLocation) params.append('location', filterLocation);

      const queryString = params.toString();
      const url = `http://localhost:5000/api/events${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch events');
      setEvents(data);
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [showSnackbar]);

  const handleSearchFilter = () => {
    fetchEvents();
  };

  const handleOpenRegistrationModal = (event) => {
    if (!user) {
      showSnackbar('You must be logged in to register.', 'warning');
      return;
    }
    setSelectedEvent(event);
    setOpenRegistrationModal(true);
    setRegistrationFormData({ contact: '' });
  };

  const handleCloseRegistrationModal = () => {
    setOpenRegistrationModal(false);
    setSelectedEvent(null);
  };

  const handleRegistrationFormChange = (e) => {
    const { name, value } = e.target;
    setRegistrationFormData({ ...registrationFormData, [name]: value });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setRegistering(selectedEvent._id);

    try {
      const res = await fetch(`http://localhost:5000/api/events/${selectedEvent._id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registrationFormData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      showSnackbar('Registered successfully! Awaiting organizer approval.', 'success');
      handleCloseRegistrationModal();

    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Events</Typography>

      {/* Search and Filter Inputs */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Search by Title/Description"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <TextField
          label="Skills (comma separated)"
          variant="outlined"
          size="small"
          value={filterSkills}
          onChange={e => setFilterSkills(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '150px' }}
        />
        <TextField
          label="Location"
          variant="outlined"
          size="small"
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '150px' }}
        />
        <Button variant="contained" onClick={handleSearchFilter}>Filter Events</Button>
      </Box>

      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {events.length === 0 && !loading && (
        <Typography variant="h6" sx={{ mt: 4 }}>No events found.</Typography>
      )}
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