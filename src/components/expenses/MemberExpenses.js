import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton as MuiIconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Others',
];

const MemberExpenses = () => {
  const { familyId, memberId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [member, setMember] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: '',
  });

  useEffect(() => {
    fetchFamilyDetails();
  }, [familyId, memberId]);

  const fetchFamilyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://family-expense-tracker-backend.onrender.com/api/family/${familyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFamily(response.data);
      const currentMember = response.data.members.find(m => m.id === memberId);
      setMember(currentMember);
    } catch (error) {
      toast.error('Error fetching data');
      navigate('/dashboard');
    }
  };

  const handleAddExpense = async () => {
    try {
      if (!expenseData.description || !expenseData.amount || !expenseData.category) {
        toast.error('All fields are required');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        `https://family-expense-tracker-backend.onrender.com/api/family/${familyId}/members/${memberId}/expenses`,
        expenseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Expense added successfully!');
      setOpenDialog(false);
      setExpenseData({
        description: '',
        amount: '',
        category: '',
      });
      fetchFamilyDetails();
    } catch (error) {
      toast.error('Error adding expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `https://family-expense-tracker-backend.onrender.com/api/family/${familyId}/members/${memberId}/expenses/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Expense deleted successfully!');
      fetchFamilyDetails();
    } catch (error) {
      toast.error('Error deleting expense');
    }
  };

  if (!family || !member) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {member.name}'s Expenses
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Expenses
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Total Spent: ${member.totalSpent.toFixed(2)}
            </Typography>
            {member.isEarning && (
              <Typography color="text.secondary">
                Monthly Salary: ${member.salary.toFixed(2)}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Expense
          </Button>
        </Box>

        <List>
          {member.expenses.map((expense) => (
            <Card key={expense.id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={expense.description}
                  secondary={
                    <Box>
                      <Typography component="span" color="text.secondary">
                        Amount: ${expense.amount.toFixed(2)}
                      </Typography>
                      <br />
                      <Typography component="span" color="text.secondary">
                        Category: {expense.category}
                      </Typography>
                      <br />
                      <Typography component="span" color="text.secondary">
                        Date: {new Date(expense.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <MuiIconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <DeleteIcon />
                  </MuiIconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Card>
          ))}
          {member.expenses.length === 0 && (
            <Typography color="text.secondary" align="center">
              No expenses recorded yet
            </Typography>
          )}
        </List>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Description"
              fullWidth
              value={expenseData.description}
              onChange={(e) =>
                setExpenseData({ ...expenseData, description: e.target.value })
              }
            />
            <TextField
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              value={expenseData.amount}
              onChange={(e) =>
                setExpenseData({
                  ...expenseData,
                  amount: e.target.value,
                })
              }
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={expenseData.category}
                label="Category"
                onChange={(e) =>
                  setExpenseData({ ...expenseData, category: e.target.value })
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddExpense} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default MemberExpenses; 