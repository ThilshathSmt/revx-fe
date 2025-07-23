import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Avatar,
  CircularProgress,
  Stack,
  Badge,
  Divider
} from '@mui/material';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DashboardIcon from '@mui/icons-material/Dashboard';

import EmployeeLayout from '../../components/EmployeeLayout';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336'];

const StatCard = ({ title, value, icon, color }) => (
  <Card elevation={1} sx={{ borderLeft: `6px solid ${color}` }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ color }}>{icon}</Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const EmployeeDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please login to view dashboard');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const profilePicResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            responseType: 'blob'
          }
        );

        setTasks(tasksResponse.data);
        setImagePreview(URL.createObjectURL(profilePicResponse.data));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated]);

  const taskStats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const taskData = [
    { name: 'Completed', value: taskStats.completed || 0 },
    { name: 'In Progress', value: taskStats['in-progress'] || 0 },
    { name: 'Pending', value: taskStats.scheduled || 0 },
  ];

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <EmployeeLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>

        {/* Gradient Header */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            background: 'linear-gradient(45deg, #0c4672, #00bcd4)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: 3
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 200,
              height: 200,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%',
              transform: 'translate(50%, -50%)',
            }}
          />
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <DashboardIcon sx={{ fontSize: 40 }} />
                  <Typography variant="h3" fontWeight={700}>
                    Employee Dashboard
                  </Typography>
                </Stack>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 1 }}>
                  Welcome, {user?.username}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {user?.email}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#4caf50',
                        border: '3px solid white',
                      }}
                    />
                  }
                >
                  <Avatar
                    src={imagePreview || '/default-avatar.png'}
                    sx={{
                      width: 120,
                      height: 120,
                      border: '4px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                  />
                </Badge>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tasks"
              value={tasks.length}
              icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
              color="#607d8b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={taskStats.completed || 0}
              icon={<CheckCircleIcon sx={{ fontSize: 28 }} />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="In Progress"
              value={taskStats['in-progress'] || 0}
              icon={<HourglassEmptyIcon sx={{ fontSize: 28 }} />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending"
              value={taskStats.scheduled || 0}
              icon={<PendingActionsIcon sx={{ fontSize: 28 }} />}
              color="#f44336"
            />
          </Grid>
        </Grid>

        {/* Task Distribution Chart */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Task Status Distribution</Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={taskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {taskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;