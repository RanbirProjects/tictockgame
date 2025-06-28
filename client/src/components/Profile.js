import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as StatsIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);

    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || ''
    });
    setErrors({});
    setIsEditing(false);
  };

  const getWinRate = () => {
    if (!user?.stats?.gamesPlayed) return 0;
    return Math.round((user.stats.gamesWon / user.stats.gamesPlayed) * 100);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Profile
          </Typography>
          {!isEditing ? (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </Button>
            </Box>
          )}
        </Box>

        {/* Profile Information */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Username</Typography>
            </Box>
            {isEditing ? (
              <TextField
                fullWidth
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                variant="outlined"
              />
            ) : (
              <Typography variant="body1" sx={{ pl: 4 }}>
                {user?.username}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Email</Typography>
            </Box>
            {isEditing ? (
              <TextField
                fullWidth
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
              />
            ) : (
              <Typography variant="body1" sx={{ pl: 4 }}>
                {user?.email}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Game Statistics */}
        <Typography variant="h5" gutterBottom>
          Game Statistics
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <StatsIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Games Played</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {user?.stats?.gamesPlayed || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrophyIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Wins</Typography>
                </Box>
                <Typography variant="h4" color="success.main">
                  {user?.stats?.gamesWon || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PersonIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Losses</Typography>
                </Box>
                <Typography variant="h4" color="error.main">
                  {user?.stats?.gamesLost || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <StatsIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Win Rate</Typography>
                </Box>
                <Typography variant="h4" color="info.main">
                  {getWinRate()}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Additional Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Draws:</strong> {user?.stats?.gamesDrawn || 0}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1">
                <strong>Member since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile; 