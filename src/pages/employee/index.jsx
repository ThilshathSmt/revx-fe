// pages/dashboard/index.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import Navbar from '../../components/Navbar'; // Assuming you have a Navbar component
import Sidebar from '../../components/Sidebar'; // Assuming you have a Sidebar component

const EmployeeDashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <Box sx={{ flex: 1, padding: 3 }}>
        <Navbar />
        <Typography variant="h4" gutterBottom>
          Employee Dashboard
        </Typography>
        <Typography variant="body1">
          Welcome to the Employee Dashboard! Here you can view your goals, performance, and feedback.
        </Typography>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
