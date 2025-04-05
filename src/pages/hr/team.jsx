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
  Pagination
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

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
  const [teamsPerPage] = useState(7);
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Team Name</strong></TableCell>
              <TableCell><strong>Department</strong></TableCell>
              <TableCell><strong>Members</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTeams.map((team) => (
              <TableRow key={team._id}>
                <TableCell>{team.teamName}</TableCell>
                <TableCell>{team.departmentId?.departmentName || "N/A"}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {team.members.map(member => (
                      <Chip 
                        key={member._id} 
                        label={member.username} 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" onClick={() => handleUpdateTeam(team)}>
                      <EditIcon />
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleDeleteTeam(team._id)}
                    >
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            onChange={(e) => setNewTeam({...newTeam, teamName: e.target.value})}
            margin="normal"
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Department</InputLabel>
            <Select
              value={newTeam.departmentId}
              onChange={(e) => setNewTeam({...newTeam, departmentId: e.target.value})}
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
