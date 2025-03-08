import React, { useState } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Avatar, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DomainIcon from '@mui/icons-material/Domain';
import FlagIcon from '@mui/icons-material/Flag';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu'; // Importing the menu (hamburger) icon
import { useRouter } from 'next/router';

const HRSidebar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(true); // State to control sidebar visibility

  const handleNavigation = (path) => {
    router.push(path);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Box
      sx={{
        width: open ? 260 : 0, // If open, set width to 260px, otherwise 0
        height: '100vh',
        backgroundColor: '#153B60',
        color: 'white',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed', // Fix sidebar in place
        transition: 'width 0.3s', // Smooth transition for sliding effect
        '@media (max-width: 600px)': {
          width: open ? '100%' : '0', // Full width on small screens when open
          height: 'auto',
          position: 'relative', // Allow scrolling on smaller screens
        },
      }}
    >
      {/* Scrollable Sidebar Content with Bottom Space */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', paddingBottom: 5 }}> {/* Added paddingBottom for space */}
        {/* Sidebar Navigation List */}
        <List>
          {/* Dashboard */}
          <ListItem button onClick={() => handleNavigation('/hr')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              secondary="Overview of performance"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>
          {/* Department Management */}
          <ListItem button onClick={() => handleNavigation('/hr/department')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <DomainIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Department "
              secondary="Add/Edit/Delete Department"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* Team Management */}
          <ListItem button onClick={() => handleNavigation('/hr/team')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <DomainIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Team "
              secondary="Add/Edit/Delete Team"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* User Management */}
          <ListItem button onClick={() => handleNavigation('/hr/user-management')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <PeopleIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="User Management"
              secondary="Add/Edit/Delete Users"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* Goal Management */}
          <ListItem button onClick={() => handleNavigation('/hr/goal')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <FlagIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Goal Setting"
              secondary="Add/Edit/Delete Goals"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* Review Cycles */}
          <ListItem button onClick={() => handleNavigation('/hr/reviews')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <EventNoteIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Review Cycles"
              secondary="Manage review cycles"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* Notifications */}
          <ListItem button onClick={() => handleNavigation('/hr/notifications')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <NotificationsIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Notifications"
              secondary="Manage notifications"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* Reports */}
          <ListItem button onClick={() => handleNavigation('/hr/reports')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <BarChartIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Reports"
              secondary="Generate & view reports"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>

          {/* Settings */}
          <ListItem button onClick={() => handleNavigation('/hr/settings')} sx={{ marginBottom: 2 }}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              secondary="Policies & templates"
              primaryTypographyProps={{ color: 'white' }}
              secondaryTypographyProps={{
                sx: { color: 'rgba(255, 255, 255, 0.6)' },
              }}
            />
          </ListItem>
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', marginBottom: 2 }} />

          {/* Profile Section */}
      <Box onClick={() => handleNavigation('/profile/profile')} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 3 }}>
        <Avatar src='images/logo.png'> </Avatar>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
            HR Admin
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Profile
          </Typography>
        </Box>
      </Box>

      
        </List>
      </Box>
    </Box>
  );
};

export default HRSidebar;