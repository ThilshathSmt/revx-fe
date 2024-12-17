// pages/manager/index.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import Navbar from '../../components/Navbar'; // Assuming you have a Navbar component
import Sidebar from '../../components/Sidebar'; // Assuming you have a Sidebar component

const ManagerDashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box sx={{ flex: 1, padding: 3 }}>
        <Navbar />
        <Typography variant="h4" gutterBottom>
          Manager Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the Manager Dashboard! Here you can manage team goals, provide feedback, and more.
        </Typography>
      </Box>
    </Box>
  );
};

export default ManagerDashboard;
