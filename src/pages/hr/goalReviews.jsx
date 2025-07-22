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
  IconButton,
  TablePagination,
  Skeleton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HRLayout from "../../components/HRLayout";

const GoalReviewManagement = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [managers, setManagers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    managerId: "",
    teamId: "",
    goalId: "",
    dueDate: "",
    description: "",
    status: "Pending"
  });
  const [open, setOpen] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [touchedFields, setTouchedFields] = useState({
    description: false
  });
  const router = useRouter();

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [goalsWithReviews, setGoalsWithReviews] = useState(new Set());

  // Check if all required fields are filled
  const isFormValid = () => {
    return (
      newReview.managerId &&
      newReview.teamId &&
      newReview.goalId &&
      newReview.dueDate &&
      newReview.description.trim() !== ""
    );
  };

  // Check if description is empty and touched
  const isDescriptionError = () => {
    return touchedFields.description && newReview.description.trim() === "";
  };

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchReviews();
      fetchManagers();
    }
  }, [user, router]);

  // Track which goals already have reviews
  useEffect(() => {
    const goalsWithReviewsSet = new Set();
    reviews.forEach(review => {
      if (review.goalId?._id) {
        goalsWithReviewsSet.add(review.goalId._id);
      }
    });
    setGoalsWithReviews(goalsWithReviewsSet);
  }, [reviews]);

  // Fetch teams when manager changes
  useEffect(() => {
    const fetchTeamsIfNeeded = async () => {
      if (newReview.managerId) {
        await fetchManagerTeams(newReview.managerId);
      } else {
        setTeams([]);
        setNewReview(prev => ({
          ...prev,
          teamId: "",
          goalId: "",
        }));
      }
    };
  
    fetchTeamsIfNeeded();
  }, [newReview.managerId]);

  // Fetch goals when team changes
  useEffect(() => {
    if (newReview.teamId) {
      fetchTeamGoals(newReview.teamId);
    } else {
      setGoals([]);
      setNewReview(prev => ({ ...prev, goalId: "" }));
    }
  }, [newReview.teamId]);

  // Fetch all review cycles to the logged-in hr
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch review cycles");
      setLoading(false);
    }
  };

  // Fetch only managers
  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const managers = response.data.filter(user => user.role === "manager");
      setManagers(managers);
    } catch (err) {
      console.error("Error fetching managers:", err);
      setError("Failed to fetch managers");
    }
  };

  // Fetch teams for selected manager
  const fetchManagerTeams = async (managerId) => {
    try {
      const managerRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/fetch/${managerId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const managerDepartment = managerRes.data.managerDetails?.department;
      if (!managerDepartment) {
        setTeams([]);
        return;
      }
  
      const teamsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`,
        {
          params: {
            departmentId: managerDepartment
          },
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );  
      setTeams(teamsRes.data);
      setNewReview(prev => ({
        ...prev,
        teamId: "",
        goalId: ""
      }));
    } catch (err) {
      console.error("Failed to fetch manager teams:", err);
      setTeams([]);
    }
  };

  // Fetch goals for selected team
  const fetchTeamGoals = async (teamId) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/team/${teamId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
    } catch (err) {
      console.error("Failed to fetch team goals:", err);
      setGoals([]);
    }
  };

  // Get filtered goals - exclude goals that already have reviews (except when updating the current review)
  const getFilteredGoals = () => {
    return goals.filter(goal => {
      // If we're updating, include the current goal even if it has a review
      if (isUpdate && selectedReview?.goalId?._id === goal._id) {
        return true;
      }
      // Otherwise, only include goals that don't have reviews
      return !goalsWithReviews.has(goal._id);
    });
  };

  // Save or update a review cycle
  const handleSaveReview = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${selectedReview._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/create`;
    const method = isUpdate ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: {
          ...newReview,
          hrAdminId: user.id,
          status: "Pending"
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchReviews();
      resetForm();
    } catch (err) {
      setError("Failed to save review cycle");
    }
  };

  // Open the update dialog with selected review data
  const handleUpdateReview = (review) => {
    setNewReview({
      managerId: review.managerId?._id || "",
      teamId: review.teamId?._id || "",
      goalId: review.goalId?._id || "",
      dueDate: review.dueDate?.split("T")[0] || "",
      description: review.description || "",
      status: "Pending"
    });
    setIsUpdate(true);
    setSelectedReview(review);
    setOpen(true);
    setError(null);
    setTouchedFields({ description: false });
    
    if (review.managerId?._id) {
      fetchManagerTeams(review.managerId._id).then(() => {
        if (review.teamId?._id) {
          fetchTeamGoals(review.teamId._id);
        }
      });
    }
  };

  // View review details
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenViewDialog(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setOpenDeleteDialog(true);
  };

  // Delete a review cycle after confirmation
  const handleDeleteReview = async () => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${reviewToDelete}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchReviews();
    } catch (err) {
      setError("Failed to delete review cycle");
    } finally {
      setOpenDeleteDialog(false);
      setReviewToDelete(null);
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  // Handle description field blur
  const handleDescriptionBlur = () => {
    setTouchedFields({ ...touchedFields, description: true });
  };

  // Reset form and dialog state
  const resetForm = () => {
    setNewReview({
      managerId: "",
      teamId: "",
      goalId: "",
      dueDate: "",
      description: "",
      status: "Pending"
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedReview(null);
    setTeams([]);
    setGoals([]);
    setError(null);
    setTouchedFields({ description: false });
  };

  // Function to get styles for status cell
  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#ffcccb", color: "#000", borderRadius: "8px", padding: "4px" };
      case "Completed":
        return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "4px" };
      default:
        return {};
    }
  };

  // Handle page change for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change for pagination
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get minimum date for date picker (today's date)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Skeleton loading for table rows
  const renderLoadingSkeletons = () => {
    return Array.from({ length: rowsPerPage }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" /></TableCell>
        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
        <TableCell>
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex" }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </TableCell>
      </TableRow>
    ));
  };

  if (error && !open) return <Typography variant="h6">{error}</Typography>;

  return (
    <HRLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Goal Review Cycles
      </Typography>

      {/* Create Review Button - with skeleton when loading */}
      {loading ? (
        <Skeleton variant="rectangular" width={150} height={36} sx={{ mb: 2 }} />
      ) : (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setOpen(true)} 
          style={{ marginBottom: "20px" }}
        >
          Create Review Cycle
        </Button>
      )}

      {/* Reviews Table with Skeleton Loading */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Manager</strong></TableCell>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Goal</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderLoadingSkeletons()
            ) : (
              reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.managerId?.username || "N/A"}</TableCell>
                  <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                  <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                  <TableCell>{review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}</TableCell>
                  <TableCell>
                    <span style={getStatusStyle(review.status)}>{review.status}</span>
                  </TableCell>
                  <TableCell>
                    {review.description?.length > 50 
                      ? `${review.description.substring(0, 50)}...` 
                      : review.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                      {review.status === "Completed" ? (
                        <IconButton color="primary" onClick={() => handleViewReview(review)}>
                          <VisibilityIcon />
                        </IconButton>
                      ) : (
                        <IconButton color="primary" onClick={() => handleUpdateReview(review)}>
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton color="error" onClick={() => handleDeleteClick(review._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Skeleton variant="rectangular" width="100%" height={40} />
          </Box>
        ) : (
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={reviews.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </TableContainer>

      {/* Create or Update Review Dialog */}
      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Review Cycle" : "Create New Review Cycle"}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          {/* Manager Dropdown */}
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Manager *</InputLabel>
            <Select 
              name="managerId" 
              value={newReview.managerId} 
              onChange={handleInputChange}
              required
            >
              {managers.map((manager) => (
                <MenuItem key={manager._id} value={manager._id}>{manager.username}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Team Dropdown */}
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Team *</InputLabel>
            <Select 
              name="teamId" 
              value={newReview.teamId} 
              onChange={handleInputChange}
              disabled={!newReview.managerId}
              required
            >
              {teams.map((team) => (
                <MenuItem key={team._id} value={team._id}>{team.teamName}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Goal Dropdown - only shows goals without reviews (except when updating) */}
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Goal *</InputLabel>
            <Select 
              name="goalId" 
              value={newReview.goalId} 
              onChange={handleInputChange}
              disabled={!newReview.teamId}
              required
            >
              {getFilteredGoals().length > 0 ? (
                getFilteredGoals().map((goal) => (
                  <MenuItem key={goal._id} value={goal._id}>{goal.projectTitle}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>This team has no goals to review.</MenuItem>
              )}
            </Select>
            {getFilteredGoals().length === 0 && !isUpdate && (
              <Typography variant="caption" color="textSecondary">
                All goals for this team already have review cycles
              </Typography>
            )}
          </FormControl>

          {/* Due Date */}
          <TextField
            label="Due Date *"
            type="date"
            name="dueDate"
            fullWidth
            value={newReview.dueDate}
            onChange={handleInputChange}
            margin="dense"
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getMinDate()
            }}
            required
          />

          {/* Status Display (read-only) */}
          <TextField
            label="Status"
            name="status"
            fullWidth
            value="Pending"
            margin="dense"
            InputProps={{
              readOnly: true,
            }}
          />

          {/* Description - Mandatory */}
          <TextField
            label="Description *"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newReview.description}
            onChange={handleInputChange}
            onBlur={handleDescriptionBlur}
            margin="dense"
            error={isDescriptionError()}
            helperText={isDescriptionError() ? "Description is required" : ""}
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button 
            onClick={resetForm} 
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveReview} 
            color="primary"
            variant="contained"
            disabled={!isFormValid() || (getFilteredGoals().length === 0 && !isUpdate)}
          >
            {isUpdate ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Review Details Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" component="div">
              <strong>Manager:</strong> {selectedReview?.managerId?.username || "N/A"}
            </Typography>
            <Typography variant="h6" component="div">
              <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
            </Typography>
            <Typography variant="h6" component="div">
              <strong>Goal:</strong> {selectedReview?.goalId?.projectTitle || "N/A"}
            </Typography>
            <Typography variant="h6" component="div">
              <strong>Due Date:</strong> {selectedReview?.dueDate ? new Date(selectedReview.dueDate).toLocaleDateString() : "N/A"}
            </Typography>
            <Typography variant="h6" component="div">
              <strong>Status:</strong> <span style={getStatusStyle(selectedReview?.status)}>
                {selectedReview?.status || "N/A"}
              </span>
            </Typography>
            <Typography variant="h6" component="div">
              <strong>Description:</strong>
            </Typography>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography>
                {selectedReview?.description || "No description provided"}
              </Typography>
            </Paper>
            {selectedReview?.managerReview && (
              <>
                <Typography variant="h6" component="div">
                  <strong>Manager's Review:</strong>
                </Typography>
                <Paper elevation={3} sx={{ padding: 2 }}>
                  <Typography>
                    {selectedReview.managerReview}
                  </Typography>
                </Paper>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenViewDialog(false)} 
            color="primary"
            variant="contained"
        
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this review cycle permanently?</Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            color="primary"
            variant="contained"
            
          >
            No, Keep It
          </Button>
          <Button 
            onClick={handleDeleteReview} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
};

export default GoalReviewManagement;