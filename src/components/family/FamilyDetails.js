import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Switch,
  FormControlLabel,
  Box,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const FamilyDetails = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [memberData, setMemberData] = useState({
    name: '',
    isEarning: false,
    salary: 0,
  });

  useEffect(() => {
    fetchFamilyDetails();
  }, [familyId]);

  const fetchFamilyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/family/${familyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFamily(response.data);
    } catch (error) {
      toast.error('Error fetching family details');
    }
  };

  const handleAddMember = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/family/${familyId}/members`,
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

  const handleDeleteMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/family/${familyId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Member deleted successfully!');
      fetchFamilyDetails();
    } catch (error) {
      toast.error('Error deleting member');
    }
  };

  if (!family) {
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
            {family.name}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Family Members
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Total Income: ${family.totalIncome.toFixed(2)}
            </Typography>
            <Typography color="text.secondary">
              Total Expenses: ${family.totalExpenses.toFixed(2)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Member
          </Button>
        </Box>

        <Grid container spacing={3}>
          {family.members.map((member) => (
            <Grid item xs={12} sm={6} md={4} key={member._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography color="text.secondary">
                    Status: {member.isEarning ? 'Earning' : 'Non-earning'}
                  </Typography>
                  {member.isEarning && (
                    <Typography color="text.secondary">
                      Salary: ${member.salary.toFixed(2)}
                    </Typography>
                  )}
                  <Typography color="text.secondary">
                    Total Spent: ${member.totalSpent.toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/family/${familyId}/member/${member._id}`)}
                  >
                    View Expenses
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteMember(member._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
      </Container>
    </>
  );
};

export default FamilyDetails; 