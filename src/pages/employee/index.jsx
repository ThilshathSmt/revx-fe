import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import EmployeeLayout from '../../components/EmployeeLayout';
import { useAuth } from '../../hooks/useAuth';
import MuiAlert from '@mui/material/Alert';

const performanceData = [
  { month: 'Jan', score: 70 },
  { month: 'Feb', score: 75 },
  { month: 'Mar', score: 80 },
  { month: 'Apr', score: 85 },
  { month: 'May', score: 90 },
  { month: 'Jun', score: 92 },
];

const taskData = [
  { name: 'Completed', value: 60 },
  { name: 'In Progress', value: 25 },
  { name: 'Pending', value: 15 },
];

const COLORS = ['#4caf50', '#2196f3', '#f44336'];

const EmployeeDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }

    const fetchEmployeeDetails = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fetch/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEmployeeDetails(response.data);

        const profilePicResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`, {
          headers: { Authorization: `Bearer ${user.token}` },
          responseType: 'blob',
        });
        setImagePreview(URL.createObjectURL(profilePicResponse.data));
      } catch (err) {
        setError('Failed to fetch employee details.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [user, isAuthenticated]);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <EmployeeLayout>
      <Box sx={{ padding: 4, minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Grid container spacing={4} alignItems="center" justifyContent="center" sx={{ marginBottom: 4 }}>
  {/* User Information Section */}
  <Grid item container xs={12} md={8} alignItems="center" spacing={4}>
     {/* Left Side: Welcome Message */}
    <Grid item xs={12} md={6} sx={{ transform: "translateX(-4cm)" }}>
      <Typography variant="h2" fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
        Welcome, {employeeDetails?.username}!
      </Typography>
    </Grid>

    {/* Right Side: Avatar */}
    <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" justifyContent="center"  sx={{ transform: "translateX(7cm)" }} >
  <Avatar
    src={imagePreview || '/default-avatar.png'}
    sx={{
      width: 120,
      height: 120,
      mb: 2, // Adds spacing between avatar and email
      boxShadow: 3, // Adds a subtle shadow around the avatar for better visual emphasis
    }}
  />
  <Typography variant="body2" color="textSecondary" align="center">
    {employeeDetails?.email}
  </Typography>
</Grid>
  </Grid>
</Grid>

        <Grid container spacing={3} sx={{ marginBottom: 4 }}>
          {['My Goals', 'My Feedback', 'Pending Tasks', 'Progress Rate'].map((title, index) => (
            <Grid item xs={12} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{title}</Typography>
                  <Typography variant="h4">{[3, 2, 4, '78%'][index]}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ padding: 3, marginBottom: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Performance Trends</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ padding: 3, marginBottom: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>Task Status Summary</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={taskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {taskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <MuiAlert severity="success">{snackbarMessage}</MuiAlert>
      </Snackbar>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
