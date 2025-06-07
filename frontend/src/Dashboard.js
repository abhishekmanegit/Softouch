import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Typography, Box, CircularProgress, Paper, List, ListItem, ListItemText, Tabs, Tab } from '@mui/material';
import { Link } from 'react-router-dom';
import { SnackbarContext } from './SnackbarContext';

function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [tab, setTab] = useState(0); // 0 for Created, 1 for Registered, 2 for Reminders
  const { showSnackbar } = useContext(SnackbarContext);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      showSnackbar('You must be logged in to view the dashboard.', 'info');
      return;
    }

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch Created Events
        const createdRes = await fetch('http://localhost:5000/api/events/my-created', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const createdData = await createdRes.json();
        if (!createdRes.ok) throw new Error(createdData.message || 'Failed to fetch created events');
        setCreatedEvents(createdData);

        // Fetch Registered Events
        const registeredRes = await fetch('http://localhost:5000/api/events/my-registered', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const registeredData = await registeredRes.json();
        if (!registeredRes.ok) throw new Error(registeredData.message || 'Failed to fetch registered events');
        setRegisteredEvents(registeredData);

        // Fetch Upcoming Reminders
        const remindersRes = await fetch('http://localhost:5000/api/reminders/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const remindersData = await remindersRes.json();
        if (!remindersRes.ok) throw new Error(remindersData.message || 'Failed to fetch reminders');
        setUpcomingReminders(remindersData);

      } catch (err) {
        showSnackbar(err.message, 'error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

  }, [user, token, showSnackbar]);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  if (!user) return <Typography variant="h6" sx={{ mt: 4 }}>You must be logged in to view the dashboard.</Typography>;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>

      <Tabs value={tab} onChange={handleTabChange} aria-label="dashboard tabs">
        <Tab label={`Created Events (${createdEvents.length})`} />
        <Tab label={`Registered Events (${registeredEvents.length})`} />
        <Tab label={`Upcoming Reminders (${upcomingReminders.length})`} />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && (
          <>
            <Typography variant="h6" gutterBottom>Events You Created</Typography>
            {createdEvents.length === 0 ? (
              <Typography>You haven't created any events yet.</Typography>
            ) : (
              <List>
                {createdEvents.map(event => (
                  <Paper key={event._id} sx={{ mb: 2, p: 2 }}>
                    <ListItem disablePadding component={Link} to={`/events/${event._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItemText
                        primary={<Typography variant="body1"><b>{event.title}</b> by {event.organizer}</Typography>}
                        secondary={`Date: ${new Date(event.date).toLocaleDateString()} | Registered: ${event.registeredUsers.length}`}
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            )}
          </>
        )}

        {tab === 1 && (
          <>
            <Typography variant="h6" gutterBottom>Events You Registered For</Typography>
            {registeredEvents.length === 0 ? (
              <Typography>You haven't registered for any events yet.</Typography>
            ) : (
              <List>
                {registeredEvents.map(event => (
                  <Paper key={event._id} sx={{ mb: 2, p: 2 }}>
                    <ListItem disablePadding component={Link} to={`/events/${event._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItemText
                         primary={<Typography variant="body1"><b>{event.title}</b> by {event.organizer}</Typography>}
                         secondary={
                           <>
                             <Typography variant="body2" color="text.secondary">Date: {new Date(event.date).toLocaleDateString()}</Typography>
                             {user && event.registeredUsers && event.registeredUsers.map(reg => reg.userId._id === user.id ? (
                               <Typography variant="body2" color="text.secondary" key={reg._id}>
                                 Status: {reg.status === 'approved' ? 'Approved' : reg.status === 'pending' ? 'Pending' : 'Rejected'}
                                 {reg.status === 'approved' && ` | Checked In: ${reg.checkedIn ? 'Yes' : 'No'}`}
                               </Typography>
                             ) : null)}
                           </>
                         }
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            )}
          </>
        )}

        {tab === 2 && (
          <>
            <Typography variant="h6" gutterBottom>Upcoming Reminders</Typography>
            {upcomingReminders.length === 0 ? (
              <Typography>You have no upcoming event reminders.</Typography>
            ) : (
              <List>
                {upcomingReminders.map(reminder => (
                  <Paper key={reminder._id} sx={{ mb: 2, p: 2 }}>
                    <ListItem disablePadding component={Link} to={`/events/${reminder.event._id}`} sx={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItemText
                        primary={<Typography variant="body1"><b>{reminder.event.title}</b> by {reminder.event.organizer}</Typography>}
                        secondary={`Event Date: ${new Date(reminder.event.date).toLocaleDateString()} | Reminder Set For: ${new Date(reminder.reminderDate).toLocaleString()}`}
                      />
                    </ListItem>
                  </Paper>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard; 