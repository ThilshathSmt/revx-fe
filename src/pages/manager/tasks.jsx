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
  Box
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ManagerLayout from "../../components/ManagerLayout";

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTask, setNewTask] = useState({
    projectId: "",
    taskTitle: "",
    startDate: "",
    dueDate: "",
    status: "scheduled",
    employeeId: "",
    description: "",
    priority: "medium"
  });
  const [open, setOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const router = useRouter();

  // Redirect non-manager users and fetch initial data
  useEffect(() => {
    if (!user || user.role !== "manager") {
      router.push("/");
    } else {
      fetchTasks();
      fetchGoals();
      fetchEmployees();
    }
  }, [user, router]);

  // Fetch all tasks assigned to the logged-in manager
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  // Fetch all goals (projects)
  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/goals/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(response.data);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/all`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const employeeUsers = response.data.filter((user) => user.role === "employee");
      setEmployees(employeeUsers);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  // Save or update a task
  const handleSaveTask = async () => {
    const url = isUpdate
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${selectedTask._id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/create`;
    const method = isUpdate ? "put" : "post";

    try {
      await axios({
        method,
        url,
        data: newTask,
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchTasks();
      resetForm();
    } catch (err) {
      setError("Failed to save task");
    }
  };

  // Open the update dialog with selected task data
  const handleUpdateTask = (task) => {
    setNewTask({
      projectId: task.projectId?._id || "",
      taskTitle: task.taskTitle,
      startDate: task.startDate.split("T")[0],
      dueDate: task.dueDate.split("T")[0],
      status: task.status,
      employeeId: task.employeeId?._id || "",
      description: task.description || "",
      priority: task.priority || "medium"
    });
    setIsUpdate(true);
    setSelectedTask(task);
    setOpen(true);
  };

  // Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      fetchTasks(); // Refresh tasks after deletion
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

  // Reset form and dialog state
  const resetForm = () => {
    setNewTask({
      projectId: "",
      taskTitle: "",
      startDate: "",
      dueDate: "",
      status: "scheduled",
      employeeId: "",
      description: "",
      priority: "medium"
    });
    setOpen(false);
    setIsUpdate(false);
    setSelectedTask(null);
  };

   // Function to get styles for status cell
   const getStatusStyle = (status) => {
     switch (status) {
       case "scheduled":
         return { backgroundColor: "#d3d3d3", color: "#000", borderRadius: "8px", padding: "4px" }; // Light gray
       case "in-progress":
         return { backgroundColor: "#add8e6", color: "#000", borderRadius: "8px", padding: "4px" }; // Light blue
       case "completed":
         return { backgroundColor: "#90ee90", color: "#000", borderRadius: "8px", padding: "4px" }; // Light green
       default:
         return {};
     }
   };

   if (loading) return <Typography variant="h6">Loading tasks...</Typography>;
   if (error) return <Typography variant="h6">{error}</Typography>;

   return (
     <ManagerLayout>
       <Typography variant="h3" gutterBottom sx={{ textAlign: "center", color: "#15B2C0" }}>
         Task Management
       </Typography>

       {/* Create or Update Task Button */}
       <Button variant="contained" color="primary" onClick={() => setOpen(true)} style={{ marginBottom: "20px" }}>
         {isUpdate ? "Update Task" : "Create Task"}
       </Button>

       {/* Tasks Table */}
       <TableContainer component={Paper}>
         <Table>
           <TableHead>
             <TableRow>
               <TableCell><strong>Task Title</strong></TableCell>
               <TableCell><strong>Project</strong></TableCell>
               <TableCell><strong>Start Date</strong></TableCell>
               <TableCell><strong>Due Date</strong></TableCell>
               <TableCell><strong>Status</strong></TableCell>
               <TableCell><strong>Priority</strong></TableCell>
               <TableCell><strong>Employee</strong></TableCell>
               <TableCell><strong>Actions</strong></TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
             {tasks.map((task) => (
               <TableRow key={task._id}>
                 <TableCell>{task.taskTitle}</TableCell>
                 <TableCell>{task.projectId?.projectTitle || "N/A"}</TableCell>
                 <TableCell>{new Date(task.startDate).toLocaleDateString()}</TableCell>
                 <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>

                 {/* Status Cell with Conditional Styling */}
                 <TableCell>
                   <span style={getStatusStyle(task.status)}>{task.status}</span>
                 </TableCell>

                 <TableCell>{task.priority}</TableCell>
                 <TableCell>{task.employeeId?.username || "N/A"}</TableCell>
                 <TableCell>
                   <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                     {/* Edit Button */}
                     <Button variant="outlined" color="primary" onClick={() => handleUpdateTask(task)}>
                       <EditIcon />
                     </Button>

                     {/* Delete Button */}
                     <Button variant="outlined" color="error" onClick={() => handleDeleteTask(task._id)}>
                       <DeleteIcon />
                     </Button>
                   </Box>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </TableContainer>

       {/* Create or Update Task Dialog */}
       <Dialog open={open} onClose={resetForm}>
         <DialogTitle>{isUpdate ? "Update Task" : "Create New Task"}</DialogTitle>
         <DialogContent>

           {/* Task Title */}
           <TextField
             label="Task Title"
             name="taskTitle"
             fullWidth
             value={newTask.taskTitle}
             onChange={handleInputChange}
             margin="dense"
           />

           {/* Project Dropdown */}
           <FormControl fullWidth margin="dense">
             <InputLabel>Project</InputLabel>
             <Select name="projectId" value={newTask.projectId} onChange={handleInputChange}>
               {goals.map((goal) => (
                 <MenuItem key={goal._id} value={goal._id}>{goal.projectTitle}</MenuItem>
               ))}
             </Select>
           </FormControl>

           {/* Start Date */}
           <TextField
             label="Start Date"
             type="date"
             name="startDate"
             fullWidth
             value={newTask.startDate}
             onChange={handleInputChange}
             margin="dense"
           />

           {/* Due Date */}
           <TextField
             label="Due Date"
             type="date"
             name="dueDate"
             fullWidth
             value={newTask.dueDate}
             onChange={handleInputChange}
             margin="dense"
           />

           {/* Priority Dropdown */}
           <FormControl fullWidth margin="dense">
             <InputLabel>Priority</InputLabel>
             <Select name="priority" value={newTask.priority} onChange={handleInputChange}>
               {["low", "medium", "high"].map((priority) => (
                 <MenuItem key={priority} value={priority}>{priority}</MenuItem>
               ))}
             </Select>
           </FormControl>

           {/* Employee Dropdown */}
           <FormControl fullWidth margin="dense">
             <InputLabel>Employee</InputLabel>
             <Select name="employeeId" value={newTask.employeeId} onChange={handleInputChange}>
               {employees.map((employee) => (
                 <MenuItem key={employee._id} value={employee._id}>{employee.username}</MenuItem>
               ))}
             </Select>
           </FormControl>

           {/* Description */}
           <TextField
             label="Description"
             name="description"
             fullWidth
             multiline
             rows={4}
             value={newTask.description}
             onChange={handleInputChange}
             margin="dense"
           />
         </DialogContent>

         {/* Dialog Actions */}
         <DialogActions>
           <Button onClick={resetForm} color="primary">Cancel</Button>
           <Button onClick={handleSaveTask} color="primary">{isUpdate ? "Update" : "Save"}</Button>
         </DialogActions>
       </Dialog>

     </ManagerLayout>
   );
};

export default TaskManagement;
