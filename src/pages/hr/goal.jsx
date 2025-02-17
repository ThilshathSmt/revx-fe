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
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

const GoalManagement = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newGoal, setNewGoal] = useState({
    projectTitle: "",
    startDate: "",
    dueDate: "",
    status: "scheduled",
    managerId: "",
    description: "",
    departmentId: ""
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const router = useRouter();

  // Redirect non-HR users and fetch initial data
  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchGoals();
      fetchManagers();
      fetchDepartments();
    }
  }, [user, router]);

  // Fetch all goals
  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch goals");
      setLoading(false);
    }
  };

  // Fetch all managers
  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const managerUsers = response.data.filter((user) => user.role == "manager");
      setManagers(managerUsers);
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    }
  };

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  // Save or update a goal
  const handleSaveGoal = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${selectedGoal._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/create`;
    const method = isUpdate ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: newGoal,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchGoals();
      resetForm();
    } catch (err) {
      setError("Failed to save goal");
    }
  };

  // Open the update dialog with selected goal data
  const handleUpdateGoal = (goal) => {
    setNewGoal({
      projectTitle: goal.projectTitle,
      startDate: goal.startDate.split("T")[0],
      dueDate: goal.dueDate.split("T")[0],
      status: goal.status,
      managerId: goal.managerId?._id || "",
      description: goal.description || "",
      departmentId: goal.departmentId?._id || ""
    });
    setIsUpdate(true);
    setSelectedGoal(goal);
    setOpen(true);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (goal) => {
    setGoalToDelete(goal);
    setOpenDeleteDialog(true);
  };

  // Delete a goal
  const handleDeleteGoal = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${goalToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(goals.filter((g) => g._id !== goalToDelete._id));
      setOpenDeleteDialog(false);
    } catch (err) {
      setError("Failed to delete goal");
      setOpenDeleteDialog(false);
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal({ ...newGoal, [name]: value });
  };

  // Reset form and dialog state
  const resetForm = () => {
    setNewGoal({
      projectTitle: "",
      startDate: "",
      dueDate: "",
      status: "scheduled",
      managerId: "",
      description: "",
      departmentId: ""
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedGoal(null);
  };
  // Function to get styles for status cell
  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: "#d3d3d3", color: "#000", borderRadius: "8px", padding: "10px" }; // Light gray
      case "in-progress":
        return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "10px" }; // Light blue
      case "completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "10px" }; // Light green
      default:
        return {};
    }
  };

  if (loading) return <Typography variant="h6">Loading goals...</Typography>;
  if (error) return <Typography variant="h6">{error}</Typography>;

  return (
    <HRLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Goals Management
      </Typography>

      {/* Create or Update Goal Button */}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} style={{ marginBottom: "20px" }}>
        {isUpdate ? "Update Goal" : "Create Goal"}
      </Button>

      {/* Goals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Project Title</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Manager</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goals.map((goal) => (
              <TableRow key={goal._id}>
                <TableCell>{goal.projectTitle}</TableCell>
                <TableCell>{new Date(goal.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(goal.dueDate).toLocaleDateString()}</TableCell>
                {/* Status Cell with Conditional Styling */}
                <TableCell>
                  <span style={getStatusStyle(goal.status)}>{goal.status}</span>
                </TableCell>
                <TableCell>{goal.managerId?.username || "N/A"}</TableCell>
                <TableCell>{goal.departmentId?.departmentName || "N/A"}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Button variant="outlined" color="primary" onClick={() => handleUpdateGoal(goal)}>
                      <EditIcon />
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleOpenDeleteDialog(goal)}>
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create or Update Goal Dialog */}
      <Dialog open={open} onClose={resetForm}>
        <DialogTitle>{isUpdate ? "Update Goal" : "Create New Goal"}</DialogTitle>
        <DialogContent>
          {/* Project Title */}
          <TextField
            label="Project Title"
            name="projectTitle"
            fullWidth
            value={newGoal.projectTitle}
            onChange={handleInputChange}
            margin="dense"
          />

          {/* Start Date */}
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            fullWidth
            value={newGoal.startDate}
            onChange={handleInputChange}
            margin="dense"
          />

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            name="dueDate"
            fullWidth
            value={newGoal.dueDate}
            onChange={handleInputChange}
            margin="dense"
          />



          {/* Manager Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Manager</InputLabel>
            <Select name="managerId" value={newGoal.managerId} onChange={handleInputChange}>
              {managers.map((manager) => (
                <MenuItem key={manager._id} value={manager._id}>{manager.username}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Department Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Department</InputLabel>
            <Select name="departmentId" value={newGoal.departmentId} onChange={handleInputChange}>
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>{department.departmentName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newGoal.description}
            onChange={handleInputChange}
            margin="dense"
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={resetForm} color="primary">Cancel</Button>
          <Button onClick={handleSaveGoal} color="primary">{isUpdate ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this goal?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">Cancel</Button>
          <Button onClick={handleDeleteGoal} color="primary">Delete</Button>
        </DialogActions>
      </Dialog>

    </HRLayout>
  );
};

export default GoalManagement;
