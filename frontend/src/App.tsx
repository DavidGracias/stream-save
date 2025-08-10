import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

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

  const RouteLogger: React.FC = () => {
    const location = useLocation();
    (window as any).__ROUTE_HISTORY__ = (window as any).__ROUTE_HISTORY__ || [];
    const hist: string[] = (window as any).__ROUTE_HISTORY__;
    const path = `${location.pathname}${location.search}`;
    if (hist[hist.length - 1] !== path) {
      hist.push(path);
      if (hist.length > 20) hist.shift();
      const mask = (s: string) => s.replace(/(passw?|password)=([^&]+)/gi, '$1=***');
      // eslint-disable-next-line no-console
      console.log('[route] hit', mask(path), '| recent:', hist.slice(-5).map(mask));
    }
    return null;
  };

  if (!hasValidCredentials && !isRedirected) {
    return (
      <BrowserRouter>
        <RouteLogger />
        <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <RouteLogger />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation />
        <div style={{ flexGrow: 1, padding: '16px' }}>
          <Routes>
            <Route
              path="/configure"
              element={
                isRedirected
                  ? (() => { setIsRedirected(false); return <Navigate to="/" replace /> })()
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
