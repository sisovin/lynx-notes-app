import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import config from '../config';

// Define interfaces for our API responses
interface User {
  id: number;
  username?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

// Sample fix:
const API_BASE_URL = window.process && window.process.env && window.process.env.REACT_APP_API_URL || 'http://192.168.50.131:3001/api';

// Ensure the endpoint includes the protocol
const baseURL = API_BASE_URL.startsWith('http') ? API_BASE_URL : `http://${API_BASE_URL}`;

// Log the API configuration
console.log("API Service Configuration:", {
  baseURL: `${baseURL}`,
  timeout: config.api.timeout
});

// Initialize Axios with the correct configuration
const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  withCredentials: true, // This might be needed for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure to include the Bearer prefix in the authorization header
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log token for debugging (remove in production)
      console.log('Using token for request:', token.substring(0, 15) + '...');
    } else {
      console.log('No token found in localStorage');
    }
    
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, 
        config.data ? config.data : '');
    }
    
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, 
        response.data);
    }
    return response;
  },
  async (error: any) => {
    // Handle specific error cases
    if (error.response) {
      // Server responded with non-2xx status code
      console.log('Error response:', error.response.status, error.response.data);
      
      // Handle 401 or 400 Invalid token errors
      if (error.response.status === 401 || 
         (error.response.status === 400 && 
          error.response.data?.error === 'Invalid token.')) {
        console.log('Token is invalid or expired, clearing auth state');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page to force re-login
        window.location.href = '/';
      }
    } else if (error.request) {
      console.log('Network error:', error.request);
    } else {
      console.log('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export API helper functions
export const apiService = {
  // Auth endpoints  
  async login(email: string, password: string): Promise<AxiosResponse<LoginResponse>> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user || {}));
        console.log('Token stored in localStorage');
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  
  async signup(userData: { username: string; email: string; password: string }) {
    try {
      const response = await api.post<LoginResponse>('/auth/signup', userData);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user || {}));
        console.log('Token stored in localStorage');
      }
      
      return response;
   } catch (error) {
    console.error('Signup failed:', error);
    throw error;
   }
  },

    
  async logout(): Promise<AxiosResponse<{message: string}>> {
    try {
      const response = await api.post<{message: string}>('/auth/logout');
      
      // Clear local storage regardless of API response
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      return response;
    } catch (error) {
      // Still clear local storage on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  async getNotes(): Promise<AxiosResponse<Note[]>> {
    // Verify token exists before attempting request
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    return api.get<Note[]>('/notes');
  },
  
  async createNote(noteData: { title: string; content: string }): Promise<AxiosResponse<Note>> {
    return api.post<Note>('/notes', noteData);
  },
  
  async updateNote(id: number, noteData: { title?: string; content?: string }): Promise<AxiosResponse<Note>> {
    return api.put<Note>(`/notes/${id}`, noteData);
  },
  
  async deleteNote(id: number): Promise<AxiosResponse<{message: string}>> {
    return api.delete<{message: string}>(`/notes/${id}`);
  }
};

export default api;