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

export const generateUrl = (mongoCred: MongoDBCredentials): string => (
  `mongodb+srv://${mongoCred.user}:${mongoCred.pass}@${mongoCred.cluster}.mongodb.net`
);

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

  // Load MongoDB Credentials from MongoDB.env
  useEffect(() => {
    const storedUser = localStorage.getItem('MONGO_USERNAME');
    const storedPass = localStorage.getItem('MONGO_PASSWORD');
    const storedCluster = localStorage.getItem('MONGO_CLUSTER_URL');

    if (storedUser || storedPass || storedCluster) {
      setMongoDBCred({
        user: storedUser || MongoDBCred.user,
        pass: storedPass || MongoDBCred.pass,
        cluster: storedCluster || MongoDBCred.cluster,
      });
    }

    // Check if credentials are configured (not default values)
    setIsConfigured(hasValidCredentials());
  }, []);

  // Update isConfigured when MongoDBCred changes
  useEffect(() => {
    setIsConfigured(hasValidCredentials());
  }, [MongoDBCred]);

  if (!isConfigured) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1 }}>
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
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
