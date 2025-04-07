import React, { useEffect, useState } from 'react';

const ApiTester: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const testApi = async (url: string) => {
    setLoading(true);
    try {
      // Use the response by checking status or ok property
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      // The no-cors mode doesn't give useful status, so we assume success if no error is thrown
      setResult(`✅ ${url} is reachable`);
    } catch (error) {
      setResult(`❌ Error accessing ${url}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Test on mount
    testApi('http://192.168.50.131:3001/api/health');
  }, []);
  
  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded shadow-lg border border-gray-200 max-w-sm z-50">
      <h2 className="text-lg font-bold mb-2">API Tester</h2>
      
      <div className="mb-4 text-sm">
        {loading ? 'Testing...' : result}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => testApi('http://192.168.50.131:3001/api/health')}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          disabled={loading}
        >
          Test Direct
        </button>
        
        <button
          type="button"
          onClick={() => testApi('/api/health')}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
          disabled={loading}
        >
          Test Proxy
        </button>
        
        {/* Fixed login button with correct credentials */}
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              // Log the attempt for debugging
              console.log('Attempting direct login with test credentials');
              
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: 'user@niewin.local', // This was the error - using admin instead of user
                  password: 'UserPas$36&99'
                })
              });
              const data = await response.json();
              
              // Store token and user if successful
              if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setResult(`✅ Login successful: ${JSON.stringify(data.user.username || data.user.email)}`);
              } else {
                setResult(`❌ Login failed: ${JSON.stringify(data)}`);
              }
              
              console.log(`Login test response:`, data);
            } catch (error) {
              setResult(`❌ Login test error: ${error instanceof Error ? error.message : String(error)}`);
              console.error('Login attempt failed:', error);
            } finally {
              setLoading(false);
            }
          }}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm"
          disabled={loading}
        >
          Direct Login
        </button>

        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch('http://localhost:3001/api/auth/dev-reset-password', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  email: 'user@niewin.local', // Changed from admin to user
                  password: 'UserPas$36&99'
                })
              });
              const data = await response.json();
              setResult(`Reset password: ${response.ok ? '✅' : '❌'} ${JSON.stringify(data)}`);
            } catch (error) {
              setResult(`❌ Reset password error: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
              setLoading(false);
            }
          }}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm"
          disabled={loading}
        >
          Reset PW
        </button>
        
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            setResult('localStorage cleared');
          }}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          disabled={loading}
        >
          Clear Storage
        </button>
      </div>
    </div>
  );
};

export default ApiTester;