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
  Tabs,
  Tab,
  Alert,
  Snackbar,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from "@mui/material";
import {
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingActionsIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Feedback as FeedbackIcon
} from "@mui/icons-material";
import EmployeeLayout from "../../components/EmployeeLayout";

const EmployeeSelfAssessment = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [submittedAssessments, setSubmittedAssessments] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [expandedAssessment, setExpandedAssessment] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "employee") {
      router.push("/");
    } else {
      fetchAssessments();
    }
  }, [user, router]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/employee/mine`,
        {
          headers: { 
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      if (!Array.isArray(response.data.submittedAssessments)) {
        throw new Error("Invalid data format for submitted assessments");
      }

      // Fetch feedback for each assessment
      const assessmentsWithFeedback = await Promise.all(
        response.data.submittedAssessments.map(async (assessment) => {
          if (assessment.feedback) {
            try {
              const feedbackRes = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback/self-assessment/${assessment._id}`,
                {
                  headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              return { ...assessment, feedbackDetails: feedbackRes.data.feedback };
            } catch (err) {
              console.error("Error fetching feedback:", err);
              return assessment;
            }
          }
          return assessment;
        })
      );

      setSubmittedAssessments(assessmentsWithFeedback);
      setPendingTasks(response.data.pendingTasks || []);
      
    } catch (err) {
      console.error("Fetch error:", err);
      
      let errorMessage = "Failed to fetch your assessments";
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = err.code === "ECONNABORTED" 
          ? "Request timeout. Please try again." 
          : "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task) => {
    if (!task || !task._id) {
      showSnackbar("Invalid task data", "error");
      return;
    }

    setSelectedTask(task);
    const existingAssessment = submittedAssessments.find(
      a => a.taskId?._id === task._id
    );
    setComments(existingAssessment?.comments || "");
    setOpenDialog(true);
  };

  const handleExpandAssessment = (assessmentId) => {
    setExpandedAssessment(expandedAssessment === assessmentId ? null : assessmentId);
  };

  const validateAssessment = () => {
    if (!selectedTask || !selectedTask._id) {
      showSnackbar("No task selected", "error");
      return false;
    }

    if (!comments || comments.trim().length < 10) {
      showSnackbar("Please provide meaningful comments (at least 10 characters)", "error");
      return false;
    }

    return true;
  };

  const handleSubmitAssessment = async () => {
    if (!validateAssessment()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if this is an edit or new submission
      const existingAssessment = submittedAssessments.find(
        a => a.taskId?._id === selectedTask._id
      );
      const isEdit = !!existingAssessment;

      let response;
      if (isEdit) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/edit/${existingAssessment._id}`,
          { comments },
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/self-assessments/submit`,
          {
            taskId: selectedTask._id,
            comments
          },
          {
            headers: { 
              Authorization: `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
      }
      
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      await fetchAssessments();
      setOpenDialog(false);
      showSnackbar(
        isEdit ? "Assessment updated successfully" : "Assessment submitted successfully"
      );
    } catch (err) {
      console.error("Submission error:", err);
      
      let errorMessage = "Failed to process your assessment";
      
      if (err.response) {
        if (err.response.status === 500) {
          errorMessage = "This task already has an assessment. Please edit the existing one.";
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        errorMessage = err.code === "ECONNABORTED" 
          ? "Request timeout. Please try again." 
          : "Network error. Please check your connection.";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusChip = (hasFeedback) => {
    return hasFeedback ? (
      <Chip
        icon={<CheckCircleIcon fontSize="small" />}
        label="Feedback Received"
        color="success"
        size="small"
        variant="outlined"
      />
    ) : (
      <Chip
        icon={<PendingActionsIcon fontSize="small" />}
        label="Pending Review"
        color="warning"
        size="small"
        variant="outlined"
      />
    );
  };

  const renderLoadingSkeleton = () => (
    <Box sx={{ width: '100%', mt: 2 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton 
          key={i} 
          animation="wave" 
          height={56} 
          sx={{ mb: 1 }} 
        />
      ))}
    </Box>
  );

  const renderPendingTasks = () => {
    if (loading) return renderLoadingSkeleton();
    if (pendingTasks.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No pending tasks requiring assessment
          </Typography>
        </Box>
      );
    }
    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Task</strong></TableCell>
              <TableCell><strong>Project</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingTasks.map((task) => (
              <TableRow key={task._id}>
                <TableCell>{task.taskTitle || "N/A"}</TableCell>
                <TableCell>
                  {task.projectId?.projectTitle || "N/A"}
                </TableCell>
                <TableCell>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell>
                  <Chip label="Pending" color="info" size="small" />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => handleOpenDialog(task)}
                    startIcon={<EditIcon />}
                  >
                    Assess
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSubmittedAssessments = () => {
    if (loading) return renderLoadingSkeleton();
    if (submittedAssessments.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No submitted assessments yet
          </Typography>
        </Box>
      );
    }
    return (
      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Task</strong></TableCell>
                <TableCell><strong>Project</strong></TableCell>
                <TableCell><strong>Submitted</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submittedAssessments.map((assessment) => (
                <TableRow key={assessment._id}>
                  <TableCell>{assessment.taskId?.taskTitle || "N/A"}</TableCell>
                  <TableCell>
                    {assessment.taskId?.projectId?.projectTitle || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(assessment.feedbackDetails)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleExpandAssessment(assessment._id)}
                      startIcon={<FeedbackIcon />}
                    >
                      {expandedAssessment === assessment._id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Assessment Details Accordions */}
        {submittedAssessments.map((assessment) => (
          <Accordion 
            key={`details-${assessment._id}`}
            expanded={expandedAssessment === assessment._id}
            onChange={() => handleExpandAssessment(assessment._id)}
            sx={{ 
              mt: 1,
              borderLeft: expandedAssessment === assessment._id ? '3px solid #15B2C0' : 'none'
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {assessment.taskId?.taskTitle || "Task Details"}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Your Self-Assessment:
                </Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography>
                    {assessment.comments || "No comments provided"}
                  </Typography>
                </Paper>

                {assessment.feedbackDetails ? (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Manager's Feedback:
                    </Typography>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0f8ff', borderRadius: 1 }}>
                      <Typography paragraph>
                        {assessment.feedbackDetails.feedbackText}
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                        Last updated: {new Date(
                          assessment.feedbackDetails.updatedAt || 
                          assessment.feedbackDetails.createdAt
                        ).toLocaleString()}
                      </Typography>
                    </Paper>
                  </>
                ) : (
                  <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No feedback received yet from your manager.
                  </Typography>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  return (
    <EmployeeLayout>
      <Typography variant="h4" gutterBottom sx={{ 
        textAlign: "center", 
        color: "#15B2C0", 
        mb: 4,
        fontWeight: 'bold'
      }}>
        Task Self-Assessments
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchAssessments}
            >
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)} 
        centered
        sx={{ mb: 2 }}
      >
        <Tab 
          label="Pending" 
          icon={<PendingActionsIcon />} 
          iconPosition="start"
        />
        <Tab 
          label="Submitted" 
          icon={<CheckCircleIcon />} 
          iconPosition="start"
        />
      </Tabs>

      {tabValue === 0 ? renderPendingTasks() : renderSubmittedAssessments()}

      <Dialog 
        open={openDialog} 
        onClose={() => !isSubmitting && setOpenDialog(false)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: '#15B2C0', color: 'white' }}>
          {selectedTask?.taskTitle || "Task Assessment"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Project:</strong> {selectedTask?.projectId?.projectTitle || "N/A"}
            </Typography>
            {selectedTask?.dueDate && (
              <Typography variant="subtitle1" gutterBottom>
                <strong>Due Date:</strong> {new Date(selectedTask.dueDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>

          <TextField
            label="Your Self-Assessment"
            multiline
            rows={8}
            fullWidth
            variant="outlined"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Describe your work on this task, including:
- What you accomplished
- Challenges you faced
- Lessons learned
- Any additional comments..."
            InputProps={{
              style: { fontSize: '0.875rem' }
            }}
            sx={{ mt: 1 }}
            error={comments.length > 0 && comments.trim().length < 10}
            helperText={
              comments.length > 0 && comments.trim().length < 10
                ? "Comments should be at least 10 characters"
                : " "
            }
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitAssessment}
            color="primary"
            variant="contained"
            disabled={!comments || comments.trim().length < 10 || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Processing...' : 'Submit Assessment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleCloseSnackbar}>
              <CloseIcon fontSize="small" />
            </Button>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </EmployeeLayout>
  );
};

export default EmployeeSelfAssessment;