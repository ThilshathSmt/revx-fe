// components/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, ListItemText } from '@mui/material';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: 250,
        bgcolor: 'background.paper',
        height: '100vh',
        boxShadow: 3,
        padding: 2,
      }}
    >
      <List>
        <ListItem button onClick={() => handleNavigation('/dashboard')}>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/goals')}>
          <ListItemText primary="Goals" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/feedback')}>
          <ListItemText primary="Feedback" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/reviews')}>
          <ListItemText primary="Reviews" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
