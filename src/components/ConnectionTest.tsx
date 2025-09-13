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
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>🔍 Connection Test</h3>
      <p><strong>Status:</strong> {connectionStatus}</p>
      <div>
        <h4>Environment Variables:</h4>
        <pre>{JSON.stringify(envVars, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ConnectionTest;
