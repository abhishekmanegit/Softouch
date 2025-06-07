import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { SnackbarContext } from './SnackbarContext';
import { Typography, Box, CircularProgress, Paper, List, ListItem, ListItemText, Tabs, Tab, Button, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';

function Connections() {
  const { user, token } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState(0); // 0 for Connections, 1 for Requests
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      showSnackbar('You must be logged in to view connections.', 'info');
      setLoading(false);
      return;
    }

    const fetchConnectionsData = async () => {
      setLoading(true);
      try {
        // Fetch accepted connections
        const connectionsRes = await fetch('http://localhost:5000/api/connections/my-connections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const connectionsData = await connectionsRes.json();
        if (!connectionsRes.ok) throw new Error(connectionsData.message || 'Failed to fetch connections');
        setConnections(connectionsData);

        // Fetch pending requests
        const requestsRes = await fetch('http://localhost:5000/api/connections/my-requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const requestsData = await requestsRes.json();
        if (!requestsRes.ok) throw new Error(requestsData.message || 'Failed to fetch requests');
        setRequests(requestsData);

      } catch (err) {
        showSnackbar(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionsData();
  }, [user, token, showSnackbar, processingRequest]); // Re-fetch when a request is processed

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleRequestAction = async (requestId, action) => {
    setProcessingRequest(requestId);
    try {
      const res = await fetch(`http://localhost:5000/api/connections/${action}/${requestId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} request`);

      showSnackbar(`Connection ${action}ed successfully!`, 'success');

      // Optimistically update UI or trigger re-fetch
      setProcessingRequest(null);
      // A re-fetch is triggered by processingRequest dependency in useEffect

    } catch (err) {
      showSnackbar(err.message, 'error');
      setProcessingRequest(null);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Typography variant="h6" sx={{ mt: 4 }}>You must be logged in to view connections.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>My Network</Typography>

      <Tabs value={tab} onChange={handleTabChange} aria-label="connections tabs">
        <Tab label={`Connections (${connections.length})`} />
        <Tab label={`Requests (${requests.length})`} />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {tab === 0 && (
          <>
            <Typography variant="h6" gutterBottom>My Connections</Typography>
            {connections.length === 0 ? (
              <Typography>You don't have any connections yet.</Typography>
            ) : (
              <List>
                {connections.map(connectedUser => (
                  <Paper key={connectedUser._id} sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar src={connectedUser.profilePicture} sx={{ mr: 2 }} />
                    <ListItemText
                      primary={<Typography variant="body1" component={Link} to={`/profile/${connectedUser._id}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}><b>{connectedUser.name}</b></Typography>}
                      secondary={<Typography variant="body2" color="text.secondary">{connectedUser.headline}</Typography>}
                    />
                  </Paper>
                ))}
              </List>
            )}
          </>
        )}

        {tab === 1 && (
          <>
            <Typography variant="h6" gutterBottom>Pending Requests</Typography>
            {requests.length === 0 ? (
              <Typography>You have no pending connection requests.</Typography>
            ) : (
              <List>
                {requests.map(request => (
                  <Paper key={request._id} sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center' }}>
                    <Avatar src={request.sender.profilePicture} sx={{ mr: 2 }} />
                    <ListItemText
                      primary={<Typography variant="body1" component={Link} to={`/profile/${request.sender._id}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}><b>{request.sender.name}</b> wants to connect</Typography>}
                      secondary={<Typography variant="body2" color="text.secondary">{request.sender.headline}</Typography>}
                    />
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleRequestAction(request._id, 'accept')}
                        disabled={processingRequest === request._id}
                      >
                        {processingRequest === request._id ? 'Accepting...' : 'Accept'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRequestAction(request._id, 'reject')}
                        disabled={processingRequest === request._id}
                      >
                        {processingRequest === request._id ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </Box>
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

export default Connections; 