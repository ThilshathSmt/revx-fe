import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import HRLayout from '../../components/HRLayout';  // reuse layout or use HRLayout if available
import { useAuth } from '../../hooks/useAuth';

const COLORS = ['#4caf50', '#2196f3', '#f44336']; // colors for charts

const HRDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters for Goals and Tasks
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedGoalStatus, setSelectedGoalStatus] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Please login to view dashboard');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
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
        inProgress: 0,
        scheduled: 0,
      };
    }
    acc[managerId].total += 1;

    if (goal.status === 'completed') acc[managerId].completed += 1;
    else if (goal.status === 'in-progress') acc[managerId].inProgress += 1;
    else if (goal.status === 'scheduled') acc[managerId].scheduled += 1;

    return acc;
  }, {});

  const managerGoalChartData = Object.values(goalsByManager).map(manager => ({
    managerName: manager.managerName,
    Completion: manager.total > 0 ? (manager.completed / manager.total) * 100 : 0,
    'In Progress': manager.total > 0 ? (manager.inProgress / manager.total) * 100 : 0,
    Scheduled: manager.total > 0 ? (manager.scheduled / manager.total) * 100 : 0,
  }));

  // Overall task stats
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
  };

  const taskChartData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'Scheduled', value: taskStats.scheduled },
  ];

  // Filter goals based on manager and goal status
  const filteredGoals = goals.filter(goal => {
    const managerMatch = selectedManager === '' || goal.managerId?._id === selectedManager;
    const statusMatch = selectedGoalStatus === '' || goal.status === selectedGoalStatus;
    return managerMatch && statusMatch;
  });

  // Filter tasks based on project and task status
  const filteredTasks = tasks.filter(task => {
    const projectMatch = selectedProjectId === '' || task.projectId?._id === selectedProjectId;
    const statusMatch = selectedTaskStatus === '' || task.status === selectedTaskStatus;
    return projectMatch && statusMatch;
  });

  // Unique managers for goal filter dropdown
  const managersForFilter = Object.entries(goalsByManager).map(([id, data]) => ({
    id,
    name: data.managerName,
  }));

  // Unique projects from goals for task project filter
  const uniqueProjects = Array.from(new Map(goals.map(goal => [goal._id, goal])).values());

  if (loading) return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />;
  if (error) return <Typography color="error" sx={{ textAlign: 'center', mt: 5 }}>{error}</Typography>;

  return (
    <HRLayout>
      <Box sx={{ padding: 4, minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
        {/* Header */}
        <Typography variant="h3" gutterBottom sx={{ textAlign: 'center', color: '#15B2C0' }}>
          HR Dashboard
        </Typography>

        {/* Manager Goals Progress Rates */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Managers' Goal Progress Rates (%)</Typography>
          {managerGoalChartData.length === 0 ? (
            <Typography>No goals data available</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={managerGoalChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="managerName" angle={-45} textAnchor="end" interval={0} height={80} />
                <YAxis domain={[0, 100]} tickFormatter={val => `${val}%`} />
                <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                <Bar dataKey="Completion" stackId="a" fill="#4caf50" />
                <Bar dataKey="In Progress" stackId="a" fill="#2196f3" />
                <Bar dataKey="Scheduled" stackId="a" fill="#f44336" />
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

              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="filter-manager-label">Filter by Manager</InputLabel>
                  <Select
                    labelId="filter-manager-label"
                    value={selectedManager}
                    label="Filter by Manager"
                    onChange={(e) => setSelectedManager(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All Managers</em>
                    </MenuItem>
                    {managersForFilter.map(manager => (
                      <MenuItem key={manager.id} value={manager.id}>{manager.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="filter-goal-status-label">Filter by Goal Status</InputLabel>
                  <Select
                    labelId="filter-goal-status-label"
                    value={selectedGoalStatus}
                    label="Filter by Goal Status"
                    onChange={(e) => setSelectedGoalStatus(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All Statuses</em>
                    </MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

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
                  {filteredGoals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center' }}>No goals found with current filters.</TableCell>
                    </TableRow>
                  ) : (
                    filteredGoals.map(goal => (
                      <TableRow key={goal._id} hover>
                        <TableCell>{goal.projectTitle}</TableCell>
                        <TableCell>{goal.managerId?.username || "N/A"}</TableCell>
                        <TableCell>{goal.status}</TableCell>
                        <TableCell>{goal.teamId?.teamName || "N/A"}</TableCell>
                        <TableCell>{new Date(goal.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(goal.dueDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Tasks Table */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ maxHeight: 500, overflowY: 'auto', p: 2 }}>
              <Typography variant="h6" gutterBottom>All Tasks Details</Typography>

              {/* Filters */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel id="filter-project-label">Filter by Project</InputLabel>
                  <Select
                    labelId="filter-project-label"
                    value={selectedProjectId}
                    label="Filter by Project"
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All Projects</em>
                    </MenuItem>
                    {uniqueProjects.map(project => (
                      <MenuItem key={project._id} value={project._id}>
                        {project.projectTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="filter-task-status-label">Filter by Task Status</InputLabel>
                  <Select
                    labelId="filter-task-status-label"
                    value={selectedTaskStatus}
                    label="Filter by Task Status"
                    onChange={(e) => setSelectedTaskStatus(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>All Statuses</em>
                    </MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>

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
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center' }}>No tasks found with current filters.</TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map(task => (
                      <TableRow key={task._id} hover>
                        <TableCell>{task.taskTitle}</TableCell>
                        <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>{task.priority}</TableCell>
                        <TableCell>{task.employeeId?.username || "N/A"}</TableCell>
                        <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </HRLayout>
  );
};

export default HRDashboard;
