import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Alert, Box } from '@mui/material';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, skills: skills.split(',').map(s => s.trim()), location })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');
      // Auto-login after signup
      const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
      login(loginData.user, loginData.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
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
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
}

export default Signup; 