import { serve } from 'bun';
import { join, resolve, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';  // <-- Changed to bind to all network interfaces
const DIST_DIR = resolve(__dirname, '../dist');
const BACKEND_URL = 'http://localhost:3001';

console.log(`Serving static files from: ${DIST_DIR}`);
console.log(`Proxying API requests to: ${BACKEND_URL}`);
console.log(`Server will be accessible at: http://${HOST}:${PORT}`);
console.log(`For local access use: http://localhost:${PORT}`);
console.log(`For network access use: http://192.168.50.131:${PORT}`);

// Simple static file server with API proxy
serve({
  port: PORT,
  hostname: HOST,  // <-- Added to bind to all network interfaces
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Add CORS headers to all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
    };
    
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // Proxy API requests to backend
    if (path.startsWith('/api/') || path === '/api') {
      console.log(`Proxying API request: ${req.method} ${path} to ${BACKEND_URL}${path}`);
      
      // Forward the request to the backend
      const proxyUrl = `${BACKEND_URL}${path}${url.search}`;
      
      try {
        // Clone the request with its headers and body
        const proxyReq = new Request(proxyUrl, {
          method: req.method,
          headers: req.headers,
          body: req.body,
          redirect: 'follow'
        });
        
        // Forward the request
        const response = await fetch(proxyReq);
        
        // Return the response from the backend with CORS headers
        const newResponse = new Response(response.body, response);
        
        // Add CORS headers
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newResponse.headers.set(key, value);
        });
        
        return newResponse;
      } catch (error) {
        console.error(`Error proxying request to ${proxyUrl}:`, error);
        return new Response(JSON.stringify({ error: 'Backend connection failed' }), {
          status: 502,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // Handle static files
    let filePath = path === '/' ? '/index.html' : path;
    filePath = join(DIST_DIR, filePath);
    
    try {
      if (existsSync(filePath)) {
        const content = readFileSync(filePath);
        const contentType = getContentType(filePath);
        return new Response(content, {
          headers: { 
            'Content-Type': contentType,
            ...corsHeaders
          }
        });
      }
      
      // For any path not found, serve index.html (SPA approach)
      const indexPath = join(DIST_DIR, 'index.html');
      if (existsSync(indexPath)) {
        if (path.includes('.')) {
          return new Response('File not found', { 
            status: 404,
            headers: corsHeaders
          });
        } else {
          const indexContent = readFileSync(indexPath);
          return new Response(indexContent, {
            headers: { 
              'Content-Type': 'text/html',
              ...corsHeaders
            }
          });
        }
      } else {
        console.error(`Index file not found at ${indexPath}`);
        return new Response('Index file not found', { 
          status: 500,
          headers: corsHeaders
        });
      }
    } catch (error) {
      console.error(`Error serving ${filePath}:`, error);
      return new Response('Server error', { 
        status: 500,
        headers: corsHeaders
      });
    }
  }
});

console.log(`Server started on port ${PORT}, bound to ${HOST}`);

// Helper to determine the content type
function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const contentTypes = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    ico: 'image/x-icon'
  };
  
  return contentTypes[ext] || 'text/plain';
}