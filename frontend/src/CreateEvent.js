import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box, Grid, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Chip } from '@mui/material';
import { SnackbarContext } from './SnackbarContext';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const eventCategories = [
  'Webinar',
  'Workshop',
  'Conference',
  'Hackathon',
  'Networking Event',
  'Seminar',
  'Meetup',
  'Bootcamp',
  'Panel Discussion',
  'Product Launch',
  'Exhibition',
  'Job Fair',
  'Competition',
  'Training'
];

function CreateEvent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [eventImage, setEventImage] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const { token, user } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  if (!user) return <Paper elevation={3} sx={{ margin: 4, p: 3 }}>You must be logged in to create an event.</Paper>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('organizer', organizer);
      formData.append('date', date);
      formData.append('location', location);
      formData.append('skillsRequired', skillsRequired.split(',').map(s => s.trim()).join(','));
      formData.append('categories', categories.join(','));
      if (image) {
        formData.append('image', image);
      }
      formData.append('organizerEmail', organizerEmail);
      formData.append('eventImage', eventImage);

      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Event creation failed');
      showSnackbar('Event created successfully!', 'success');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, margin: '40px auto', p: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Create New Event
      </Typography>
      <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField label="Event Title" value={title} onChange={e => setTitle(e.target.value)} required fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} required fullWidth multiline rows={4} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Organizer Name" value={organizer} onChange={e => setOrganizer(e.target.value)} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Organizer Email" type="email" value={organizerEmail} onChange={e => setOrganizerEmail(e.target.value)} required fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Event Image URL" type="url" value={eventImage} onChange={e => setEventImage(e.target.value)} fullWidth helperText="Link to an image for the event thumbnail" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Date & Time" type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required fullWidth InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} required fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Skills Required (comma separated)" value={skillsRequired} onChange={e => setSkillsRequired(e.target.value)} fullWidth helperText="e.g., React, Node.js, MongoDB" />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="categories-label">Categories</InputLabel>
              <Select
                labelId="categories-label"
                id="categories"
                multiple
                value={categories}
                onChange={(event) => setCategories(event.target.value)}
                input={<OutlinedInput id="select-multiple-chip" label="Categories" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {eventCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: 2 }}>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files[0])}
          />
        </Box>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
          Create Event
        </Button>
      </Box>
    </Paper>
  );
}

export default CreateEvent; 