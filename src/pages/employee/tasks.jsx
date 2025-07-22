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
  Box,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import EmployeeLayout from "../../components/EmployeeLayout";

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const router = useRouter();

  // Redirect non-employee users
  useEffect(() => {
    if (!user || user.role !== "employee") {
      router.push("/");
    } else {
      fetchTasks();
    }
  }, [user, router]);

  // Fetch tasks assigned to the logged-in employee
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  // Open dialog to update task status
  const handleEditStatus = (task) => {
    setSelectedTask(task);
    setUpdatedStatus(task.status); // Set current status as default
    setOpen(true);
  };

  // Save updated status
  const handleSaveStatus = async () => {
    if (!selectedTask) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${selectedTask._id}`,
        { status: updatedStatus },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchTasks(); // Refresh tasks after update
      handleCloseDialog();
    } catch (err) {
      setError("Failed to update task status");
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedTask(null);
    setUpdatedStatus("");
  };

  // Function to get styles for status cell
  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return { backgroundColor: "#d3d3d3", color: "#000", borderRadius: "8px", padding: "10px" };
      case "in-progress":
        return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "10px" };
      case "completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "10px" };
      default:
        return {};
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </EmployeeLayout>
    );
  }

  if (error) {
    return (
      <EmployeeLayout>
        <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 2 }}>
          {error}
        </Typography>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        My Tasks
      </Typography>

      {/* Tasks Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Task Title</strong></TableCell>
              <TableCell><strong>Project</strong></TableCell>
              <TableCell><strong>Start Date</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow key={task._id}>
                  <TableCell>{task.taskTitle}</TableCell>
                  <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                  <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>

                  {/* Status Cell with Conditional Styling */}
                  <TableCell>
                    <span style={getStatusStyle(task.status)}>{task.status}</span>
                  </TableCell>

                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      {/* Edit Button */}
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        onClick={() => handleEditStatus(task)}
                      >
                        <EditIcon />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={tasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Update Status Dialog */}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent>
          {/* Status Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select 
              value={updatedStatus} 
              onChange={(e) => setUpdatedStatus(e.target.value)}
              label="Status"
            >
              {["scheduled", "in-progress", "completed"].map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
          <Button onClick={handleSaveStatus} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </EmployeeLayout>
  );
};

export default TaskManagement;