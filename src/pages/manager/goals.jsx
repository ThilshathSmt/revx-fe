import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import ManagerLayout from "../../components/ManagerLayout";

const GoalManagement = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");

  const router = useRouter();

  // Redirect non-manager users
  useEffect(() => {
    if (!user || user.role !== "manager") {
      router.push("/");
    } else {
      fetchGoals();
    }
  }, [user, router]);

  // Fetch goals assigned to the logged-in manager
  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch goals");
      setLoading(false);
    }
  };

  // Open dialog to update goal status
  const handleEditStatus = (goal) => {
    setSelectedGoal(goal);
    setUpdatedStatus(goal.status); // Set current status as default
    setOpen(true);
  };

  // Save updated status
  const handleSaveStatus = async () => {
    if (!selectedGoal) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/${selectedGoal._id}`,
        { status: updatedStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchGoals(); // Refresh goals after update
      handleCloseDialog();
    } catch (err) {
      setError("Failed to update goal status");
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedGoal(null);
    setUpdatedStatus("");
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
    <ManagerLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        My Goals
      </Typography>

      {/* Goals Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Project Title</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
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

                <TableCell>{goal.departmentId?.departmentName || "N/A"}</TableCell>
                <TableCell>{goal.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    {/* Edit Button */}
                    <Button variant="outlined" color="primary" onClick={() => handleEditStatus(goal)}>
                      <EditIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Update Status Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Update Goal Status</DialogTitle>
        <DialogContent>
          {/* Status Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select value={updatedStatus} onChange={(e) => setUpdatedStatus(e.target.value)}>
              {["scheduled", "in-progress", "completed"].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleSaveStatus} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </ManagerLayout>
  );
};

export default GoalManagement;
