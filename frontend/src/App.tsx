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
  const [isRedirected, setIsRedirected] = useState<boolean>(false);

  // Load MongoDB Credentials from environment variables
  useEffect(() => {
    const envUser = import.meta.env.VITE_MONGO_USERNAME;
    const envPass = import.meta.env.VITE_MONGO_PASSWORD;
    const envCluster = import.meta.env.VITE_MONGO_CLUSTER_URL;

    // if the url has a user, pass, and cluster, use them
    const params = new URLSearchParams(window.location.search);
    const urlUser = params.get('user');
    const urlPass = params.get('pass');
    const urlCluster = params.get('cluster');

    const user = urlUser || envUser;
    const pass = urlPass || envPass;
    const cluster = urlCluster || envCluster;

    if (user && pass && cluster) {
      setMongoDBCred({ user, pass, cluster });
    }
    if (urlUser && urlPass && urlCluster) {
      setIsRedirected(true);
    }
  }, []);

  // Check if we have valid credentials
  const hasValidCredentials = useMemo(() => MongoDBCred.user && MongoDBCred.pass && MongoDBCred.cluster, [MongoDBCred]);

  if (!hasValidCredentials && !isRedirected) {
    return <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
  }

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <div style={{ flexGrow: 1, padding: '16px' }}>
          <Routes>
            <Route
              path="/configure"
              element={
                isRedirected
                  ? <Navigate to="/" replace />
                  : <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
              }
            />
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
