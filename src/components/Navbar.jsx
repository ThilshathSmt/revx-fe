// components/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  const handleSignOut = () => {
    // Handle sign-out logic here (e.g., using NextAuth signOut method)
    router.push('/auth/signin'); // Redirect to sign-in page after logout
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          My Performance App
        </Typography>
        <Button color="inherit" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
