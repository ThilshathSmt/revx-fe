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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

const TeamManagement = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTeam, setNewTeam] = useState({
    teamName: "",
  });
  const [formErrors, setFormErrors] = useState({}); // State for validation errors
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const router = useRouter();

  // Redirect non-HR users and fetch initial data
  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchTeams();
    }
  }, [user]);

  // Fetch all teams
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

  // Validate form fields
  const validateForm = () => {
    let errors = {};
    if (!newTeam.teamName.trim()) {
      errors.teamName = "Team name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save or update a team
  const handleSaveTeam = async () => {
    if (!validateForm()) return; // Prevent submission if validation fails

    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/${selectedTeam._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams/create`;

    try {
      await axios({
        method: isUpdate ? "put" : "post",
        url,
        data: newTeam,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchTeams();
      resetForm();
    } catch (err) {
      setError("Failed to save team");
    }
  };

  // Open the update dialog with selected team data
  const handleUpdateTeam = (team) => {
    setNewTeam({
      teamName: team.teamName,
    });
    setIsUpdate(true);
    setSelectedTeam(team);
    setOpen(true);
  };

  // Delete a team
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

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeam({ ...newTeam, [name]: value });

    // Clear validation errors when user starts typing
    setFormErrors({ ...formErrors, [name]: "" });
  };

  // Reset form and dialog state
  const resetForm = () => {
    setNewTeam({
      teamName: "",
    });
    setFormErrors({});
    setOpen(false);
    setIsUpdate(false);
    setSelectedTeam(null);
  };

 if (loading) return <Typography>Loading teams...</Typography>;
 if (error) return <Typography>{error}</Typography>;

 return (
   <HRLayout>
     <Typography variant="h3" sx={{ textAlign: "center", color: "#15B2C0" }}>
       Team Management
     </Typography>
     <Button variant="contained" onClick={() => setOpen(true)} style={{ marginBottom: "20px" }}>
       {isUpdate ? "Update Team" : "Create Team"}
     </Button>
     <TableContainer component={Paper}>
       <Table>
         <TableHead>
           <TableRow>
             <TableCell>Team Name</TableCell>
             <TableCell>Actions</TableCell>
           </TableRow>
         </TableHead>
         <TableBody>
           {teams.map((team) => (
             <TableRow key={team._id}>
               <TableCell>{team.teamName}</TableCell>
               <TableCell>
                 <Button onClick={() => handleUpdateTeam(team)}>
                   <EditIcon />
                 </Button>
                 <Button onClick={() => handleDeleteTeam(team._id)}>
                   <DeleteIcon />
                 </Button>
               </TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     </TableContainer>

     {/* Create/Update Dialog */}
     <Dialog open={open} onClose={resetForm}>
       <DialogTitle>{isUpdate ? "Update Team" : "Create New Team"}</DialogTitle>
       <DialogContent>

         {/* Team Name */}
         <TextField
           label="Team Name"
           name="teamName"
           fullWidth
           value={newTeam.teamName}
           onChange={handleInputChange}
           margin="dense"
           error={!!formErrors.teamName}
           helperText={formErrors.teamName}
         />
       </DialogContent>

       {/* Dialog Actions */}
       <DialogActions>
         <Button onClick={resetForm}>Cancel</Button>
         <Button onClick={handleSaveTeam}>{isUpdate ? "Update" : "Save"}</Button>
       </DialogActions>
     </Dialog>

   </HRLayout>
 );
};

export default TeamManagement;
