import React, { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Paper, Typography, Box, Button, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, CircularProgress } from '@mui/material';
import { SnackbarContext } from './SnackbarContext';

function Profile() {
  const { user, token, updateUser } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { userId } = useParams();

  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    skills: '',
    location: '',
    profilePicture: '',
    headline: '',
    experience: '[]',
    education: '[]',
    projects: '[]',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      let targetUserId = userId || user?.id;

      if (!targetUserId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/auth/profile${targetUserId ? `/${targetUserId}` : ''}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
        setProfileUser(data);

        if (user && user.id !== data._id) {
          const connectionRes = await fetch(`http://localhost:5000/api/connections/status/${data._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const connectionData = await connectionRes.json();
          if (connectionRes.ok) {
            setConnectionStatus(connectionData.status);
          } else {
            setConnectionStatus(null);
          }
        } else if (user && user.id === data._id) {
          setConnectionStatus('self');
        }

        if (user && user.id === data._id) {
          setEditFormData({
            name: data.name || '',
            email: data.email || '',
            skills: data.skills?.join(', ') || '',
            location: data.location || '',
            profilePicture: data.profilePicture || '',
            headline: data.headline || '',
            experience: JSON.stringify(data.experience || [], null, 2),
            education: JSON.stringify(data.education || [], null, 2),
            projects: JSON.stringify(data.projects || [], null, 2),
          });
        }

      } catch (err) {
        showSnackbar(err.message, 'error');
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, user, token, showSnackbar]);

  const handleOpenEditModal = () => {
    if (profileUser) {
      setEditFormData({
        name: profileUser.name || '',
        email: profileUser.email || '',
        skills: profileUser.skills?.join(', ') || '',
        location: profileUser.location || '',
        profilePicture: profileUser.profilePicture || '',
        headline: profileUser.headline || '',
        experience: JSON.stringify(profileUser.experience || [], null, 2),
        education: JSON.stringify(profileUser.education || [], null, 2),
        projects: JSON.stringify(profileUser.projects || [], null, 2),
      });
    }
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveProfile = async () => {
    try {
      const parsedExperience = JSON.parse(editFormData.experience);
      const parsedEducation = JSON.parse(editFormData.education);
      const parsedProjects = JSON.parse(editFormData.projects);

      const updatedProfile = {
        ...editFormData,
        skills: editFormData.skills.split(',').map(s => s.trim()).filter(s => s),
        experience: parsedExperience,
        education: parsedEducation,
        projects: parsedProjects,
      };

      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      updateUser(data);
      setProfileUser(data);
      showSnackbar('Profile updated successfully!', 'success');
      handleCloseEditModal();

    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleConnect = async () => {
    if (!user || !token || !profileUser) {
      showSnackbar('You must be logged in to send connection requests.', 'warning');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/connections/request/${profileUser._id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send connection request');

      setConnectionStatus('pending');
      showSnackbar('Connection request sent!', 'success');
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!user) {
    showSnackbar('You are not logged in.', 'info');
    return <Typography variant="h6" sx={{ mt: 4 }}>You are not logged in.</Typography>;
  }

  if (!profileUser) {
    return <Typography variant="h6" sx={{ mt: 4 }}>User profile not found.</Typography>;
  }

  const isOwnProfile = user.id === profileUser._id;

  return (
    <Paper elevation={3} sx={{ maxWidth: 800, margin: '40px auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar src={profileUser.profilePicture} sx={{ width: 80, height: 80, mr: 2 }} />
        <Box>
          <Typography variant="h5" gutterBottom>{profileUser.name}</Typography>
          <Typography variant="body1" color="text.secondary">{profileUser.headline}</Typography>
        </Box>
      </Box>

      {!isOwnProfile && (
        <Box sx={{ mb: 2 }}>
          {connectionStatus === 'pending' && <Button variant="outlined" disabled>Pending Request</Button>}
          {connectionStatus === 'accepted' && <Button variant="contained" disabled>Connected</Button>}
          {connectionStatus === null && <Button variant="contained" onClick={handleConnect}>Connect</Button>}
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 1 }}>Contact Info</Typography>
      <Typography sx={{ mb: 1 }}><b>Email:</b> {profileUser.email}</Typography>
      <Typography sx={{ mb: 2 }}><b>Location:</b> {profileUser.location}</Typography>

      {profileUser.skills && profileUser.skills.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profileUser.skills.map((skill, index) => (
              <Chip key={index} label={skill} variant="outlined" />
            ))}
          </Box>
        </Box>
      )}

      {profileUser.experience && profileUser.experience.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Experience</Typography>
          {profileUser.experience.map((exp, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle1"><b>{exp.title}</b> at {exp.company}</Typography>
              <Typography variant="body2" color="text.secondary">{exp.from && new Date(exp.from).toLocaleDateString()} - {exp.current ? 'Present' : (exp.to && new Date(exp.to).toLocaleDateString())}</Typography>
              <Typography variant="body2">{exp.description}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {profileUser.education && profileUser.education.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Education</Typography>
          {profileUser.education.map((edu, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle1"><b>{edu.degree}</b> in {edu.fieldOfStudy} from {edu.school}</Typography>
              <Typography variant="body2" color="text.secondary">{edu.from && new Date(edu.from).toLocaleDateString()} - {edu.current ? 'Present' : (edu.to && new Date(edu.to).toLocaleDateString())}</Typography>
              <Typography variant="body2">{edu.description}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {profileUser.projects && profileUser.projects.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Projects</Typography>
          {profileUser.projects.map((proj, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="subtitle1"><b>{proj.title}</b></Typography>
              <Typography variant="body2">{proj.description}</Typography>
              {proj.link && <Typography variant="body2"><a href={proj.link} target="_blank" rel="noopener noreferrer">View Project</a></Typography>}
              {proj.technologies && proj.technologies.length > 0 && (
                <Typography variant="body2" color="text.secondary">Tech: {proj.technologies.join(', ')}</Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {isOwnProfile && (
        <Button variant="contained" color="primary" onClick={handleOpenEditModal} sx={{ mt: 2 }}>
          Edit Profile
        </Button>
      )}

      <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            name="name"
            value={editFormData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={editFormData.email}
            onChange={handleChange}
            fullWidth
            disabled
          />
          <TextField
            margin="normal"
            label="Headline"
            name="headline"
            value={editFormData.headline}
            onChange={handleChange}
            fullWidth
            helperText="A short, professional headline (e.g., 'Software Engineer at Google')"
          />
          <TextField
            margin="normal"
            label="Profile Picture URL"
            name="profilePicture"
            type="url"
            value={editFormData.profilePicture}
            onChange={handleChange}
            fullWidth
            helperText="Link to your profile image"
          />
          <TextField
            margin="normal"
            label="Skills (comma separated)"
            name="skills"
            value={editFormData.skills}
            onChange={handleChange}
            fullWidth
            helperText="e.g., React, Node.js, MongoDB, Python"
          />
          <TextField
            margin="normal"
            label="Location"
            name="location"
            value={editFormData.location}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="normal"
            label="Experience (JSON Array)"
            name="experience"
            value={editFormData.experience}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            helperText={
              `Enter experience as a JSON array. Example: ${JSON.stringify([{"title":"Software Engineer","company":"Tech Corp","from":"2020-01-01"}])}`
            }
          />
          <TextField
            margin="normal"
            label="Education (JSON Array)"
            name="education"
            value={editFormData.education}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            helperText={
              `Enter education as a JSON array. Example: ${JSON.stringify([{"school":"MIT","degree":"B.S. Computer Science"}])}`
            }
          />
          <TextField
            margin="normal"
            label="Projects (JSON Array)"
            name="projects"
            value={editFormData.projects}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            helperText={
              `Enter projects as a JSON array. Example: ${JSON.stringify([{"title":"My App","description":"A cool app","link":"https://myapp.com","technologies":["React","Node"]}])}`
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Profile; 