import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Import pages
import Navigation from './components/Navigation.tsx';
import Home from './pages/Home.tsx';
import Configure from './pages/Configure.tsx';
import Manage from './pages/Manage.tsx';

// Import types
import type { MongoDBCredentials } from './types';

function App() {
  const [MongoDBCred, setMongoDBCred] = useState<MongoDBCredentials>({
    user: null,
    pass: null,
    cluster: null,
  });
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const hasValidCredentials = (): boolean => {
    return !!(MongoDBCred.user && MongoDBCred.pass && MongoDBCred.cluster);
  };

  const loadCredentialsFromEnv = () => {
    const envUser = import.meta.env.VITE_MONGO_USERNAME;
    const envPass = import.meta.env.VITE_MONGO_PASSWORD;
    const envCluster = import.meta.env.VITE_MONGO_CLUSTER_URL;
    if (envUser || envPass || envCluster) {
      setMongoDBCred({
        user: envUser || null,
        pass: envPass || null,
        cluster: envCluster || null,
      });
    }
  };

  // Load MongoDB Credentials from environment variables
  useEffect(() => {
    loadCredentialsFromEnv();
    // @ts-ignore - Adding to window for development purposes
    window.refreshMongoDBCredentials = loadCredentialsFromEnv;
  }, []);

  // Update isConfigured when MongoDBCred changes
  useEffect(() => {
    setIsConfigured(!hasValidCredentials());
  }, [MongoDBCred]);

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {
            isConfigured ? (
              <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
            ) : (
              <Routes>
                <Route path="/configure" element={
                  <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
                } />
                <Route path="/manage" element={
                  <Manage mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
                } />
                <Route path="/" element={
                  <Home mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
                } />
              </Routes>
            )
          }
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
