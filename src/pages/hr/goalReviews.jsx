import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "@/components/HRLayout";

const ReviewCycleManagement = () => {
  const { user } = useAuth();
  const [goalReviews, setReviewCycles] = useState([]);
  const [goals, setGoals] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReviewCycle, setNewReviewCycle] = useState({
    goalId: "",
    managerId: "",
    dueDate: "",
    status: "Pending",
    managerReview: "",
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReviewCycle, setSelectedReviewCycle] = useState(null);

  const router = useRouter();
  
  // Redirect non-HR users and fetch initial data
  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchReviewCycles();
      fetchGoals();
      fetchManagers();
    }
  }, [user, router]);

  // Fetch all GoalReviewCycles
  const fetchReviewCycles = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setReviewCycles(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch review cycles");
      setLoading(false);
    }
  };

  // Fetch all goals
  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

  // Fetch all managers
  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const managerUsers = response.data.filter((user) => user.role === "manager");
      setManagers(managerUsers);
    } catch (err) {
      console.error("Failed to fetch managers:", err);
    }
  };

  // Save or update a review cycle
  const handleSaveReviewCycle = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${selectedReviewCycle._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/create`;

    try {
      await axios({
        method: isUpdate ? "put" : "post",
        url,
        data: newReviewCycle,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchReviewCycles();
      resetForm();
    } catch (err) {
      setError("Failed to save review cycle");
    }
  };

  // Open the update dialog with selected review cycle data
  const handleUpdateReviewCycle = (reviewCycle) => {
    setNewReviewCycle({
      goalId: reviewCycle.goalId?._id || "",
      managerId: reviewCycle.managerId?._id || "",
      dueDate: reviewCycle.dueDate.split("T")[0],
      status: reviewCycle.status || "Pending",
      managerReview: reviewCycle.managerReview || "",
    });
    setIsUpdate(true);
    setSelectedReviewCycle(reviewCycle);
    setOpen(true);
  };

  // Delete a review cycle by ID
  const handleDeleteReviewCycle = async (reviewCycleId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${reviewCycleId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchReviewCycles();
    } catch (err) {
      setError("Failed to delete review cycle");
    }
  };

  // Reset form and dialog state
  const resetForm = () => {
    setNewReviewCycle({
      goalId: "",
      managerId: "",
      dueDate: "",
      status: "Pending",
      managerReview: "",
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedReviewCycle(null);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>{error}</Typography>;

  return (
    <HRLayout>
      <Typography variant="h3" sx={{ textAlign: "center", color: "#15B2C0" }}>
        Review Cycle Management
      </Typography>

      {/* Create or Update Review Cycle Button */}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} style={{ marginBottom: "20px" }}>
        {isUpdate ? "Update Review Cycle" : "Create Review Cycle"}
      </Button>

      {/* Review Cycles Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Goal</strong></TableCell>
              <TableCell><strong>Manager</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {goalReviews.map((review) => (
              <TableRow key={review._id}>
                <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                <TableCell>{review.managerId?.username || "N/A"}</TableCell>
                <TableCell>{new Date(review.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>{review.status}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="primary" onClick={() => handleUpdateReviewCycle(review)}>
                    <EditIcon />
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteReviewCycle(review._id)}>
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create or Update Review Cycle Dialog */}
      <Dialog open={open} onClose={resetForm}>
        <DialogTitle>{isUpdate ? "Update Review Cycle" : "Create New Review Cycle"}</DialogTitle>
        <DialogContent>
          {/* Goal Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Goal</InputLabel>
            <Select name="goalId" value={newReviewCycle.goalId} onChange={(e) => setNewReviewCycle({ ...newReviewCycle, goalId: e.target.value })}>
              {goals.map((goal) => (
                <MenuItem key={goal._id} value={goal._id}>{goal.projectTitle}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Manager Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Manager</InputLabel>
            <Select name="managerId" value={newReviewCycle.managerId} onChange={(e) => setNewReviewCycle({ ...newReviewCycle, managerId: e.target.value })}>
              {managers.map((manager) => (
                <MenuItem key={manager._id} value={manager._id}>{manager.username}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Due Date */}
          <TextField
            label="Due Date"
            type="date"
            name="dueDate"
            fullWidth
            value={newReviewCycle.dueDate}
            onChange={(e) => setNewReviewCycle({ ...newReviewCycle, dueDate: e.target.value })}
            margin="dense"
          />

          {/* Status */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select name="status" value={newReviewCycle.status} onChange={(e) => setNewReviewCycle({ ...newReviewCycle, status: e.target.value })}>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
            </Select>
          </FormControl>

          {/* Manager Review */}
          <TextField
            label="Manager Review"
            name="managerReview"
            fullWidth
            multiline
            rows={4}
            value={newReviewCycle.managerReview}
            onChange={(e) => setNewReviewCycle({ ...newReviewCycle, managerReview: e.target.value })}
            margin="dense"
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={resetForm} color="primary">Cancel</Button>
          <Button onClick={handleSaveReviewCycle} color="primary">{isUpdate ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

    </HRLayout>
  );
};

export default ReviewCycleManagement;
