import axios from 'axios';
import { LoginCredentials, LoginResponse, User, UsersResponse } from '../types';

const BASE_URL = 'https://reqres.in/api';

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
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
}; 