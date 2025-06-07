import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { SnackbarContext } from './SnackbarContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const { login } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, skills: skills.split(',').map(s => s.trim()), location })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      showSnackbar('Registration successful! Attempting to log in...', 'info');

      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || 'Login failed after signup');
      login(loginData.user, loginData.token);
      showSnackbar('Login successful!', 'success');
      navigate('/');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, margin: '40px auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Sign Up</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} fullWidth margin="normal" />
        <TextField label="Location" value={location} onChange={e => setLocation(e.target.value)} fullWidth margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Sign Up</Button>
      </Box>
    </Paper>
  );
}

export default Signup; 