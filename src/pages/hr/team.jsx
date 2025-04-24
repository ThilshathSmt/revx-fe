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
  Card, CardContent, CardActions
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ApartmentIcon from '@mui/icons-material/Apartment';

const TeamManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTeam, setNewTeam] = useState({
    teamName: "",
    members: [],
    departmentId: ""
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(9);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchTeams();
      fetchEmployees();
      fetchDepartments();
    }
  }, [user, router]);


  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = teams.slice(indexOfFirstTeam, indexOfLastTeam);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTeams(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch teams");
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const employees = response.data.filter(u => u.role === 'employee');
      setEmployees(employees);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
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
    }
  };

  const handleSaveTeam = async () => {
    if (!newTeam.teamName.trim()) {
      setError("Team name is required");
      return;
    }

    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${selectedTeam._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/create`;

    try {
      await axios({
        method: isUpdate ? "put" : "post",
        url,
        data: {
          ...newTeam,
          createdBy: user.id
        },
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchTeams();
      resetForm();
    } catch (err) {
      setError("Failed to save team");
    }
  };

  const handleUpdateTeam = (team) => {
    setNewTeam({
      teamName: team.teamName,
      members: team.members.map(m => m._id),
      departmentId: team.departmentId?._id || ""
    });
    setIsUpdate(true);
    setSelectedTeam(team);
    setOpen(true);
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchTeams();
    } catch (err) {
      setError("Failed to delete team");
    }
  };

  const handleMemberChange = (event) => {
    const { value } = event.target;
    setNewTeam({
      ...newTeam,
      members: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const resetForm = () => {
    setNewTeam({
      teamName: "",
      members: [],
      departmentId: ""
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedTeam(null);
  };

  if (loading) return <Typography>Loading teams...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <HRLayout>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Team Management
      </Typography>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 3 }}>
        {isUpdate ? "Update Team" : "Create New Team"}
      </Button>

      {/* Team Cards View */}
      <Grid container spacing={3}>
        {currentTeams.map((team) => (
          <Grid item xs={12} sm={6} md={4} key={team._id}>
            <Card
              sx={{
                minHeight: 220,
                borderRadius: 3,
                boxShadow: 3,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: 6,
                  cursor: "pointer",
                  backgroundColor:"#E8F9FF"
                },
              }}
            >

              <CardContent>
                <Typography variant="h6" gutterBottom>{team.teamName}</Typography>
                <Typography variant="body2" color="textSecondary" textAlign={"center"} gutterBottom>
                  <ApartmentIcon sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Department: {team.departmentId?.departmentName || "N/A"}
                </Typography>
                <br />
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <PeopleAltIcon /> 
                  {team.members.map((member) => (
                    <Chip key={member._id} label={member.username} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", px: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleUpdateTeam(team)}
                  startIcon={<EditIcon />}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleDeleteTeam(team._id)}
                  startIcon={<DeleteIcon />}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>


      {/* Pagination */}
      <Pagination
        count={Math.ceil(teams.length / teamsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
      />

      <Dialog open={open} onClose={resetForm} fullWidth maxWidth="md">
        <DialogTitle>{isUpdate ? "Update Team" : "Create New Team"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Team Name"
            fullWidth
            value={newTeam.teamName}
            onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
              value={newTeam.departmentId}
              onChange={(e) => setNewTeam({ ...newTeam, departmentId: e.target.value })}
              label="Department"
            >
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.departmentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Team Members</InputLabel>
            <Select
              multiple
              value={newTeam.members}
              onChange={handleMemberChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = employees.find(e => e._id === value);
                    return <Chip key={value} label={member?.username || value} />;
                  })}
                </Box>
              )}
            >
              {employees.map((employee) => (
                <MenuItem key={employee._id} value={employee._id}>
                  {employee.username} ({employee.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button onClick={handleSaveTeam} variant="contained">
            {isUpdate ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
};

export default TeamManagement;
