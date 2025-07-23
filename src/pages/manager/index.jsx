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
  Stack,
  CircularProgress,
  Badge,
  Divider
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';

import ManagerLayout from '../../components/ManagerLayout';
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336'];
const GOAL_COLORS = ['#4caf50', '#2196f3', '#f44336'];

// StatCard component
const StatCard = ({ title, value, icon, color, subtitle }) => (
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
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const ManagerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
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
        const goalsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all/`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        const profilePicResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${user.id}/profile-picture`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            responseType: 'blob'
          }
        );

        setGoals(goalsResponse.data);
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

  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.status === 'completed').length,
    inProgress: goals.filter(g => g.status === 'in-progress').length,
    scheduled: goals.filter(g => g.status === 'scheduled').length
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => t.status === 'scheduled').length
  };

  const goalChartData = [
    { status: 'Completed', count: goalStats.completed },
    { status: 'In Progress', count: goalStats.inProgress },
    { status: 'Scheduled', count: goalStats.scheduled }
  ];

  const taskChartData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'Scheduled', value: taskStats.overdue }
  ];

  const goalsByManager = goals.reduce((acc, goal) => {
    if (goal.manager_id) acc[goal.manager_id] = true;
    return acc;
  }, {});

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <ManagerLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
        
        {/* Enhanced Header */}
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
                    Manager Dashboard
                  </Typography>
                </Stack>
                <Typography variant="h5" sx={{ opacity: 0.9, mb: 1 }}>
                  Welcome back, {user?.username}!
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
              title="Total Goals"
              value={goals.length}
              icon={<TrendingUpIcon sx={{ fontSize: 28 }} />}
              color="#4caf50"
              subtitle="Active projects"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tasks"
              value={tasks.length}
              icon={<AssignmentIcon sx={{ fontSize: 28 }} />}
              color="#2196f3"
              subtitle="All assignments"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Managers"
              value={Object.keys(goalsByManager).length}
              icon={<PeopleIcon sx={{ fontSize: 28 }} />}
              color="#ff9800"
              subtitle="Managing projects"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completion Rate"
              value={`${goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%`}
              icon={<TimelineIcon sx={{ fontSize: 28 }} />}
              color="#9c27b0"
              subtitle="Overall progress"
            />
          </Grid>
        </Grid>

        {/* Goals Progress Chart */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Goals Progress</Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                {goalChartData.map((entry, index) => (
                  <Cell key={`goal-cell-${index}`} fill={GOAL_COLORS[index % GOAL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Task Distribution Chart */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>Task Status Distribution</Typography>
          <Divider sx={{ mb: 2 }} />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {taskChartData.map((entry, index) => (
                  <Cell key={`task-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </ManagerLayout>
  );
};

export default ManagerDashboard;