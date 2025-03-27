import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { getUsers, updateUser, deleteUser } from '../services/api';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(page);
      setUsers(response.data);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('Error fetching users:', error);
      if ((error as any)?.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleEditUser = async (formData: Partial<User>) => {
    if (!editUser) return;
    try {
      await updateUser(editUser.id, formData);
      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4">Users List</Typography>
        <Button variant="outlined" color="secondary" onClick={() => logout()}>
          Logout
        </Button>
      </Box>
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={user.avatar}
                alt={`${user.first_name} ${user.last_name}`}
              />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {user.first_name} {user.last_name}
                </Typography>
                <Typography color="textSecondary">{user.email}</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <IconButton color="primary" onClick={() => setEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteUser(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Edit User</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleEditUser({
              first_name: formData.get('first_name') as string,
              last_name: formData.get('last_name') as string,
              email: formData.get('email') as string,
            });
          }}
        >
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="first_name"
              label="First Name"
              fullWidth
              defaultValue={editUser?.first_name}
            />
            <TextField
              margin="dense"
              name="last_name"
              label="Last Name"
              fullWidth
              defaultValue={editUser?.last_name}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              defaultValue={editUser?.email}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default UsersList; 