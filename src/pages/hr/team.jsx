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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Pagination,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  FormHelperText,
  Skeleton,
  CircularProgress,
  Avatar,
  Fade,
  styled,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ApartmentIcon from "@mui/icons-material/Apartment";
import GroupIcon from '@mui/icons-material/Group';
import BusinessIcon from '@mui/icons-material/Business';
import HRLayout from "../../components/HRLayout";

// Styled components for enhanced UI
const StyledCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(45deg, #0c4672, #00bcd4)",
  color: "white",
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
}));

// Utility function for minimum delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const withMinimumDelay = async (fn, minDelay = 1000) => {
  const startTime = Date.now();
  const result = await fn();
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(minDelay - elapsed, 0);
  await delay(remaining);
  return result;
};

// TeamCard component with improved UI
const TeamCard = ({ team, onEdit, onDelete, actionLoading }) => {
  // Generate initials for member avatars (e.g., first letters of username)
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const memberCount = team.members.length;

  return (
    <Card
      elevation={6}
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease",
        "&:hover": {
          transform: "scale(1.04)",
          boxShadow: 8,
          cursor: "pointer",
          bgcolor: "background.paper",
        },
      }}
      onClick={() => onEdit(team)}
      tabIndex={0}
      role="button"
      aria-label={`View or Edit team: ${team.teamName}`}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom noWrap>
          {team.teamName}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <BusinessIcon color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {team.departmentId?.departmentName || "No Department"}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
          <GroupIcon color="action" />
          <Typography variant="body2" color="text.secondary">
            {memberCount} Member{memberCount !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Avatars for members */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
          {team.members.slice(0, 5).map((member) => (
            <Tooltip key={member._id} title={member.username} arrow>
              <Avatar
                sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "primary.main" }}
                alt={member.username}
                aria-label={`Team member: ${member.username}`}
              >
                {getInitials(member.username)}
              </Avatar>
            </Tooltip>
          ))}
          {memberCount > 5 && (
            <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: "grey.500" }}>
              +{memberCount - 5}
            </Avatar>
          )}
        </Box>
      </CardContent>

      {/* Action buttons */}
      <CardActions
        sx={{ justifyContent: "flex-end", pt: 0, px: 2, pb: 1 }}
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking buttons
      >
        <Tooltip title="Edit Team">
          <span>
            <Button
              variant="outlined"
              startIcon={actionLoading ? <CircularProgress size={16} /> : <EditIcon />}
              onClick={() => onEdit(team)}
              disabled={actionLoading}
              size="small"
            >
              Edit
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Delete Team">
          <span>
            <Button
              variant="outlined"
              color="error"
              startIcon={actionLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
              onClick={() => onDelete(team)}
              disabled={actionLoading}
              sx={{ ml: 1 }}
              size="small"
            >
              Delete
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

const TeamManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    members: [],
    departmentId: "",
  });
  const [formErrors, setFormErrors] = useState({
    teamName: "",
    departmentId: "",
    members: "",
  });
  // Add state for department filter dropdown
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  // Filtered teams based on department filter
  const filteredTeams = filterDepartmentId
    ? teams.filter((team) => team.departmentId?._id === filterDepartmentId)
    : teams;

  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(6);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchInitialData();
    }
  }, [user, router]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await withMinimumDelay(async () => {
        await Promise.all([fetchTeams(), fetchEmployees(), fetchDepartments()]);
      });
    } catch (err) {
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  // Pagination based on filteredTeams now
  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstTeam, indexOfLastTeam);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTeams(response.data);
    } catch (err) {
      setError("Failed to fetch teams");
      throw err;
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const employees = response.data.filter((u) => u.role === "employee");
      setEmployees(employees);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      throw err;
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(response.data);
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      throw err;
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      teamName: "",
      departmentId: "",
      members: "",
    };

    if (!newTeam.teamName.trim()) {
      newErrors.teamName = "Team name is required";
      valid = false;
    }

    if (!newTeam.departmentId) {
      newErrors.departmentId = "Department is required";
      valid = false;
    }

    if (newTeam.members.length === 0) {
      newErrors.members = "At least one member is required";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSaveTeam = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    try {
      await withMinimumDelay(async () => {
        const url = isUpdate
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${selectedTeam._id}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/create`;

        await axios({
          method: isUpdate ? "put" : "post",
          url,
          data: {
            ...newTeam,
            createdBy: user.id,
          },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage(isUpdate ? "Team updated successfully!" : "Team created successfully!");
        fetchTeams();
        resetForm();
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTeam = (team) => {
    setNewTeam({
      teamName: team.teamName,
      members: team.members.map((m) => m._id),
      departmentId: team.departmentId?._id || "",
    });
    setIsUpdate(true);
    setSelectedTeam(team);
    setOpen(true);
  };

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      setActionLoading(true);
      setDeleteDialogOpen(false);
      await withMinimumDelay(async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamToDelete._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSuccessMessage("Team deleted successfully!");
        fetchTeams();
      });
    } catch (err) {
      setError("Failed to delete team");
    } finally {
      setActionLoading(false);
      setTeamToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleMemberChange = (event) => {
    const { value } = event.target;
    setNewTeam({
      ...newTeam,
      members: typeof value === "string" ? value.split(",") : value,
    });
    setFormErrors({
      ...formErrors,
      members: "",
    });
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const resetForm = () => {
    setNewTeam({
      teamName: "",
      members: [],
      departmentId: "",
    });
    setFormErrors({
      teamName: "",
      departmentId: "",
      members: "",
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedTeam(null);
  };

  // Loading skeleton for team cards
  const renderLoadingSkeletons = () => {
    return Array.from({ length: teamsPerPage }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} key={index}>
        <Card sx={{ minHeight: 220, borderRadius: 3 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={40} />
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <Skeleton variant="circular" width={20} height={20} />
              <Skeleton variant="text" width="60%" sx={{ ml: 1 }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="text" width="40%" />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" width={60} height={24} />
                ))}
              </Box>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: "flex-end", px: 2 }}>
            <Skeleton variant="rounded" width={80} height={36} />
            <Skeleton variant="rounded" width={80} height={36} sx={{ ml: 1 }} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <HRLayout>
      <Fade in timeout={800}>
        <StyledCard>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 64,
                height: 64,
                mx: "auto",
                mb: 2,
              }}
            >
              <PeopleAltIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Team Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your organization's teams effectively
            </Typography>
          </CardContent>
        </StyledCard>
      </Fade>
      <Box sx={{ display: "flex", alignItems: "center", gap: 130, mb: 3 }}>
        <Button variant="contained" onClick={() => setOpen(true)} disabled={loading}>
          {isUpdate ? "Update Team" : "Create New Team"}
        </Button>

        {/* Department Filter Dropdown */}
        <FormControl sx={{ width: "300px" }} fullWidth>
          <InputLabel id="department-filter-label">Filter by Department</InputLabel>
          <Select
            labelId="department-filter-label"
            value={filterDepartmentId}
            label="Filter by Department"
            onChange={(e) => {
              setFilterDepartmentId(e.target.value);
              setCurrentPage(1);
            }}
          >
            <MenuItem value="">
              <em>All Departments</em>
            </MenuItem>
            {departments.map((department) => (
              <MenuItem key={department._id} value={department._id}>
                {department.departmentName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Team Cards View */}
      <Grid container spacing={3}>
        {loading
          ? renderLoadingSkeletons()
          : currentTeams.map((team) => (
              <Grid item xs={12} sm={6} md={4} key={team._id}>
                <TeamCard
                  team={team}
                  onEdit={handleUpdateTeam}
                  onDelete={handleDeleteClick}
                  actionLoading={actionLoading}
                />
              </Grid>
            ))}
      </Grid>

      {/* Pagination - Only show when not loading */}
      {!loading && (
        <Pagination
          count={Math.ceil(filteredTeams.length / teamsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{ display: "flex", justifyContent: "center", mt: 3 }}
        />
      )}

      {/* Team Form Dialog */}
      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Team" : "Create New Team"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Team Name"
            fullWidth
            value={newTeam.teamName}
            onChange={(e) => {
              setNewTeam({ ...newTeam, teamName: e.target.value });
              setFormErrors({ ...formErrors, teamName: "" });
            }}
            margin="normal"
            required
            error={!!formErrors.teamName}
            helperText={formErrors.teamName}
            disabled={actionLoading}
          />

          <FormControl fullWidth margin="normal" error={!!formErrors.departmentId} disabled={actionLoading}>
            <InputLabel>Department</InputLabel>
            <Select
              value={newTeam.departmentId}
              onChange={(e) => {
                setNewTeam({ ...newTeam, departmentId: e.target.value });
                setFormErrors({ ...formErrors, departmentId: "" });
              }}
              label="Department"
            >
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.departmentName}
                </MenuItem>
              ))}
            </Select>
            {formErrors.departmentId && <FormHelperText>{formErrors.departmentId}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth margin="normal" error={!!formErrors.members} disabled={actionLoading}>
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={newTeam.members}
              onChange={(e) => {
                const { value } = e.target;
                setNewTeam({
                  ...newTeam,
                  members: typeof value === "string" ? value.split(",") : value,
                });
                setFormErrors({ ...formErrors, members: "" });
              }}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = employees.find((e) => e._id === value);
                    return <Chip key={value} label={member?.username || value} />;
                  })}
                </Box>
              )}
            >
              {employees
                .filter(
                  (employee) =>
                    employee.employeeDetails?.department === newTeam.departmentId ||
                    (typeof employee.employeeDetails?.department === "object" &&
                      employee.employeeDetails?.department?._id === newTeam.departmentId)
                )
                .map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.username} ({employee.email})
                  </MenuItem>
                ))}
            </Select>
            {formErrors.members && <FormHelperText>{formErrors.members}</FormHelperText>}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleSaveTeam} variant="contained" disabled={actionLoading}>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the team "{teamToDelete?.teamName}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteTeam} color="error" disabled={actionLoading}>
            {actionLoading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success and Error Notifications */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </HRLayout>
  );
};

export default TeamManagement;
