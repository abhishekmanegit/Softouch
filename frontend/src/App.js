import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { SnackbarProvider } from './SnackbarContext';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import EventFeed from './EventFeed';
import CreateEvent from './CreateEvent';
import Profile from './Profile';
import EventDetails from './EventDetails';
import Dashboard from './Dashboard';
import Connections from './Connections';
import { AppBar, Toolbar, Button, Container, Typography, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
          Softouch
        </Typography>
        {user && <Button color="inherit" component={Link} to="/create">Create Event</Button>}
        {user && <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>}
        {user && <Button color="inherit" component={Link} to="/connections">My Network</Button>}
        {user ? (
          <>
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            <Button color="inherit" onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/signup">Sign Up</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <AuthProvider>
          <Router>
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 4 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/create" element={<CreateEvent />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/" element={<EventFeed />} />
              </Routes>
            </Container>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App; 