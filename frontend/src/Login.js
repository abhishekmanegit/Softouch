import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { SnackbarContext } from './SnackbarContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.user, data.token);
      showSnackbar('Login successful!', 'success');
      navigate('/');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 400, margin: '40px auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>Login</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required fullWidth margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
      </Box>
    </Paper>
  );
}

export default Login; 