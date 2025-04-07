import React, { useState } from 'react';

const DevTools: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Only show in development environments
  if (!(window.location.hostname === 'localhost' || 
       window.location.hostname === '127.0.0.1' || 
       window.location.hostname === '192.168.50.131')) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
        title="Development Tools"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-card border border-border rounded-lg shadow-lg min-w-[280px]">
          <h3 className="text-lg font-bold mb-3">Development Tools</h3>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-1">Test Account:</h4>
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
              <div>Email: <code>user@niewin.local</code></div>
              <div>Password: <code>UserPas$36&99</code></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full text-xs bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
            >
              Clear Storage & Reload
            </button>
            
            <button
              onClick={() => {
                // Test direct login
                fetch('http://192.168.50.131:3001/api/auth/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    email: 'user@niewin.local',
                    password: 'UserPas$36&99'
                  })
                })
                .then(res => res.json())
                .then(data => {
                  localStorage.setItem('user', JSON.stringify(data.user));
                  localStorage.setItem('token', data.token);
                  alert('Test login successful! Page will reload.');
                  window.location.reload();
                })
                .catch(err => {
                  alert('Test login failed: ' + err.message);
                });
              }}
              className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
            >
              Test Direct Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevTools;