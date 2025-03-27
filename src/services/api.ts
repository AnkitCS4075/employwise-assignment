import axios from 'axios';
import { LoginCredentials, LoginResponse, User, UsersResponse } from '../types';

const BASE_URL = 'https://reqres.in/api';
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: LoginCredentials): Promise<string> => {
  const response = await api.post<LoginResponse>('/login', credentials);
  return response.data.token;
};

export const getUsers = async (page: number = 1): Promise<UsersResponse> => {
  const response = await api.get<UsersResponse>(`/users?page=${page}`);
  return response.data;
};

export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, userData);
  // Since Reqres is a mock API, we'll return a properly formatted user object
  const firstName = userData.first_name || response.data.first_name;
  const lastName = userData.last_name || response.data.last_name;
  const fullName = `${firstName} ${lastName}`.trim();
  
  return {
    id,
    email: userData.email || response.data.email,
    first_name: firstName,
    last_name: lastName,
    avatar: response.data.avatar || `${DEFAULT_AVATAR}${encodeURIComponent(fullName)}&background=random`,
  };
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
}; 