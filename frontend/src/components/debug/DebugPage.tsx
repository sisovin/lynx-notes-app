import React, { useState } from 'react';
import axios from 'axios';

const DebugPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = {};
      
      // Test health endpoint
      try {
        const health = await axios.get('/api/health');
        results['health'] = health.data;
      } catch (e) {
        results['health'] = { error: e instanceof Error ? e.message : 'Unknown error' };
      }
      
      // Test status endpoint
      try {
        const status = await axios.get('/api/status');
        results['status'] = status.data;
      } catch (e) {
        results['status'] = { error: e instanceof Error ? e.message : 'Unknown error' };
      }
      
      setResult(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-card rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-4">API Debug</h2>
      
      <button 
        onClick={testEndpoints}
        disabled={loading}
        className="bg-primary hover:bg-hover text-white py-2 px-4 rounded transition-colors mb-4"
      >
        {loading ? 'Testing...' : 'Test API Endpoints'}
      </button>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="bg-background p-4 rounded overflow-auto max-h-80">
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-sm text-secondary">
        <p>Current API Base URL: {process.env.NODE_ENV === 'development' ? 'http://localhost:3001/api' : '/api'}</p>
      </div>
    </div>
  );
};

export default DebugPage;