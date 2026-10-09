import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
  getSupabaseClient,
} from '../lib/supabaseClient';

interface SupabaseConfigContextType {
  isConfigured: boolean;
  projectUrl: string;
  anonKey: string;
  connectionStatus: 'connected' | 'checking' | 'local_demo' | 'error';
  statusMessage: string;
  saveConfig: (url: string, key: string) => Promise<boolean>;
  resetToDemo: () => void;
  testConnection: () => Promise<boolean>;
}

const SupabaseConfigContext = createContext<SupabaseConfigContextType>({
  isConfigured: false,
  projectUrl: '',
  anonKey: '',
  connectionStatus: 'local_demo',
  statusMessage: '',
  saveConfig: async () => false,
  resetToDemo: () => {},
  testConnection: async () => false,
});

export const SupabaseConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState(getSupabaseCredentials());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'checking' | 'local_demo' | 'error'>(
    config.isConfigured ? 'checking' : 'local_demo'
  );
  const [statusMessage, setStatusMessage] = useState<string>('');

  const testConnection = async (): Promise<boolean> => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) {
      setConnectionStatus('local_demo');
      setStatusMessage('Active in Local Demo / Instant Evaluation Mode. All database features enabled.');
      return true;
    }

    setConnectionStatus('checking');
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Client creation failed');
      const { error } = await client.from('teams').select('id').limit(1);
      if (error) {
        setConnectionStatus('error');
        setStatusMessage(`Connected to Supabase URL, but database error: ${error.message}. Please apply the SQL migration schema in the Supabase SQL editor.`);
        return false;
      }
      setConnectionStatus('connected');
      setStatusMessage('Successfully connected to remote Supabase database!');
      return true;
    } catch (e: any) {
      setConnectionStatus('error');
      setStatusMessage(`Supabase connection failed: ${e.message || 'Unknown network error'}`);
      return false;
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const saveConfig = async (url: string, key: string): Promise<boolean> => {
    saveSupabaseCredentials(url, key);
    const updated = getSupabaseCredentials();
    setConfig(updated);
    return await testConnection();
  };

  const resetToDemo = () => {
    clearSupabaseCredentials();
    const updated = getSupabaseCredentials();
    setConfig(updated);
    setConnectionStatus('local_demo');
    setStatusMessage('Switched to local database store.');
  };

  return (
    <SupabaseConfigContext.Provider
      value={{
        isConfigured: config.isConfigured,
        projectUrl: config.url,
        anonKey: config.anonKey,
        connectionStatus,
        statusMessage,
        saveConfig,
        resetToDemo,
        testConnection,
      }}
    >
      {children}
    </SupabaseConfigContext.Provider>
  );
};

export const useSupabaseConfig = () => useContext(SupabaseConfigContext);
