import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { SnackbarContext } from './SnackbarContext';
import { Typography, Box, CircularProgress, List, ListItem, ListItemText, Button, Paper, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { Link } from 'react-router-dom';

function Notifications() {
  const { user, token, updateUnreadNotificationsCount } = useContext(AuthContext); // Destructure updateUnreadNotificationsCount
  const { showSnackbar } = useContext(SnackbarContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/notifications/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
      setNotifications(data);
    } catch (err) {
      showSnackbar(err.message, 'error');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user, token, showSnackbar]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to mark as read');

      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      showSnackbar('Notification marked as read.', 'success');
      updateUnreadNotificationsCount(); // Update unread count
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete notification');

      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => notif._id !== notificationId)
      );
      showSnackbar('Notification deleted.', 'success');
      updateUnreadNotificationsCount(); // Update unread count
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  if (!user) return <Typography variant="h6" sx={{ mt: 4 }}>You must be logged in to view notifications.</Typography>;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Notifications</Typography>
      {notifications.length === 0 ? (
        <Typography>No notifications to display.</Typography>
      ) : (
        <List component={Paper} elevation={2}>
          {notifications.map((notif, index) => (
            <React.Fragment key={notif._id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  backgroundColor: notif.read ? 'inherit' : '#e3f2fd', // Light blue for unread
                  '&:hover': { backgroundColor: notif.read ? '#f5f5f5' : '#bbdefb' },
                  py: 1.5
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body1"
                      color="text.primary"
                      fontWeight={notif.read ? 'normal' : 'bold'}
                    >
                      {notif.message}
                      {notif.event && (
                        <Link to={`/events/${notif.event._id}`} style={{ textDecoration: 'none', color: '#1976d2', marginLeft: '8px' }}>
                          View Event: {notif.event.title}
                        </Link>
                      )}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      sx={{ display: 'block' }}
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {new Date(notif.createdAt).toLocaleString()}
                      {notif.sender && ` from ${notif.sender.name}`}
                    </Typography>
                  }
                />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  {!notif.read && (
                    <IconButton edge="end" aria-label="mark as read" onClick={() => handleMarkAsRead(notif._id)}>
                      <MarkEmailReadIcon />
                    </IconButton>
                  )}
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNotification(notif._id)} sx={{ ml: 1 }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </ListItem>
              {index < notifications.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
}

export default Notifications;