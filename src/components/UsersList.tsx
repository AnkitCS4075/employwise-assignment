import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  InputAdornment,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { getUsers, updateUser, deleteUser } from '../services/api';
import { User } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ITEMS_PER_PAGE = 6;

const UsersList: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch first page to get total pages
      const firstPageResponse = await getUsers(1);
      const totalPages = firstPageResponse.total_pages;
      
      // Fetch all pages in parallel
      const pagePromises = Array.from({ length: totalPages }, (_, i) => 
        getUsers(i + 1)
      );
      
      const responses = await Promise.all(pagePromises);
      const allUsersData = responses.flatMap(response => response.data);
      
      setAllUsers(allUsersData);
      setFilteredUsers(allUsersData);
      setTotalPages(Math.ceil(allUsersData.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Error fetching users:', error);
      if ((error as any)?.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  // Only fetch users on initial mount
  useEffect(() => {
    if (allUsers.length === 0) {
      fetchAllUsers();
    }
  }, [fetchAllUsers, allUsers.length]);

  // Filter users based on search query
  useEffect(() => {
    const filtered = allUsers.filter(user => {
      const searchLower = searchQuery.toLowerCase();
      return (
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setPage(1); // Reset to first page when search changes
  }, [searchQuery, allUsers]);

  // Update displayed users based on current page
  useEffect(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [page, filteredUsers]);

  // Handle edit user with route
  const handleEditClick = (user: User) => {
    navigate(`/users/${user.id}/edit`);
  };

  // Handle edit user form submission
  const handleEditUser = async (formData: Partial<User>) => {
    if (!editUser) return;
    try {
      // Call the API to update the user
      const updatedUser = await updateUser(editUser.id, formData);
      
      // Update the local state with the response from the API
      const updatedUsers = allUsers.map(user => 
        user.id === editUser.id 
          ? { ...user, ...updatedUser }
          : user
      );
      
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setEditUser(null);
      toast.success('User updated successfully!');
      navigate('/users');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    try {
      await deleteUser(userId);
      const updatedUsers = allUsers.filter(user => user.id !== userId);
      setAllUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      toast.success('User deleted successfully!');
      if (id === userId.toString()) {
        navigate('/users');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setEditUser(null);
    navigate('/users');
  };

  // Effect to handle edit route
  useEffect(() => {
    if (id) {
      const userToEdit = allUsers.find(user => user.id === parseInt(id));
      if (userToEdit) {
        setEditUser(userToEdit);
      } else {
        navigate('/users');
      }
    }
  }, [id, allUsers, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafc' }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)' }}>
        <Toolbar>
          <PersonIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            User Management
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => logout()}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            background: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, textAlign: 'right' }}
          >
            {filteredUsers.length} users found
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {displayedUsers.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={user.avatar}
                  alt={`${user.first_name} ${user.last_name}`}
                  sx={{
                    objectFit: 'cover',
                    borderBottom: '2px solid',
                    borderColor: 'primary.main',
                    backgroundColor: 'grey.100',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.first_name} ${user.last_name}`)}&background=random`;
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={user.avatar}
                      alt={`${user.first_name} ${user.last_name}`}
                      sx={{ width: 48, height: 48, mr: 2 }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.first_name} ${user.last_name}`)}&background=random`;
                      }}
                    />
                    <Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Chip
                        label={`ID: ${user.id}`}
                        size="small"
                        color="primary"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {user.email}
                  </Typography>
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(user)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          color: 'white',
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'error.light',
                          color: 'white',
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredUsers.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 8,
            }}
          >
            <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search query
            </Typography>
          </Box>
        )}

        {filteredUsers.length > 0 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              size={isMobile ? 'small' : 'large'}
              sx={{
                '& .MuiPaginationItem-root': {
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>

      <Dialog
        open={!!editUser}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          color: 'white',
        }}>
          Edit User
        </DialogTitle>
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
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              autoFocus
              margin="dense"
              name="first_name"
              label="First Name"
              fullWidth
              defaultValue={editUser?.first_name}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              name="last_name"
              label="Last Name"
              fullWidth
              defaultValue={editUser?.last_name}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              defaultValue={editUser?.email}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleDialogClose} variant="outlined">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                },
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UsersList; 