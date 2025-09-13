import React, { useEffect, useState } from 'react';
import { supabase, testConnection } from '../integrations/supabase/client';

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    const testEnv = () => {
      const vars = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE,
      };
      setEnvVars(vars);
    };

    const testDb = async () => {
      try {
        const isConnected = await testConnection();
        setConnectionStatus(isConnected ? '✅ Connected' : '❌ Failed');
      } catch (error) {
        setConnectionStatus(`❌ Error: ${error}`);
      }
    };

    testEnv();
    testDb();
  }, []);

  return (
    <div className="p-5 border border-gray-300 m-5 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3">🔍 Connection Test</h3>
      <p className="mb-3"><strong>Status:</strong> {connectionStatus}</p>
      <div>
        <h4 className="font-medium mb-2">Environment Variables:</h4>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{JSON.stringify(envVars, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ConnectionTest;
