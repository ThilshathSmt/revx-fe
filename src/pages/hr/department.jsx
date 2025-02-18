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
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HRLayout from "../../components/HRLayout";

const DepartmentManagement = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    departmentName: "",
    description: "",
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const router = useRouter();

  // Redirect non-HR users and fetch initial data
  useEffect(() => {
    if (!user || user.role !== "hr") {
      router.push("/");
    } else {
      fetchDepartments();
    }
  }, [user, router]);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setDepartments(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch departments");
      setLoading(false);
    }
  };

  // Save or update a department
  const handleSaveDepartment = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${selectedDepartment._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/create`;
    const method = isUpdate ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: newDepartment,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchDepartments();
      resetForm();
    } catch (err) {
      setError("Failed to save department");
    }
  };

  // Open the update dialog with selected department data
  const handleUpdateDepartment = (department) => {
    setNewDepartment({
      departmentName: department.departmentName,
      description: department.description || "",
    });
    setIsUpdate(true);
    setSelectedDepartment(department);
    setOpen(true);
  };

  // Delete a department
  const handleDeleteDepartment = async (departmentId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${departmentId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchDepartments(); // Refresh departments after deletion
    } catch (err) {
      setError("Failed to delete department");
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDepartment({ ...newDepartment, [name]: value });
  };

  // Reset form and dialog state
  const resetForm = () => {
    setNewDepartment({
      departmentName: "",
      description: "",
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedDepartment(null);
  };

  if (loading) return <Typography variant="h6">Loading departments...</Typography>;
  if (error) return <Typography variant="h6">{error}</Typography>;

  return (
    <HRLayout>
      <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
        Department Management
      </Typography>

      {/* Create or Update Department Button */}
      <Button variant="contained" color="primary" onClick={() => setOpen(true)} style={{ marginBottom: "20px" }}>
        {isUpdate ? "Update Department" : "Create Department"}
      </Button>

      {/* Departments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Department Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department._id}>
                <TableCell>{department.departmentName}</TableCell>
                <TableCell>{department.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    {/* Edit Button */}
                    <Button variant="outlined" color="primary" onClick={() => handleUpdateDepartment(department)}>
                      <EditIcon />
                    </Button>

                    {/* Delete Button */}
                    <Button variant="outlined" color="error" onClick={() => handleDeleteDepartment(department._id)}>
                      <DeleteIcon />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create or Update Department Dialog */}
      <Dialog open={open} onClose={resetForm}>
        <DialogTitle>{isUpdate ? "Update Department" : "Create New Department"}</DialogTitle>
        <DialogContent>

          {/* Department Name */}
          <TextField
            label="Department Name"
            name="departmentName"
            fullWidth
            value={newDepartment.departmentName}
            onChange={handleInputChange}
            margin="dense"
          />

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            value={newDepartment.description}
            onChange={handleInputChange}
            margin="dense"
          />
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions>
          <Button onClick={resetForm} color="primary">Cancel</Button>
          <Button onClick={handleSaveDepartment} color="primary">{isUpdate ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

    </HRLayout>
  );
};

export default DepartmentManagement;
