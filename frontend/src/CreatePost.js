import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { SnackbarContext } from './SnackbarContext';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';

function CreatePost() {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const { token } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create post');
      showSnackbar('Post created successfully!', 'success');
      setText('');
      setImage('');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 600, margin: '40px auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Create New Post</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="What's on your mind?"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
        <TextField
          label="Image URL (optional)"
          fullWidth
          margin="normal"
          value={image}
          onChange={e => setImage(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} fullWidth>
          Post
        </Button>
      </Box>
    </Paper>
  );
}

export default CreatePost; 