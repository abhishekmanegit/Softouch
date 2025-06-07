import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { SnackbarContext } from './SnackbarContext';
import { Card, CardContent, CardActions, Button, Typography, Box, Avatar, TextField, CircularProgress, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { Link } from 'react-router-dom';

function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({}); // State to hold comment text for each post
  const { user, token } = useContext(AuthContext);
  const { showSnackbar } = useContext(SnackbarContext);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
      setPosts(data);
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPosts();
    } else {
      setLoading(false);
    }
  }, [token, showSnackbar]);

  const handleLike = async (postId) => {
    if (!user || !token) {
      showSnackbar('You must be logged in to like posts.', 'warning');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/like/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to like post');
      // Update the specific post's likes in the state
      setPosts(prevPosts => prevPosts.map(post =>
        post._id === postId ? { ...post, likes: data } : post
      ));
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleUnlike = async (postId) => {
    if (!user || !token) {
      showSnackbar('You must be logged in to unlike posts.', 'warning');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/unlike/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to unlike post');
      // Update the specific post's likes in the state
      setPosts(prevPosts => prevPosts.map(post =>
        post._id === postId ? { ...post, likes: data } : post
      ));
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user || !token) {
      showSnackbar('You must be logged in to comment on posts.', 'warning');
      return;
    }
    if (!commentText[postId] || commentText[postId].trim() === '') {
      showSnackbar('Comment cannot be empty.', 'warning');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/posts/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText[postId] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add comment');
      setPosts(prevPosts => prevPosts.map(post =>
        post._id === postId ? { ...post, comments: data } : post
      ));
      setCommentText(prev => ({ ...prev, [postId]: '' })); // Clear comment input
    } catch (err) {
      showSnackbar(err.message, 'error');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Typography variant="h6" sx={{ mt: 4 }}>Please log in to view the post feed.</Typography>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Posts</Typography>
      {posts.length === 0 ? (
        <Typography>No posts available. Be the first to create one!</Typography>
      ) : (
        posts.map(post => (
          <Card key={post._id} elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={post.user?.profilePicture} sx={{ mr: 1 }} component={Link} to={`/profile/${post.user?._id}`} />
                <Box>
                  <Typography variant="subtitle1" component={Link} to={`/profile/${post.user?._id}`} sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}>
                    {post.user?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{new Date(post.date).toLocaleString()}</Typography>
                </Box>
              </Box>
              <Typography variant="body1" paragraph>{post.text}</Typography>
              {post.image && (
                <Box sx={{ maxWidth: '100%', maxHeight: 400, overflow: 'hidden', mb: 2 }}>
                  <img src={post.image} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
              <Box>
                <IconButton onClick={() => {
                  const hasLiked = post.likes.some(like => like.user.toString() === user.id);
                  if (hasLiked) {
                    handleUnlike(post._id);
                  } else {
                    handleLike(post._id);
                  }
                }} color={user && post.likes.some(like => like.user.toString() === user.id) ? 'error' : 'default'}>
                  <FavoriteIcon />
                </IconButton>
                <Typography variant="body2" display="inline" sx={{ mr: 2 }}>{post.likes.length} Likes</Typography>
                <IconButton>
                  <ChatBubbleIcon />
                </IconButton>
                <Typography variant="body2" display="inline">{post.comments.length} Comments</Typography>
              </Box>
            </CardActions>
            <Box sx={{ p: 2, pt: 0 }}>
              {post.comments.length > 0 && (
                <Box sx={{ mt: 1, maxHeight: 150, overflowY: 'auto' }}>
                  {post.comments.map(comment => (
                    <Box key={comment._id} sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <Avatar src={comment.user?.profilePicture} sx={{ width: 24, height: 24, mr: 1 }} />
                      <Typography variant="body2"><b>{comment.user?.name}</b>: {comment.text}</Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Add a comment..."
                value={commentText[post._id] || ''}
                onChange={e => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCommentSubmit(post._id);
                  }
                }}
                sx={{ mt: 2 }}
              />
            </Box>
          </Card>
        ))
      )}
    </Box>
  );
}

export default PostFeed; 