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

// Add these methods to your apiService object:

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    name?: string;
  };
}

interface Note {
  id: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
}

// Get API base URL from environment or use fallback
const API_BASE_URL = window.process?.env?.REACT_APP_API_URL || 'http://192.168.50.131:3001/api';

// Ensure the endpoint includes the protocol
const baseURL = API_BASE_URL.startsWith('http') ? API_BASE_URL : `http://${API_BASE_URL}`;

// Log the API configuration
console.log("API Service Configuration:", {
  baseURL: baseURL,
  timeout: config.api?.timeout || 30000 // Increased default timeout
});

// Initialize Axios with the correct configuration
const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: config.api?.timeout || 30000, // Increased timeout for slow connections
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
    
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Extract endpoint from URL to provide context in the log message
    const url = response.config.url || '';
    const method = response.config.method?.toUpperCase() || 'GET';
    const endpoint = url.split('/').filter(Boolean).pop() || 'unknown';
    
    // Only log responses for GET /notes specifically as "Notes response:"
    if (method === 'GET' && url.includes('/notes') && !url.includes('/notes/')) {
      console.log(`Notes response:`, response.data);
    } else {
      // For other endpoints, use more specific messaging
      console.log(`API ${method} [${endpoint}]:`, response.data);
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

// Helper function to implement retry logic
async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3, 
  retryDelay = 2000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on network errors or timeouts
      if (error.code !== 'ECONNABORTED' && 
          !error.message?.includes('Network Error') &&
          !error.message?.includes('timeout')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        
        // Wait before next retry (with exponential backoff)
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
}

// Export API helper functions
export const apiService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  async signup(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/signup",
        credentials
      );
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Auth endpoints
  /* async login(
    email: string,
    password: string
  ): Promise<AxiosResponse<LoginResponse>> {
    try {
      const response = await withRetry(() =>
        api.post<LoginResponse>("/auth/login", { email, password })
      );

      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));
        console.log("Token stored in localStorage");
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  async signup(userData: {
    username: string;
    email: string;
    password: string;
  }) {
    return withRetry(() =>
      api.post<LoginResponse>("/auth/signup", userData)
    ).then((response) => {
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));
        console.log("Token stored in localStorage");
      }
      return response;
    });
  }, */

  async logout(): Promise<void> {
    try {
      await api.post<{ message: string }>("/auth/logout");
    } catch (error) {
      console.warn(
        "Logout API call failed, but proceeding with client-side logout"
      );
    } finally {
      // Always clear local storage on logout attempt
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  async getNotes(): Promise<Note[]> {
    // Verify token exists before attempting request
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("Authentication required to fetch notes");
      return [];
    }

    try {
      // Log that we're fetching notes
      console.log("Fetching notes...");

      // Use withRetry for better reliability
      const response = await withRetry(() => api.get<Note[]>("/notes"));

      // Log the raw response for debugging
      console.log("Raw notes response:", response);

      // Check if we have a valid array
      if (!response || !response.data) {
        console.warn("API returned empty notes response");
        return [];
      }

      // Ensure we're returning an array even if the API responds with null or undefined
      const notes = Array.isArray(response.data) ? response.data : [];

      // Log that we're returning notes
      console.log(`Returning ${notes.length} notes to component`);

      return notes;
    } catch (error) {
      console.error("Error fetching notes:", error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }
  },

  // Rest of the methods unchanged...
  async createNote(noteData: {
    title: string;
    content: string;
  }): Promise<Note | null> {
    try {
      // Use withRetry for note creation since it's a critical operation
      const response = await withRetry(
        () => api.post<Note>("/notes", noteData),
        3,
        2000
      );
      return response.data;
    } catch (error) {
      console.error("Error creating note:", error);
      throw error;
    }
  },

  // Add this method to your apiService object if it doesn't exist yet:

  async updateNote(
    id: number,
    noteData: { title?: string; content?: string }
  ): Promise<Note | null> {
    try {
      const response = await withRetry(() =>
        api.put<Note>(`/notes/${id}`, noteData)
      );
      return response.data;
    } catch (error) {
      console.error("Error updating note:", error);
      throw error;
    }
  },

  async deleteNote(id: number): Promise<boolean> {
    try {
      await withRetry(() => api.delete<{ message: string }>(`/notes/${id}`));
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  },
};

export default api;