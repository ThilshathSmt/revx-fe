// pages/index.js
import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import Link from 'next/link';

const Home = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        textAlign: 'center',  // Align text to center for better layout
      }}
    >
      <Typography variant="h3" color="primary" gutterBottom>
        Welcome to My Performance App
      </Typography>
      <Typography variant="body1" paragraph>
        This app helps employees, managers, and HR professionals manage performance reviews, goals, and feedback effectively.
      </Typography>
      
      {/* Get Started Button */}
      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
        <Link href="/auth/signin" passHref>
          <Button variant="contained" color="primary" fullWidth>
            Sign In
          </Button>
        </Link>
        
        <Link href="/auth/signup" passHref>
          <Button variant="contained" color="secondary" fullWidth>
            Sign Up
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default Home;
