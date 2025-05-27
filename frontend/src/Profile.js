import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { Paper, Typography, Box } from '@mui/material';

function Profile() {
  const { user } = useContext(AuthContext);
  if (!user) return <Paper elevation={3} sx={{ margin: 4, p: 3 }}>You are not logged in.</Paper>;
  return (
    <Paper elevation={3} sx={{ maxWidth: 400, margin: '40px auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Profile</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography><b>Name:</b> {user.name}</Typography>
        <Typography><b>Email:</b> {user.email}</Typography>
        <Typography><b>Skills:</b> {user.skills && user.skills.join(', ')}</Typography>
        <Typography><b>Location:</b> {user.location}</Typography>
      </Box>
    </Paper>
  );
}

export default Profile; 