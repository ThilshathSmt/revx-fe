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
  TextField,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ManagerLayout from "../../components/ManagerLayout";

const ManagerGoalReview = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [managerReviewText, setManagerReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "manager") {
      router.push("/");
    } else {
      fetchReviews();
    }
  }, [user, router]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReviews(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch your review cycles");
      setLoading(false);
    }
  };

  const handleOpenReview = (review) => {
    setSelectedReview(review);
    setManagerReviewText(review.managerReview || "");
    setOpenReviewDialog(true);
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setOpenViewDialog(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedReview || !managerReviewText) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goalReviews/${selectedReview._id}/review`,
        {
          managerId: user.id,
          managerReview: managerReviewText
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      // Preserve the existing team and goal data when updating the review
      const updatedReview = {
        ...response.data.goalReview,
        teamId: selectedReview.teamId, // Keep the original team data
        goalId: selectedReview.goalId  // Keep the original goal data
      };
      
      setReviews(reviews.map(review => 
        review._id === selectedReview._id ? updatedReview : review
      ));
      
      setOpenReviewDialog(false);
    } catch (err) {
      setError("Failed to submit your review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return { backgroundColor: "#ffcccb", color: "#000" };
      case "In Progress":
        return { backgroundColor: "#add8e6", color: "#000" };
      case "Completed":
        return { backgroundColor: "#90ee90", color: "#000" };
      default:
        return {};
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return (
    <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 4 }}>
      {error}
    </Typography>
  );

  return (
    <ManagerLayout>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", color: "#15B2C0", mb: 4 }}>
        Your Goal Review Assignments
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Team</strong></TableCell>
              <TableCell><strong>Goal</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>HR Instructions</strong></TableCell>
              <TableCell><strong>Submitted On</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>{review.teamId?.teamName || "N/A"}</TableCell>
                  <TableCell>{review.goalId?.projectTitle || "N/A"}</TableCell>
                  <TableCell>
                    {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={review.status} 
                      style={getStatusStyle(review.status)} 
                    />
                  </TableCell>
                  <TableCell>
                    {review.description?.length > 50
                      ? `${review.description.substring(0, 50)}...`
                      : review.description || "N/A"}
                  </TableCell>
                  <TableCell>
                    {review.status === 'Completed' ? (
                      <Tooltip title={new Date(review.submissionDate).toLocaleString()}>
                        <span>
                          {new Date(review.submissionDate).toLocaleDateString()}
                        </span>
                      </Tooltip>
                    ) : (
                      "Not submitted"
                    )}
                  </TableCell>
                  <TableCell>
                    {review.status === "Completed" ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleViewReview(review)}
                        startIcon={<VisibilityIcon />}
                      >
                        View
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenReview(review)}
                        startIcon={<EditIcon />}
                      >
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No review assignments found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Review Submission Dialog */}
      <Dialog 
        open={openReviewDialog} 
        onClose={() => setOpenReviewDialog(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          Submit Review for {selectedReview?.goalId?.projectTitle || "Goal"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            <strong>HR Instructions:</strong>
          </Typography>
          <Typography paragraph>
            {selectedReview?.description || "No specific instructions provided"}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            <strong>Due Date:</strong>{" "}
            {selectedReview?.dueDate
              ? new Date(selectedReview.dueDate).toLocaleDateString()
              : "N/A"}
          </Typography>

          <TextField
            label="Your Review"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            margin="normal"
            value={managerReviewText}
            onChange={(e) => setManagerReviewText(e.target.value)}
            placeholder="Describe the team's performance and goal achievement..."
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenReviewDialog(false)} 
            color="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            color="primary"
            variant="contained"
            disabled={!managerReviewText || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={24} /> Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Review Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>
          Review Details for {selectedReview?.goalId?.projectTitle || "Goal"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="subtitle1">
              <strong>Team:</strong> {selectedReview?.teamId?.teamName || "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Due Date:</strong>{" "}
              {selectedReview?.dueDate
                ? new Date(selectedReview.dueDate).toLocaleDateString()
                : "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Status:</strong>{" "}
              <Chip 
                label={selectedReview?.status || "N/A"} 
                style={getStatusStyle(selectedReview?.status)} 
              />
            </Typography>
            <Typography variant="subtitle1">
              <strong>Submitted On:</strong>{" "}
              {selectedReview?.submissionDate
                ? new Date(selectedReview.submissionDate).toLocaleString()
                : "N/A"}
            </Typography>
            <Typography variant="subtitle1">
              <strong>HR Instructions:</strong>
            </Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
              <Typography>
                {selectedReview?.description || "No instructions provided"}
              </Typography>
            </Paper>
            <Typography variant="subtitle1">
              <strong>Your Review:</strong>
            </Typography>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography>
                {selectedReview?.managerReview || "No review submitted"}
              </Typography>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenViewDialog(false)} 
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ManagerLayout>
  );
};

export default ManagerGoalReview;