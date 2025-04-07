import config from '../config';

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
  statusText: string;
}

// Helper function to make direct fetch calls with proper error handling
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  // Ensure the URL has the right base
  const baseURL = config.api.baseURL;
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  
  // Log the request in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔹 Direct API Request: ${options.method || 'GET'} ${url}`);
  }
  
  // Set up default headers
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  
  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Make the request
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include'
    });
    
    // Parse the response
    let data: T;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        // Try to parse as JSON anyway
        data = JSON.parse(text) as T;
      } catch (e) {
        // Not JSON, use as text
        data = text as unknown as T;
        
        // If this is HTML and not a successful response, it's likely an error
        if (text.includes('<!DOCTYPE html>') && !response.ok) {
          console.log('API error: Received HTML instead of JSON');
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
    }
    
    if (!response.ok) {
      console.log(' API error response:', data);
      throw new Error(
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as any).message)
          : `Error: ${response.status} ${response.statusText}`
      );
    }
    
    return {
      data,
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    };
    
  } catch (error) {
    console.log(' Direct API error:', error);
    throw error;
  }
}

// Export the API helpers
export const directApiHelpers = {
  // Auth
  async login(email: string, password: string) {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  
  async logout() {
    return apiFetch('/api/auth/logout', {
      method: 'POST'
    });
  },
  
  // Notes
  async getNotes() {
    return apiFetch('/api/notes');
  },
  
  async createNote(data: any) {
    return apiFetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  async updateNote(id: number, data: any) {
    return apiFetch(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  
  async deleteNote(id: number) {
    return apiFetch(`/api/notes/${id}`, {
      method: 'DELETE'
    });
  }
};