import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { useRouter } from "next/router";
import {
  Container,
  Grid,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    managerDetails: { department: "", team: [] },
    employeeDetails: { department: "" }
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      const fetchData = async () => {
        await fetchDepartments();
        await fetchTeams();
        await fetchUsers();
      };
      fetchData();
    }
  }, [user, router]);

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

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/teams`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTeams(response.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const usersWithDetails = response.data.map((user) => {
        // For managers
        if (user.role === "manager" && user.managerDetails?.team) {
          const teamNames = user.managerDetails.team.map((teamId) => {
            const team = teams.find((t) => t._id === teamId);
            return team ? team.teamName : "N/A";
          });
          return {
            ...user,
            managerDetails: {
              ...user.managerDetails,
              team: teamNames,
            },
          };
        }
        // For employees
        if (user.role === "employee" && user.employeeDetails?.department) {
          const department = departments.find(d => d._id === user.employeeDetails.department);
          return {
            ...user,
            employeeDetails: {
              ...user.employeeDetails,
              departmentName: department ? department.departmentName : "N/A"
            }
          };
        }
        return user;
      });

      setUsers(usersWithDetails);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch users");
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/update/${selectedUser._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/create`;
    const method = isUpdate ? "put" : "post";

    try {
      // Prepare the user data based on role
      const userData = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      };

      // Add role-specific details
      if (newUser.role === "manager") {
        userData.managerDetails = {
          department: newUser.managerDetails.department,
          team: newUser.managerDetails.team
        };
      } else if (newUser.role === "employee") {
        userData.employeeDetails = {
          department: newUser.employeeDetails.department
        };
      }

      const response = await axios({
        method,
        url,
        data: userData,
        headers: { Authorization: `Bearer ${user.token}` },
      });

      fetchUsers();
      setNewUser({
        username: "",
        email: "",
        password: "",
        role: "",
        managerDetails: { department: "", team: [] },
        employeeDetails: { department: "" }
      });
      setOpen(false);
      setIsUpdate(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving user:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save user. Please check the input and try again.");
    }
  };

  const handleUpdateUser = (user) => {
    setNewUser({
      username: user.username,
      email: user.email,
      password: "", // Don't pre-fill password for security
      role: user.role,
      managerDetails: user.managerDetails || { department: "", team: [] },
      employeeDetails: user.employeeDetails || { department: "" }
    });
    setIsUpdate(true);
    setSelectedUser(user);
    setOpen(true);
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    try {
      if (!userToDelete) return;

      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/delete/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const updatedUsers = users.filter((usr) => usr._id !== userToDelete._id);
      setUsers(updatedUsers);
      setOpenDeleteDialog(false);
    } catch (err) {
      setError("Failed to delete user");
      setOpenDeleteDialog(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      role: value,
      managerDetails: value === "manager" ? { department: "", team: [] } : {},
      employeeDetails: value === "employee" ? { department: "" } : {}
    }));
  };

  if (loading) return <Typography variant="h6">Loading users...</Typography>;
  if (error) return <Typography variant="h6">{error}</Typography>;

  return (
    <HRLayout>
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textAlign: "center",
          color: "#15B2C0",
        }}
      >
        Users List
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpen(true)}
        style={{ marginBottom: "20px" }}
      >
        {isUpdate ? "Update User" : "Create User"}
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>User ID</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Details</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user._id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.role === "manager" && (
                    <>
                      <Typography variant="body2">
                        <strong>Department:</strong> {user.managerDetails.department?.departmentName || "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Team:</strong> {user.managerDetails.team ? user.managerDetails.team.join(", ") : "N/A"}
                      </Typography>
                    </>
                  )}
                  {user.role === "employee" && (
                    <Typography variant="body2">
                      <strong>Department:</strong> {user.employeeDetails?.departmentName || "N/A"}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleUpdateUser(user)}
                    >
                      <EditIcon />
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleOpenDeleteDialog(user)}
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{isUpdate ? "Update User" : "Create New User"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                name="username"
                value={newUser.username}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                name="email"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                name="password"
                value={newUser.password}
                onChange={handleInputChange}
                type="password"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newUser.role}
                  onChange={handleRoleChange}
                  label="Role"
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                </Select>
                <FormHelperText>Select user role</FormHelperText>
              </FormControl>
            </Grid>

            {/* Manager-specific fields */}
            {newUser.role === "manager" && (
              <>
                <Grid item xs={12}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="managerDetails.department"
                      value={newUser.managerDetails.department}
                      onChange={(e) =>
                        setNewUser((prevState) => ({
                          ...prevState,
                          managerDetails: { ...prevState.managerDetails, department: e.target.value },
                        }))
                      }
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>
                          {dept.departmentName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Teams</InputLabel>
                    <Select
                      name="managerDetails.team"
                      multiple
                      value={newUser.managerDetails.team || []}
                      onChange={(e) =>
                        setNewUser((prevState) => ({
                          ...prevState,
                          managerDetails: { ...prevState.managerDetails, team: e.target.value },
                        }))
                      }
                      renderValue={(selected) => {
                        const selectedTeams = teams.filter(t => selected.includes(t._id));
                        return selectedTeams.map(t => t.teamName).join(", ");
                      }}
                    >
                      {teams.map((team) => (
                        <MenuItem key={team._id} value={team._id}>
                          {team.teamName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Employee-specific fields */}
            {newUser.role === "employee" && (
              <Grid item xs={12}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="employeeDetails.department"
                    value={newUser.employeeDetails.department}
                    onChange={(e) =>
                      setNewUser((prevState) => ({
                        ...prevState,
                        employeeDetails: { ...prevState.employeeDetails, department: e.target.value },
                      }))
                    }
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept._id} value={dept._id}>
                        {dept.departmentName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveUser} color="primary">
            {isUpdate ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteUser} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </HRLayout>
  );
};

export default UserManagement;