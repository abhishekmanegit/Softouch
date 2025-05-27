import React from 'react';
import { AuthProvider } from './AuthContext';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import EventFeed from './EventFeed';

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <Link to="/" style={{ marginRight: 16 }}>Events</Link>
          <Link to="/login" style={{ marginRight: 16 }}>Login</Link>
          <Link to="/signup">Sign Up</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<EventFeed />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 