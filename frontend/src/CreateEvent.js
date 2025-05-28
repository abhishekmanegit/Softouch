import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Alert, Box } from '@mui/material';

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return <Paper elevation={3} sx={{ margin: 4, p: 3 }}>You must be logged in to create an event.</Paper>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('organizer', organizer);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('skillsRequired', skillsRequired.split(',').map(s => s.trim()).join(','));
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Event creation failed');
      setSuccess('Event created!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 500, margin: '40px auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Create Event</Typography>
      <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
        <TextField label="Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} required fullWidth margin="normal" multiline rows={3} />
        <TextField label="Organizer" value={organizer} onChange={e => setOrganizer(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Date" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
        <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Skills Required (comma separated)" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} fullWidth margin="normal" />
        <Box sx={{ mt: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Create Event</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Paper>
  );
}

export default CreateEvent; 