// Get the current hostname for automatic API detection
const hostname = window.location.hostname;

// Safely access process.env with fallbacks
const getEnv = (key: string, defaultValue: string): string => {
  try {
    return (window.process?.env && window.process.env[key]) || defaultValue;
  } catch (e) {
    console.warn(`Failed to access process.env.${key}, using default value`, e);
    return defaultValue;
  }
};

// Determine if we're in development
const isDev = getEnv('NODE_ENV', 'development') === 'development' || 
              hostname === 'localhost' || 
              hostname === '127.0.0.1' ||
              hostname === '192.168.50.131';

// Get backend API URL based on the environment
const getApiBaseUrl = () => {
  // Use environment variable if available
  const envApiUrl = getEnv('REACT_APP_API_URL', '');
  if (envApiUrl) {
    // If it already includes /api, use it directly
    if (envApiUrl.endsWith('/api')) {
      return envApiUrl;
    }
    // Otherwise, append /api if not present
    return envApiUrl.endsWith('/') ? `${envApiUrl}api` : `${envApiUrl}/api`;
  }
  
  // For cross-network access
  if (hostname === '192.168.50.131') {
    return 'http://192.168.50.131:3001/api';
  }
  
  // In development, always use the full URL to the backend
  if (isDev) {
    // Use the same hostname but different port for API
    return `http://${hostname}:3001/api`;
  }
  
  // Default to relative path for same-origin deployment in production
  return '/api';
};

const config = {
  api: {
    baseURL: getApiBaseUrl(),
    timeout: isDev ? 10000 : 30000,
    retries: isDev ? 1 : 3
  },
  auth: {
    tokenStorageKey: 'token',
    userStorageKey: 'user'
  },
  app: {
    name: 'Lynx Notes',
    version: '1.0.0'
  }
};

console.log('API base URL:', config.api.baseURL);

export default config;