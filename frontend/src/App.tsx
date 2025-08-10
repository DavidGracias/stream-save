import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

  // Load MongoDB Credentials from environment variables
  useEffect(() => {
    const envUser = import.meta.env.VITE_MONGO_USERNAME;
    const envPass = import.meta.env.VITE_MONGO_PASSWORD;
    const envCluster = import.meta.env.VITE_MONGO_CLUSTER_URL;

    if (envUser && envPass && envCluster) {
      setMongoDBCred({ user: envUser, pass: envPass, cluster: envCluster });
    }
  }, []);

  // Check if we have valid credentials
  const hasValidCredentials = useMemo(() => MongoDBCred.user && MongoDBCred.pass && MongoDBCred.cluster, [MongoDBCred]);

  if (!hasValidCredentials) {
    return <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <div style={{ flexGrow: 1, padding: '16px' }}>
          <Routes>
            <Route path="/configure" element={
              <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
            } />
            <Route path="/manage" element={
              <Manage />
            } />
            <Route path="/" element={
              hasValidCredentials ? (
                <Home />
              ) : (
                <Navigate to="/configure" replace />
              )
            } />
            <Route path="*" element={
              hasValidCredentials ? (
                <Home />
              ) : (
                <Navigate to="/configure" replace />
              )
            } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
