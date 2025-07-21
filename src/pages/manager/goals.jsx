import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert,
  FormHelperText,
  Skeleton,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ManagerLayout from "../../components/ManagerLayout";

// Utility function for minimum delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const withMinimumDelay = async (fn, minDelay = 1000) => {
  const startTime = Date.now();
  const result = await fn();
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(minDelay - elapsed, 0);
  await delay(remaining);
  return result;
};

const GoalManagement = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newGoal, setNewGoal] = useState({
    projectTitle: "",
    startDate: "",
    dueDate: "",
    status: "scheduled",
    teamId: "",
    description: ""
  });
  const [formErrors, setFormErrors] = useState({
    projectTitle: "",
    startDate: "",
    dueDate: "",
    teamId: ""
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "manager") {
      router.push("/");
    } else {
      fetchInitialData();
    }
  }, [user, router]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await withMinimumDelay(async () => {
        await Promise.all([
          fetchGoals(),
          fetchManagedTeams()
        ]);
      });
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
    } catch (err) {
      setError("Failed to fetch goals");
      throw err;
    }
  };

  const fetchManagedTeams = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/by-manager/${user.id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setTeams(response.data.teams);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setError("Failed to fetch your teams");
      throw err;
    }
  };

  const validateForm = () => {
    let valid = true;
    const errors = {
      projectTitle: "",
      startDate: "",
      dueDate: "",
      teamId: ""
    };

    if (!newGoal.projectTitle.trim()) {
      errors.projectTitle = "Project title is required";
      valid = false;
    }

    if (!newGoal.startDate) {
      errors.startDate = "Start date is required";
      valid = false;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Remove time

      const selectedDate = new Date(newGoal.startDate);
      selectedDate.setHours(0, 0, 0, 0); // Remove time

      if (selectedDate < today) {
        errors.startDate = "Start date cannot be in the past";
        valid = false;
      }
    }


    if (!newGoal.dueDate) {
      errors.dueDate = "Due date is required";
      valid = false;
    } else if (newGoal.startDate && new Date(newGoal.dueDate) < new Date(newGoal.startDate)) {
      errors.dueDate = "Due date must be after start date";
      valid = false;
    }

    if (!newGoal.teamId) {
      errors.teamId = "Team is required";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSaveGoal = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      await withMinimumDelay(async () => {
        const url = isUpdate
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${selectedGoal._id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/create`;

        await axios({
          method: isUpdate ? "put" : "post",
          url,
          data: { ...newGoal, managerId: user.id },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage(isUpdate ? "Goal updated successfully!" : "Goal created successfully!");
        fetchGoals();
        resetForm();
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save goal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGoal = (goal) => {
    setNewGoal({
      projectTitle: goal.projectTitle,
      startDate: goal.startDate.split("T")[0],
      dueDate: goal.dueDate.split("T")[0],
      status: goal.status,
      teamId: goal.teamId?._id || "",
      description: goal.description || ""
    });
    setIsUpdate(true);
    setSelectedGoal(goal);
    setOpen(true);
  };

  const handleDeleteGoal = async () => {
    try {
      setActionLoading(true);
      await withMinimumDelay(async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${goalToDelete._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Goal deleted successfully!");
        setGoals(goals.filter((g) => g._id !== goalToDelete._id));
        setOpenDeleteDialog(false);
      });
    } catch (err) {
      setError("Failed to delete goal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal({ ...newGoal, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const resetForm = () => {
    setNewGoal({
      projectTitle: "",
      startDate: "",
      dueDate: "",
      status: "scheduled",
      teamId: "",
      description: ""
    });
    setFormErrors({
      projectTitle: "",
      startDate: "",
      dueDate: "",
      teamId: ""
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedGoal(null);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: "#d3d3d3", borderRadius: "4px", padding: "4px 8px" };
      case "in-progress":
        return { backgroundColor: "#add8e6", borderRadius: "4px", padding: "4px 8px" };
      case "completed":
        return { backgroundColor: "#90ee90", borderRadius: "4px", padding: "4px 8px" };
      default:
        return {};
    }
  };

  // Loading skeleton for table rows
  const renderLoadingSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell><Skeleton variant="text" width="70%" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <ManagerLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Goal Management
      </Typography>

      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
        disabled={loading}
      >
        {isUpdate ? "Update Goal" : "Create New Goal"}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell><strong>Project Title</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingSkeletons()
            ) : (
              goals.map((goal) => (
                <TableRow key={goal._id} hover>
                  <TableCell>{goal.projectTitle}</TableCell>
                  <TableCell>{new Date(goal.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(goal.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span style={getStatusStyle(goal.status)}>
                      {goal.status}
                    </span>
                  </TableCell>
                  <TableCell>{goal.teamId?.teamName || "N/A"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleUpdateGoal(goal)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <CircularProgress size={24} /> : <EditIcon />}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setGoalToDelete(goal);
                          setOpenDeleteDialog(true);
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <CircularProgress size={24} /> : <DeleteIcon />}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Goal" : "Create New Goal"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Project Title"
                name="projectTitle"
                fullWidth
                value={newGoal.projectTitle}
                onChange={handleInputChange}
                error={!!formErrors.projectTitle}
                helperText={formErrors.projectTitle}
                disabled={actionLoading}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Start Date"
                type="date"
                name="startDate"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newGoal.startDate}
                onChange={handleInputChange}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                disabled={actionLoading}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Due Date"
                type="date"
                name="dueDate"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newGoal.dueDate}
                onChange={handleInputChange}
                error={!!formErrors.dueDate}
                helperText={formErrors.dueDate}
                disabled={actionLoading}
              />
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth error={!!formErrors.teamId} disabled={actionLoading}>
                <InputLabel>Team</InputLabel>
                <Select
                  name="teamId"
                  value={newGoal.teamId}
                  onChange={handleInputChange}
                  label="Team"
                >
                  {teams.map((team) => (
                    <MenuItem key={team._id} value={team._id}>
                      {team.teamName}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.teamId && <FormHelperText>{formErrors.teamId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <FormControl fullWidth disabled={actionLoading}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newGoal.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                fullWidth
                multiline
                rows={4}
                value={newGoal.description}
                onChange={handleInputChange}
                disabled={actionLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm} disabled={actionLoading}>Cancel</Button>
          <Button
            onClick={handleSaveGoal}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isUpdate ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the goal "{goalToDelete?.projectTitle}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteGoal}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success and Error Notifications */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ManagerLayout>
  );
};

export default GoalManagement;