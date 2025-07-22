import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Badge, InputBase, Box, Button, Avatar } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/router';
import { useNotificationCount } from '../hooks/useNotifications';
import HRNotificationPage from '../pages/hr/notification';

const Navbar = () => {
  const router = useRouter();
  const { unreadCount } = useNotificationCount();
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotification = () => {
    setNotificationAnchor(null);
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#153B60' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
        {/* Logo Section aligned to the left */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar src="/images/logo.png" alt="Logo" style={{ height: 60, width: 60 }} />
        </Box>

        {/* Right-Aligned Elements (Search Bar, Notifications, Sign Out) */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Search Bar */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '5px 15px',
            width: '300px',
            marginRight: 2,
          }}>
            <SearchIcon sx={{ color: '#153B60' }} />
            <InputBase
              sx={{ ml: 1, flex: 1, color: '#153B60' }}
              placeholder="Search..."
            />
          </Box>

          {/* Notification Icon with Badge */}
          <IconButton 
            color="inherit" 
            sx={{ marginRight: 2 }}
            onClick={handleNotificationClick}
            id="notification-button"
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Notification Popup */}
          <HRNotificationPage 
            isPopup={true}
            anchorEl={notificationAnchor}
            onClose={handleCloseNotification}
          />

          {/* Sign Out Button */}
          <Button color="inherit" sx={{ color: 'white' }} onClick={() => router.push('/auth/signout')}>
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;