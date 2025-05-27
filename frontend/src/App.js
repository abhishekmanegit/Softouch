import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import EventFeed from './EventFeed';
import CreateEvent from './CreateEvent';
import Profile from './Profile';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <nav style={{ padding: 16, borderBottom: '1px solid #eee' }}>
      <Link to="/" style={{ marginRight: 16 }}>Events</Link>
      {user && <Link to="/create" style={{ marginRight: 16 }}>Create Event</Link>}
      {user ? (
        <>
          <Link to="/profile" style={{ marginRight: 16 }}>Profile</Link>
          <button onClick={logout} style={{ marginRight: 16 }}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: 16 }}>Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<EventFeed />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 