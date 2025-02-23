import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  FormControlLabel,
  Switch,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Fade,
  Paper,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachMoney as MoneyIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const expenseCategories = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Others',
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [memberData, setMemberData] = useState({
    name: '',
    isEarning: false,
    salary: 0,
  });
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: '',
  });
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editMemberData, setEditMemberData] = useState({
    id: '',
    name: '',
    isEarning: false,
    salary: 0,
  });
  const [selectedMemberForExpenses, setSelectedMemberForExpenses] = useState(null);
  const [openExpenseViewDialog, setOpenExpenseViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    fetchFamilyDetails();
  }, []);

  const fetchFamilyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const familyData = JSON.parse(localStorage.getItem('family'));
      
      if (!token || !familyData) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/family/${familyData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFamily(response.data);
    } catch (error) {
      toast.error('Error fetching family details');
      navigate('/login');
    }
  };

  const handleAddMember = async () => {
    try {
      if (!memberData.name) {
        toast.error('Member name is required');
        return;
      }

      // Check for duplicate names (case-insensitive)
      const isDuplicateName = family.members.some(
        member => member.name.toLowerCase() === memberData.name.toLowerCase()
      );

      if (isDuplicateName) {
        toast.error('A member with this name already exists');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/family/${family.id}/members`,
        memberData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Member added successfully!');
      setOpenDialog(false);
      setMemberData({ name: '', isEarning: false, salary: 0 });
      fetchFamilyDetails();
    } catch (error) {
      toast.error('Error adding member');
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
        `http://localhost:5000/api/family/${family.id}/members/${selectedMember}/expenses`,
        expenseData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Expense added successfully!');
      setOpenExpenseDialog(false);
      setExpenseData({ description: '', amount: '', category: '' });
      fetchFamilyDetails();
    } catch (error) {
      toast.error('Error adding expense');
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const familyData = JSON.parse(localStorage.getItem('family'));
      
      const response = await axios.delete(
        `http://localhost:5000/api/family/${familyData.id}/members/${memberId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setFamily(response.data);
        setExpandedMember(null);
        setOpenDeleteDialog(false);
        setMemberToDelete(null);
        toast.success('Member deleted successfully!');
      } else {
        throw new Error('Failed to delete member');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Error deleting member. Please try again.');
      setOpenDeleteDialog(false);
      setMemberToDelete(null);
    }
  };

  const handleDeleteExpense = async (memberId, expenseId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/family/${family.id}/members/${memberId}/expenses/${expenseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Expense deleted successfully!');
      fetchFamilyDetails();
    } catch (error) {
      toast.error('Error deleting expense');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('family');
    navigate('/login');
  };

  const calculateBalance = (member) => {
    if (!member.isEarning) return null;
    return member.salary - member.totalSpent;
  };

  const handleEditMember = (member) => {
    setEditMemberData({
      id: member._id,
      name: member.name,
      isEarning: member.isEarning,
      salary: member.salary,
    });
    setOpenEditDialog(true);
  };

  const handleUpdateMember = async () => {
    try {
      // Check for duplicate names when updating (excluding the current member)
      const isDuplicateName = family.members.some(
        member => member._id !== editMemberData.id && 
                 member.name.toLowerCase() === editMemberData.name.toLowerCase()
      );

      if (isDuplicateName) {
        toast.error('A member with this name already exists');
        return;
      }

      const token = localStorage.getItem('token');
      const familyData = JSON.parse(localStorage.getItem('family'));

      await axios.put(
        `http://localhost:5000/api/family/${familyData.id}/members/${editMemberData.id}`,
        {
          name: editMemberData.name,
          isEarning: editMemberData.isEarning,
          salary: editMemberData.salary,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Member updated successfully!');
      setOpenEditDialog(false);
      fetchFamilyDetails();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Error updating member');
    }
  };

  const handleViewExpenses = (member) => {
    setSelectedMemberForExpenses(member);
    setOpenExpenseViewDialog(true);
  };

  const initiateDeleteMember = (member) => {
    setMemberToDelete(member);
    setOpenDeleteDialog(true);
  };

  if (!family) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ 
        minHeight: '100vh', 
        pb: 4, 
        background: '#1a1a2e'
      }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{
            background: '#1a1a2e',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Toolbar>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                background: 'linear-gradient(45deg, #00BCD4, #9C27B0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold'
              }}
            >
              Family Name | {family.name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              sx={{
                mr: 2,
                background: 'linear-gradient(45deg, #00BCD4, #9C27B0)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #00ACC1, #8E24AA)'
                }
              }}
            >
              Add Member
            </Button>
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              sx={{ 
                color: '#fff',
                '&:hover': { color: '#00BCD4' }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" component="h1">
                  Family Members
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: 'primary.main',
                    background: 'linear-gradient(45deg, #00BCD4, #9C27B0)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <PersonIcon /> {family.members.length}
                </Typography>
              </Box>
              <Typography color="text.secondary" variant="h6">
                Total Income: ₹{family.totalIncome.toFixed(2)}
              </Typography>
              <Typography color="text.secondary" variant="h6">
                Total Expenses: ₹{family.totalExpenses.toFixed(2)}
              </Typography>
            </Stack>
          </Box>

          <Grid container spacing={3}>
            {family.members.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#16213e',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                        {member.name}
                      </Typography>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEditMember(member)}
                          sx={{ 
                            color: '#00BCD4',
                            '&:hover': { color: '#fff' }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => initiateDeleteMember(member)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': { 
                              color: '#d32f2f',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease-in-out'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Monthly Income:
                        <span style={{ float: 'right', color: '#4CAF50' }}>
                          ₹{member.salary.toFixed(2)}
                        </span>
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Monthly Budget:
                        <span style={{ float: 'right', color: '#00BCD4' }}>
                          ₹{(member.salary * 0.5).toFixed(2)}
                        </span>
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                        Spent:
                        <span style={{ float: 'right', color: '#f44336' }}>
                          ₹{member.totalSpent.toFixed(2)}
                        </span>
                      </Typography>
                      {member.isEarning && (
                        <>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                            Remaining:
                            <span style={{ 
                              float: 'right', 
                              color: calculateBalance(member) >= 0 ? '#4CAF50' : '#f44336',
                              fontWeight: 'bold'
                            }}>
                              ₹{Math.abs(calculateBalance(member)).toFixed(2)}
                            </span>
                          </Typography>
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Monthly Savings:
                            <span style={{ 
                              float: 'right', 
                              color: calculateBalance(member) >= member.salary * 0.2 ? '#4CAF50' : '#f44336',
                              fontWeight: 'bold'
                            }}>
                              {calculateBalance(member) >= member.salary * 0.2 ? (
                                `₹${calculateBalance(member).toFixed(2)} (${((calculateBalance(member) / member.salary) * 100).toFixed(1)}%)`
                              ) : (
                                <span style={{ color: '#f44336' }}>Below Target (20%)</span>
                              )}
                            </span>
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Typography 
                      sx={{ 
                        color: '#fff', 
                        textAlign: 'center',
                        background: member.isEarning ? 
                          'linear-gradient(45deg, #4CAF50, #8BC34A)' : 
                          'linear-gradient(45deg, #9E9E9E, #757575)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        width: 'fit-content'
                      }}
                    >
                      {member.isEarning ? 'Earning Member' : 'Non-earning Member'}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ 
                    justifyContent: 'space-between', 
                    p: 2, 
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#16213e'
                  }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedMember(member._id);
                        setOpenExpenseDialog(true);
                      }}
                      sx={{
                        background: 'linear-gradient(45deg, #00BCD4, #9C27B0)',
                        color: '#fff',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #00ACC1, #8E24AA)'
                        }
                      }}
                    >
                      Add Expense
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleViewExpenses(member)}
                      sx={{
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          borderColor: '#fff'
                        }
                      }}
                    >
                      View Expenses
                    </Button>
                  </CardActions>

                  <Collapse in={expandedMember === member._id} timeout="auto" unmountOnExit>
                    <Divider />
                    <CardContent sx={{ background: '#16213e' }}>
                      <Typography variant="h6" gutterBottom>
                        Expenses History
                      </Typography>
                      {member.expenses.length === 0 ? (
                        <Typography color="text.secondary">
                          No expenses recorded
                        </Typography>
                      ) : (
                        <Stack spacing={2}>
                          {member.expenses.map((expense) => (
                            <Paper
                              key={expense._id}
                              elevation={2}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                position: 'relative',
                                background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)'
                              }}
                            >
                              <Typography variant="subtitle1" sx={{ color: 'primary.light' }}>
                                {expense.description}
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                Amount: ${expense.amount.toFixed(2)}
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                Category: {expense.category}
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                Date: {new Date(expense.date).toLocaleDateString()}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                onClick={() => handleDeleteExpense(member._id, expense._id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Add Member Dialog */}
          <Dialog 
            open={openDialog} 
            onClose={() => setOpenDialog(false)}
            TransitionComponent={Fade}
            transitionDuration={300}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                backgroundColor: '#16213e',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <DialogTitle>Add Family Member</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Member Name"
                fullWidth
                value={memberData.name}
                onChange={(e) =>
                  setMemberData({ ...memberData, name: e.target.value })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={memberData.isEarning}
                    onChange={(e) =>
                      setMemberData({ ...memberData, isEarning: e.target.checked })
                    }
                  />
                }
                label="Is Earning Member?"
              />
              {memberData.isEarning && (
                <TextField
                  margin="dense"
                  label="Monthly Salary"
                  type="number"
                  fullWidth
                  value={memberData.salary}
                  onChange={(e) =>
                    setMemberData({
                      ...memberData,
                      salary: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button onClick={handleAddMember} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Expense Dialog */}
          <Dialog 
            open={openExpenseDialog} 
            onClose={() => setOpenExpenseDialog(false)}
            TransitionComponent={Fade}
            transitionDuration={300}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                backgroundColor: '#16213e',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          >
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
                  {expenseCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenExpenseDialog(false)}>Cancel</Button>
              <Button onClick={handleAddExpense} variant="contained">
                Add
              </Button>
            </DialogActions>
          </Dialog>

          {/* Add Edit Member Dialog */}
          <Dialog 
            open={openEditDialog} 
            onClose={() => setOpenEditDialog(false)}
            TransitionComponent={Fade}
            transitionDuration={300}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                backgroundColor: '#16213e',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <DialogTitle>Edit Family Member</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Member Name"
                fullWidth
                value={editMemberData.name}
                onChange={(e) =>
                  setEditMemberData({ ...editMemberData, name: e.target.value })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editMemberData.isEarning}
                    onChange={(e) =>
                      setEditMemberData({ ...editMemberData, isEarning: e.target.checked })
                    }
                  />
                }
                label="Is Earning Member?"
              />
              {editMemberData.isEarning && (
                <TextField
                  margin="dense"
                  label="Monthly Salary"
                  type="number"
                  fullWidth
                  value={editMemberData.salary}
                  onChange={(e) =>
                    setEditMemberData({
                      ...editMemberData,
                      salary: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
              <Button onClick={handleUpdateMember} variant="contained">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>

          {/* Expense View Dialog */}
          <Dialog 
            open={openExpenseViewDialog} 
            onClose={() => {
              setOpenExpenseViewDialog(false);
              setSelectedMemberForExpenses(null);
            }}
            TransitionComponent={Fade}
            transitionDuration={300}
            maxWidth="md"
            fullWidth
            PaperProps={{
              style: {
                backgroundColor: '#16213e',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <PersonIcon sx={{ color: 'primary.main' }} />
              {selectedMemberForExpenses?.name}'s Expenses
            </DialogTitle>
            <DialogContent>
              {selectedMemberForExpenses?.expenses.length === 0 ? (
                <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                  No expenses recorded
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {selectedMemberForExpenses?.expenses.map((expense) => (
                    <Paper
                      key={expense._id}
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        position: 'relative',
                        background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            color: 'primary.light',
                            fontWeight: 'bold',
                            minWidth: '200px'
                          }}
                        >
                          {expense.description}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 3,
                          flex: 1,
                          justifyContent: 'space-between'
                        }}>
                          <Typography 
                            sx={{ 
                              color: '#4CAF50',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              fontWeight: 'medium'
                            }}
                          >
                            <MoneyIcon fontSize="small" />
                            ₹{expense.amount.toFixed(2)}
                          </Typography>
                          
                          <Typography 
                            sx={{ 
                              color: '#00BCD4',
                              background: 'rgba(0, 188, 212, 0.1)',
                              padding: '4px 12px',
                              borderRadius: '16px',
                              fontWeight: 'medium'
                            }}
                          >
                            {expense.category}
                          </Typography>
                          
                          <Typography 
                            sx={{ 
                              color: 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            {new Date(expense.date).toLocaleDateString()}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() => {
                              handleDeleteExpense(selectedMemberForExpenses._id, expense._id);
                              setOpenExpenseViewDialog(false);
                            }}
                            sx={{ 
                              color: '#f44336',
                              '&:hover': {
                                color: '#d32f2f',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Button 
                onClick={() => setOpenExpenseViewDialog(false)}
                variant="outlined"
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'text.secondary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog
            open={openDeleteDialog}
            onClose={() => {
              setOpenDeleteDialog(false);
              setMemberToDelete(null);
            }}
            TransitionComponent={Fade}
            transitionDuration={300}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              style: {
                backgroundColor: '#16213e',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <DialogTitle sx={{ color: '#f44336' }}>Delete Member</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete {memberToDelete?.name}? This action cannot be undone.
              </Typography>
              {memberToDelete?.expenses.length > 0 && (
                <Typography sx={{ mt: 2, color: 'warning.main' }}>
                  Warning: This member has {memberToDelete.expenses.length} recorded expenses that will also be deleted.
                </Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setMemberToDelete(null);
                }}
                sx={{ color: 'text.secondary' }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteMember(memberToDelete?._id)}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Fade>
  );
};

export default Dashboard;