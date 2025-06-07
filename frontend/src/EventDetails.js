import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Typography, Box, CircularProgress, List, ListItem, ListItemText, Button, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { SnackbarContext } from './SnackbarContext';

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [isReminderSet, setIsReminderSet] = useState(false);
  const [reminderId, setReminderId] = useState(null); // To store the ID of the reminder if set
  const [openReminderModal, setOpenReminderModal] = useState(false);
  const [selectedReminderDate, setSelectedReminderDate] = useState('');

  useEffect(() => {
    async function fetchEventAndReminder() {
      setLoading(true);
      try {
        // Fetch Event details
        const eventRes = await fetch(`http://localhost:5000/api/events/${id}`);
        const eventData = await eventRes.json();
        if (!eventRes.ok) throw new Error(eventData.message || 'Failed to fetch event');
        setEvent(eventData);

        // Check if reminder is set for this event and user
        if (user && token) {
          const reminderRes = await fetch(`http://localhost:5000/api/reminders/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const reminderData = await reminderRes.json();
          if (reminderRes.ok) {
            const existingReminder = reminderData.find(rem => rem.event._id === id && rem.user === user.id);
            if (existingReminder) {
              setIsReminderSet(true);
              setReminderId(existingReminder._id);
              setSelectedReminderDate(new Date(existingReminder.reminderDate).toISOString().slice(0, 16));
            } else {
              setIsReminderSet(false);
              setReminderId(null);
              setSelectedReminderDate('');
            }
          }
        }

      } catch (err) {
        showSnackbar(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchEventAndReminder();
    }
  }, [id, user, token, showSnackbar]);

  const handleUpdateStatus = async (registrationId, status) => {
    if (!user || !event || event.createdBy._id !== user.id) {
      showSnackbar('Not authorized to update registration status.', 'error');
      return;
    }
    setUpdatingStatus(registrationId);

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

      setEvent(prevEvent => ({
        ...prevEvent,
        registeredUsers: prevEvent.registeredUsers.map(reg =>
          reg._id === registrationId ? { ...reg, status: data.registration.status } : reg
        ),
      }));
      showSnackbar(`Registration ${status} successfully!`, 'success');

    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleOpenReminderModal = () => {
    if (!user) {
      showSnackbar('You must be logged in to set a reminder.', 'warning');
      return;
    }
    setOpenReminderModal(true);
  };

  const handleCloseReminderModal = () => {
    setOpenReminderModal(false);
    if (!isReminderSet) { // Reset date if no reminder is set yet
      setSelectedReminderDate('');
    }
  };

  const handleSetReminder = async () => {
    if (!selectedReminderDate) {
      showSnackbar('Please select a reminder date and time.', 'warning');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/${event._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reminderDate: selectedReminderDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to set reminder');

      setIsReminderSet(true);
      setReminderId(data.reminder._id);
      showSnackbar('Reminder set successfully!', 'success');
      handleCloseReminderModal();

    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleCancelReminder = async () => {
    if (!reminderId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel reminder');

      setIsReminderSet(false);
      setReminderId(null);
      setSelectedReminderDate('');
      showSnackbar('Reminder cancelled successfully!', 'info');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (!event) return <Typography variant="h6" sx={{ mt: 4 }}>Event not found.</Typography>;

  const isOrganizer = user && event.createdBy && event.createdBy._id === user.id;

  // Convert event date to a format suitable for datetime-local input
  const eventDateForInput = new Date(event.date).toISOString().slice(0, 16);

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

      {user && !isOrganizer && (
        <Box sx={{ mt: 2 }}>
          {isReminderSet ? (
            <Button variant="outlined" color="secondary" onClick={handleCancelReminder}>
              Cancel Reminder
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleOpenReminderModal}>
              Set Reminder
            </Button>
          )}
        </Box>
      )}

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
                  {registration.status === 'pending' && (
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

      <Dialog open={openReminderModal} onClose={handleCloseReminderModal}>
        <DialogTitle>Set Reminder</DialogTitle>
        <DialogContent>
          <Typography>Set a reminder for {event.title} happening on {new Date(event.date).toLocaleString()}.</Typography>
          <TextField
            label="Reminder Date & Time"
            type="datetime-local"
            value={selectedReminderDate || eventDateForInput}
            onChange={e => setSelectedReminderDate(e.target.value)}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReminderModal}>Cancel</Button>
          <Button onClick={handleSetReminder} variant="contained" color="primary">Set Reminder</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventDetails; 