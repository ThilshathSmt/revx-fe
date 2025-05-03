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
  TextField,
  Box,
  Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EventNoteIcon from "@mui/icons-material/EventNote";
import HRLayout from "../../components/HRLayout";
import EmployeeLayout from "../../components/EmployeeLayout";

const TaskReviewManagement = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    departmentId: "",
    teamId: "",
    goalId: "",
    taskId: "",
    employeeId: "",
    dueDate: "",
    description: "",
    status: "Pending"
  });
  const [employeeReviewText, setEmployeeReviewText] = useState("");
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [viewMode, setViewMode] = useState("hr"); // 'hr' or 'employee'

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else {
      if (user.role === "hr") {
        setViewMode("hr");
        fetchReviews();
        fetchDepartments();
      } else {
        setViewMode("employee");
        fetchEmployeeReviews();
      }
    }
  }, [user, router]);

  // Fetch teams when department changes
  useEffect(() => {
    const fetchTeamsForDepartment = async () => {
      if (newReview.departmentId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`,
            {
              params: { departmentId: newReview.departmentId },
              headers: { Authorization: `Bearer ${user.token}` }
            }
          );
          setTeams(response.data);
          setNewReview(prev => ({
            ...prev,
            teamId: "",
            goalId: "",
            taskId: "",
            employeeId: ""
          }));
        } catch (err) {
          console.error("Failed to fetch teams:", err);
          setTeams([]);
        }
      } else {
        setTeams([]);
      }
    };
    fetchTeamsForDepartment();
  }, [newReview.departmentId, user]);

  // Fetch goals when team changes
  useEffect(() => {
    const fetchGoalsForTeam = async () => {
      if (newReview.teamId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/team/${newReview.teamId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setGoals(response.data);
          setNewReview(prev => ({
            ...prev,
            goalId: "",
            taskId: "",
            employeeId: ""
          }));
        } catch (err) {
          console.error("Failed to fetch goals:", err);
          setGoals([]);
        }
      } else {
        setGoals([]);
      }
    };
    fetchGoalsForTeam();
  }, [newReview.teamId, user]);

  // Fetch tasks when goal changes
  useEffect(() => {
    const fetchTasksForGoal = async () => {
      if (newReview.goalId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/goal/${newReview.goalId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setTasks(response.data);
          setNewReview(prev => ({
            ...prev,
            taskId: "",
            employeeId: ""
          }));
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    };
    fetchTasksForGoal();
  }, [newReview.goalId, user]);

  // Fetch employee when task changes
  useEffect(() => {
    const fetchEmployeeForTask = async () => {
      if (newReview.taskId) {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${newReview.taskId}`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          const task = response.data;
          if (task.assignedTo) {
            setEmployees([task.assignedTo]);
            setNewReview(prev => ({
              ...prev,
              employeeId: task.assignedTo._id
            }));
          } else {
            setEmployees([]);
          }
        } catch (err) {
          console.error("Failed to fetch task:", err);
          setEmployees([]);
        }
      } else {
        setEmployees([]);
      }
    };
    fetchEmployeeForTask();
  }, [newReview.taskId, user]);

  // HR: Fetch all task reviews
  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch task reviews");
      setLoading(false);
    }
  };

  // Employee: Fetch assigned task reviews
  const fetchEmployeeReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews`,
        { 
          params: { employeeId: user.id },
          headers: { Authorization: `Bearer ${user.token}` } 
        }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch your task reviews");
      setLoading(false);
    }
  };

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setDepartments([]);
    }
  };

  // Save or update a task review
  const handleSaveReview = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${selectedReview._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/create`;
    const method = isUpdate ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: {
          ...newReview,
          hrAdminId: user.id
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (viewMode === "hr") {
        fetchReviews();
      } else {
        fetchEmployeeReviews();
      }
      resetForm();
    } catch (err) {
      setError("Failed to save task review");
    }
  };

  // Employee submits their review
  const handleSubmitEmployeeReview = async (reviewId) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${reviewId}/submit`,
        { employeeReview: employeeReviewText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchEmployeeReviews();
      setEmployeeReviewText("");
    } catch (err) {
      setError("Failed to submit your review");
    }
  };

  // Open update dialog with selected review data
  const handleUpdateReview = (review) => {
    setNewReview({
      departmentId: review.departmentId?._id || "",
      teamId: review.teamId?._id || "",
      goalId: review.goalId?._id || "",
      taskId: review.taskId?._id || "",
      employeeId: review.employeeId?._id || "",
      dueDate: review.dueDate?.split("T")[0] || "",
      description: review.description || "",
      status: review.status || "Pending"
    });
    setIsUpdate(true);
    setSelectedReview(review);
    setOpen(true);
  };

  // Delete a task review
  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/taskReviews/${reviewId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchReviews();
    } catch (err) {
      setError("Failed to delete task review");
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  // Reset form
  const resetForm = () => {
    setNewReview({
      departmentId: "",
      teamId: "",
      goalId: "",
      taskId: "",
      employeeId: "",
      dueDate: "",
      description: "",
      status: "Pending"
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedReview(null);
  };

  // Status style
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#ffcccb", color: "#000" };
      case "In Progress":
        return { backgroundColor: "#fffacd", color: "#000" };
      case "Completed":
        return { backgroundColor: "#90ee90", color: "#000" };
      default:
        return {};
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <>
      {viewMode === "hr" ? (
        <HRLayout>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            Task Review Management
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpen(true)}
            sx={{ mb: 3 }}
          >
            Create Task Review
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Department</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Goal</TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>{review.departmentId?.departmentName || "N/A"}</TableCell>
                    <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                    <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                    <TableCell>{review.taskId?.title || "N/A"}</TableCell>
                    <TableCell>{review.employeeId?.username || "N/A"}</TableCell>
                    <TableCell>
                      {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.status}
                        style={getStatusStyle(review.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {review.description?.length > 30
                        ? `${review.description.substring(0, 30)}...`
                        : review.description || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleUpdateReview(review)}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Create/Update Dialog */}
          <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
            <DialogTitle>
              {isUpdate ? "Update Task Review" : "Create Task Review"}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                {/* Department */}
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="departmentId"
                    value={newReview.departmentId}
                    onChange={handleInputChange}
                    required
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Team */}
                <FormControl fullWidth>
                  <InputLabel>Team</InputLabel>
                  <Select
                    name="teamId"
                    value={newReview.teamId}
                    onChange={handleInputChange}
                    disabled={!newReview.departmentId}
                    required
                  >
                    {teams.map((team) => (
                      <MenuItem key={team._id} value={team._id}>
                        {team.teamName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Goal */}
                <FormControl fullWidth>
                  <InputLabel>Goal</InputLabel>
                  <Select
                    name="goalId"
                    value={newReview.goalId}
                    onChange={handleInputChange}
                    disabled={!newReview.teamId}
                    required
                  >
                    {goals.map((goal) => (
                      <MenuItem key={goal._id} value={goal._id}>
                        {goal.projectTitle}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Task */}
                <FormControl fullWidth>
                  <InputLabel>Task</InputLabel>
                  <Select
                    name="taskId"
                    value={newReview.taskId}
                    onChange={handleInputChange}
                    disabled={!newReview.goalId}
                    required
                  >
                    {tasks.map((task) => (
                      <MenuItem key={task._id} value={task._id}>
                        {task.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Employee (auto-selected based on task) */}
                <FormControl fullWidth>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    name="employeeId"
                    value={newReview.employeeId}
                    onChange={handleInputChange}
                    disabled={!newReview.taskId || employees.length === 0}
                    required
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp._id} value={emp._id}>
                        {emp.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Due Date */}
                <TextField
                  label="Due Date"
                  type="date"
                  name="dueDate"
                  value={newReview.dueDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />

                {/* Status */}
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={newReview.status}
                    onChange={handleInputChange}
                    required
                  >
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>

                {/* Description */}
                <TextField
                  label="Description"
                  name="description"
                  value={newReview.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  fullWidth
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSaveReview} variant="contained">
                {isUpdate ? "Update" : "Create"}
              </Button>
            </DialogActions>
          </Dialog>
        </HRLayout>
      ) : (
        <EmployeeLayout>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            My Task Reviews
          </Typography>

          {reviews.length === 0 ? (
            <Typography>No task reviews assigned to you.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>HR Description</TableCell>
                    <TableCell>Your Review</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reviews.map((review) => (
                    <TableRow key={review._id}>
                      <TableCell>{review.taskId?.title || "N/A"}</TableCell>
                      <TableCell>
                        {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={review.status}
                          style={getStatusStyle(review.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {review.description || "N/A"}
                      </TableCell>
                      <TableCell>
                        {review.employeeReview || "Not submitted"}
                      </TableCell>
                      <TableCell>
                        {review.submissionDate
                          ? new Date(review.submissionDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {review.status !== "Completed" && (
                          <Button
                            variant="outlined"
                            startIcon={<EventNoteIcon />}
                            onClick={() => {
                              setSelectedReview(review);
                              setEmployeeReviewText(review.employeeReview || "");
                              setOpen(true);
                            }}
                          >
                            {review.employeeReview ? "Update Review" : "Submit Review"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Employee Review Dialog */}
          <Dialog
            open={open && viewMode === "employee"}
            onClose={() => {
              setOpen(false);
              setSelectedReview(null);
            }}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>
              {selectedReview?.employeeReview ? "Update Your Review" : "Submit Your Review"}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                Task: {selectedReview?.taskId?.title || "N/A"}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>HR Description:</strong> {selectedReview?.description || "N/A"}
              </Typography>
              <TextField
                label="Your Review"
                multiline
                rows={6}
                fullWidth
                value={employeeReviewText}
                onChange={(e) => setEmployeeReviewText(e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  handleSubmitEmployeeReview(selectedReview._id);
                  setOpen(false);
                }}
                variant="contained"
                disabled={!employeeReviewText.trim()}
              >
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </EmployeeLayout>
      )}
    </>
  );
};

export default TaskReviewManagement;