// This file provides browser-compatible process.env values
// It will be included before client.js in the HTML

// Ensure process object exists
window.process = window.process || {};

// Set up environment variables
window.process.env = {
  // Default environment variables
  NODE_ENV: 'development',
  
  // API URL - point to your network IP instead of localhost
  API_URL: 'http://192.168.50.131:3001',
  REACT_APP_API_URL: 'http://192.168.50.131:3001/api'
};

// Log current environment for debugging
console.log('Environment loaded:', window.process.env);