import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Pagination,
} from '@mui/material';

const UserManagement = () => {
  const [userForm, setUserForm] = useState({
    id: null,
    username: '',
    email: '',
    password: '',
    role: '',
    employeeDetails: {
      department: '',
      designation: '',
      joiningDate: '',
    },
    managerDetails: {
      department: '',
      team: '',
    },
    hrDetails: {
      assignedDepartments: '',
    },
  });

  const [users, setUsers] = useState([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  const fetchUsers = async (page = 1) => {
    try {
      const token = getAuthToken();
      if (token) {
        const response = await axios.get(`http://localhost:5001/api/user/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { page, limit: 10 }, // Adjust the limit if needed
        });

        setUsers(response.data.users); // Adjust based on your API response structure
        setTotalPages(response.data.totalPages); // Set total pages from the API response
      } else {
        console.warn('No token found. Authorization Header not set.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response && error.response.status === 401) {
        alert('Unauthorized. Please log in again.');
      } else {
        alert('Failed to fetch users');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRoleDetailsChange = (e) => {
    const { name, value } = e.target;
    const roleKey =
      userForm.role === 'employee'
        ? 'employeeDetails'
        : userForm.role === 'manager'
        ? 'managerDetails'
        : 'hrDetails';

    setUserForm((prevState) => ({
      ...prevState,
      [roleKey]: {
        ...prevState[roleKey],
        [name]: value,
      },
    }));
  };

  const handleSaveUser = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        let response;
        if (isEditingUser) {
          response = await axios.put(
            `http://localhost:5001/api/user/update/${userForm.id}`,
            userForm,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          response = await axios.post(
            'http://localhost:5001/api/user/create',
            userForm,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        alert(isEditingUser ? 'User updated successfully' : 'User created successfully');
        resetForm();
        fetchUsers(currentPage); // Re-fetch the users after save
      } else {
        console.warn('No token found. Cannot save user.');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save user';
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const token = getAuthToken();
      if (token) {
        await axios.delete(`http://localhost:5001/api/user/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('User deleted successfully');
        fetchUsers(currentPage); // Re-fetch the users after delete
      } else {
        console.warn('No token found. Cannot delete user.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      alert(errorMessage);
    }
  };

  const handleEditUser = (user) => {
    setUserForm(user);
    setIsCreatingUser(true);
    setIsEditingUser(true);
  };

  const resetForm = () => {
    setUserForm({
      id: null,
      username: '',
      email: '',
      password: '',
      role: '',
      employeeDetails: { department: '', designation: '', joiningDate: '' },
      managerDetails: { department: '', team: '' },
      hrDetails: { assignedDepartments: '' },
    });
    setIsCreatingUser(false);
    setIsEditingUser(false);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    fetchUsers(newPage);
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={2}>User Management</Typography>
      {!isCreatingUser ? (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>Users List</Typography>
            <Button variant="contained" color="primary" onClick={() => setIsCreatingUser(true)}>
              Create User
            </Button>
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="warning" size="small" onClick={() => handleEditUser(user)} sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteUser(user.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              sx={{ mt: 3 }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" mb={2}>{isEditingUser ? 'Edit User' : 'Create User'}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Username" name="username" value={userForm.username} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" name="email" value={userForm.email} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Password" type="password" name="password" value={userForm.password} onChange={handleInputChange} />
              </Grid>
              <Grid item xs={12}>
                <InputLabel>Role</InputLabel>
                <Select fullWidth name="role" value={userForm.role} onChange={handleInputChange}>
                  <MenuItem value="">Select Role</MenuItem>
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="hr">HR</MenuItem>
                </Select>
              </Grid>

              {userForm.role === 'employee' && (
                <>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Department" name="department" value={userForm.employeeDetails.department} onChange={handleRoleDetailsChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Designation" name="designation" value={userForm.employeeDetails.designation} onChange={handleRoleDetailsChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Joining Date" name="joiningDate" type="date" value={userForm.employeeDetails.joiningDate} onChange={handleRoleDetailsChange} />
                  </Grid>
                </>
              )}

              {userForm.role === 'manager' && (
                <>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Department" name="department" value={userForm.managerDetails.department} onChange={handleRoleDetailsChange} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Team" name="team" value={userForm.managerDetails.team} onChange={handleRoleDetailsChange} />
                  </Grid>
                </>
              )}

              {userForm.role === 'hr' && (
                <>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Assigned Departments" name="assignedDepartments" value={userForm.hrDetails.assignedDepartments} onChange={handleRoleDetailsChange} />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button variant="contained" color="primary" onClick={handleSaveUser}>
                  {isEditingUser ? 'Update' : 'Create'}
                </Button>
                <Button variant="outlined" color="secondary" onClick={resetForm} sx={{ ml: 2 }}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default UserManagement;
