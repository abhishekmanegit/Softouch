import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';

function Profile() {
  const { user } = useContext(AuthContext);
  if (!user) return <div style={{ margin: 40 }}>You are not logged in.</div>;
  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Profile</h2>
      <div><b>Name:</b> {user.name}</div>
      <div><b>Email:</b> {user.email}</div>
      <div><b>Skills:</b> {user.skills && user.skills.join(', ')}</div>
      <div><b>Location:</b> {user.location}</div>
    </div>
  );
}

export default Profile; 