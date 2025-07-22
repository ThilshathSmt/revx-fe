import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import HRLayout from "../../components/HRLayout";

const HRNotificationPage = ({ isPopup, anchorEl, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role === "hr") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const hrNotifications = response.data.filter(
        (n) => n.type === "GoalReviewSubmitted" || n.type === "TaskReviewSubmitted"
      );
      setNotifications(hrNotifications);
      setUnreadCount(hrNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleViewNotification = (notification) => {
    markAsRead(notification._id);
    onClose();
    
    if (notification.type === "GoalReviewSubmitted") {
      router.push(`/hr/goal-reviews?reviewId=${notification.link.split('/').pop()}`);
    } else if (notification.type === "TaskReviewSubmitted") {
      router.push(`/hr/task-reviews?reviewId=${notification.link.split('/').pop()}`);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "GoalReviewSubmitted":
        return "🎯";
      case "TaskReviewSubmitted":
        return "✅";
      default:
        return "🔔";
    }
  };

  // For popup view
  if (isPopup) {
    const recentNotifications = notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return (
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            marginTop: '10px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <Box sx={{ width: 360, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, color: "#15B2C0" }}>
            HR Notifications
          </Typography>
          <Divider />
          {recentNotifications.length > 0 ? (
            <>
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {recentNotifications.map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        backgroundColor: notification.isRead ? "white" : "#e3f2fd",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#15B2C0" }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {notification.message}
                            </Typography>
                            <br />
                            {new Date(notification.createdAt).toLocaleString()}
                          </>
                        }
                      />
                      <Button
                        size="small"
                        onClick={() => handleViewNotification(notification)}
                        sx={{ 
                          ml: 1,
                          color: "#15B2C0",
                          borderColor: "#15B2C0"
                        }}
                      >
                        View
                      </Button>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    onClose();
                    router.push('/hr/notification');
                  }}
                  sx={{ 
                    color: "#15B2C0",
                    borderColor: "#15B2C0"
                  }}
                >
                  View All Notifications
                </Button>
              </Box>
            </>
          ) : (
            <Typography sx={{ p: 2, textAlign: "center" }}>
              No new HR notifications
            </Typography>
          )}
        </Box>
      </Popover>
    );
  }

  // For full page view
  return (
    <HRLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
          HR Notifications
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Message</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((notification) => (
                  <TableRow
                    key={notification._id}
                    sx={{
                      backgroundColor: notification.isRead ? "white" : "#e3f2fd",
                    }}
                  >
                    <TableCell>
                      <Avatar sx={{ bgcolor: "#15B2C0" }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </TableCell>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>
                      {new Date(notification.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color: notification.isRead ? "text.secondary" : "primary.main",
                          fontWeight: notification.isRead ? "normal" : "bold",
                        }}
                      >
                        {notification.isRead ? "Read" : "Unread"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleViewNotification(notification)}
                        sx={{ 
                          color: "#15B2C0",
                          borderColor: "#15B2C0"
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/hr')}
            sx={{ 
              backgroundColor: "#15B2C0"
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    </HRLayout>
  );
};

export default HRNotificationPage;