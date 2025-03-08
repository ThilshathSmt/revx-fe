import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { Box, Typography, CircularProgress, Grid, Button, Divider, Paper, Avatar, Container, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    newPassword: '',
  });
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fetch/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setUserDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Failed to fetch user details.');
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [user, isAuthenticated]);

  const handleEditOpen = () => {
    setEditFormData({
      username: userDetails?.username || '',
      email: userDetails?.email || '',
      newPassword: '',
    });
    setOpenEdit(true);
  };

  const handleEditClose = () => setOpenEdit(false);

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async () => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update/${userDetails?._id}`,
        {
          username: editFormData.username,
          email: editFormData.email,
          password: editFormData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setUserDetails(response.data.user); // Update user details with the response
        setOpenEdit(false);
        alert('User updated successfully');
      }
    } catch (err) {
      console.error('Error updating user details:', err);
      setError('Failed to update user details.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #153B60, #15B2C0 90%)' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ flex: 1, marginTop: 4, paddingBottom: 6 }}>
        <Paper sx={{ padding: 3, maxWidth: 800, margin: 'auto', borderRadius: 3, boxShadow: 5, backgroundColor: '#fff' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 3 }}>
            <Avatar alt="User Avatar" src={userDetails?.avatar || ''} sx={{ width: 120, height: 120, marginBottom: 2, border: '5px solid #153B60', boxShadow: 3 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#153B60' }}>{userDetails?.username}</Typography>
            <Typography variant="body2" sx={{ color: '#153B60', fontStyle: 'italic' }}>{userDetails?.email}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="h6"><strong>Role:</strong> {userDetails?.role}</Typography></Grid>
            <Grid item xs={12}><Typography variant="h6"><strong>Username:</strong> {userDetails?.username || 'N/A'}</Typography></Grid>
            <Grid item xs={12}><Typography variant="h6"><strong>Email:</strong> {userDetails?.email || 'N/A'}</Typography></Grid>
            <Grid item xs={12}><Typography variant="h6"><strong>ID:</strong> {userDetails?._id || 'N/A'}</Typography></Grid>

            {userDetails?.role === 'employee' && (
              <>
                <Grid item xs={12}><Typography variant="h6"><strong>Department:</strong> {userDetails?.employeeDetails?.department || 'N/A'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="h6"><strong>Designation:</strong> {userDetails?.employeeDetails?.designation || 'N/A'}</Typography></Grid>
              </>
            )}

            {userDetails?.role === 'manager' && (
              <>
                <Grid item xs={12}><Typography variant="h6"><strong>Department:</strong> {userDetails?.managerDetails?.department || 'N/A'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="h6"><strong>Team:</strong> {userDetails?.managerDetails?.team?.join(', ') || 'N/A'}</Typography></Grid>
              </>
            )}

            {userDetails?.role === 'hr' && (
              <Grid item xs={12}><Typography variant="h6"><strong>Assigned Departments:</strong> {userDetails?.hrDetails?.assignedDepartments?.join(', ') || 'N/A'}</Typography></Grid>
            )}
          </Grid>
          <Divider sx={{ marginY: 3 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Button variant="contained" color="primary" sx={{ marginRight: 2 }} onClick={handleEditOpen}>Edit Profile</Button>
            <Button variant="contained" color="secondary" onClick={() => router.push(`/${userDetails?.role}`)}>Close</Button>
          </Box>
        </Paper>
      </Container>
      <Footer sx={{ marginTop: 'auto' }} />

      {/* Edit Profile Dialog */}
      <Dialog open={openEdit} onClose={handleEditClose} fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            name="username"
            fullWidth
            value={editFormData.username}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={editFormData.email}
            onChange={handleEditFormChange}
          />
          <TextField
            margin="dense"
            label="New Password"
            name="newPassword"
            type="password"
            fullWidth
            value={editFormData.newPassword}
            onChange={handleEditFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="secondary">Cancel</Button>
          <Button onClick={handleUpdateUser} color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;