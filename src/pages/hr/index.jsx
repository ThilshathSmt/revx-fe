import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ManagerLayout from '../../components/ManagerLayout';  // reuse layout or use HRLayout if available
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336']; // colors for charts

const HRDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please login to view dashboard');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all goals (HR can access all)
        const [goalsRes, tasksRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/hr`, { headers: { Authorization: `Bearer ${user.token}` } }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all`, { headers: { Authorization: `Bearer ${user.token}` } }),
        ]);
        setGoals(goalsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated]);

  // Group goals by manager and calculate completion stats per manager
  const goalsByManager = goals.reduce((acc, goal) => {
    const managerId = goal.managerId?._id || 'Unknown';
    const managerName = goal.managerId?.username || 'Unknown Manager';

    if (!acc[managerId]) {
      acc[managerId] = {
        managerName,
        total: 0,
        completed: 0,
      };
    }
    acc[managerId].total += 1;
    if (goal.status === 'completed') {
      acc[managerId].completed += 1;
    }
    return acc;
  }, {});

  // Prepare chart data for managers' goal completion rates
  const managerGoalChartData = Object.values(goalsByManager).map(manager => ({
    managerName: manager.managerName,
    completionRate: manager.total > 0 ? (manager.completed / manager.total) * 100 : 0,
  }));

  // Overall task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
  };

  // Task chart data
  const taskChartData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'Scheduled', value: taskStats.scheduled },
  ];

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>;

  return (
    <ManagerLayout>
      <Box sx={{ padding: 4, minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
        {/* Header */}
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', color: '#15B2C0' }}>
          HR Dashboard
        </Typography>

        {/* Manager Goals Completion Rates */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Managers' Goal Completion Rates (%)</Typography>
          {managerGoalChartData.length === 0 ? (
            <Typography>No goals data available</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={managerGoalChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="managerName" angle={-45} textAnchor="end" interval={0} height={70} />
                <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                <Bar dataKey="completionRate" fill="#4caf50" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Task Status Distribution */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Task Status Distribution</Typography>
          {tasks.length === 0 ? (
            <Typography>No tasks data available</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {taskChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}`, `${name}`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Detailed Tables */}

        <Grid container spacing={3}>
          {/* Goals Table */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ maxHeight: 500, overflowY: 'auto', p: 2 }}>
              <Typography variant="h6" gutterBottom>All Goals Details</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Title</TableCell>
                    <TableCell>Manager</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Team</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {goals.map(goal => (
                    <TableRow key={goal._id} hover>
                      <TableCell>{goal.projectTitle}</TableCell>
                      <TableCell>{goal.managerId?.username || "N/A"}</TableCell>
                      <TableCell>{goal.status}</TableCell>
                      <TableCell>{goal.teamId?.teamName || "N/A"}</TableCell>
                      <TableCell>{new Date(goal.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(goal.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Tasks Table */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ maxHeight: 500, overflowY: 'auto', p: 2 }}>
              <Typography variant="h6" gutterBottom>All Tasks Details</Typography>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Title</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Assigned Employee</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task._id} hover>
                      <TableCell>{task.taskTitle}</TableCell>
                      <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                      <TableCell>{task.status}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell>{task.employeeId?.username || "N/A"}</TableCell>
                      <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ManagerLayout>
  );
};

export default HRDashboard;
