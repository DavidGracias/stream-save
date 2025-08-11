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
  const [profiles, setProfiles] = useState<string[]>(['admin']);
  const [profile, setProfile] = useState<string>('admin');
  const [hasDbCreds, setHasDbCreds] = useState<boolean>(() => Boolean(localStorage.getItem('db_url')));

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
    setIsRedirected(Boolean(urlUser && urlPass && urlCluster));
  }, []);

  // Initialize profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('profile');
      if (stored) setProfile(stored);
    } catch { /* ignore */ }
  }, []);

  // Track changes to db_url and update flag
  useEffect(() => {
    const updateCreds = () => {
      try { setHasDbCreds(Boolean(localStorage.getItem('db_url'))); } catch { /* ignore */ }
    };
    window.addEventListener('storage', updateCreds);
    updateCreds();
    return () => { window.removeEventListener('storage', updateCreds); };
  }, []);

  // Load owners/profiles from backend
  useEffect(() => {
    const abort = new AbortController();
    async function loadProfiles() {
      try {
        const dbUrl = localStorage.getItem('db_url');
        if (!dbUrl) { setProfiles(['admin']); return; }
        const res = await fetch('/api/owners', { headers: { 'x-db-url': dbUrl }, signal: abort.signal });
        if (!res.ok) throw new Error('owners failed');
        const j = await res.json() as { owners?: string[] };
        const incoming = Array.isArray(j.owners) && j.owners.length ? j.owners : ['admin'];
        setProfiles((prev) => Array.from(new Set([...(prev || []), ...incoming, profile].filter(Boolean))) as string[]);
      } catch {
        setProfiles(() => {
          const base = ['admin'];
          return profile && !base.includes(profile) ? [profile, ...base] : base;
        });
      }
    }
    loadProfiles();
    return () => { abort.abort(); };
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

  if (!(hasValidCredentials || isRedirected)) {
    return (
      <BrowserRouter>
        <RouteLogger />
        <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} profiles={profiles} profile={profile} setProfile={setProfile} setProfiles={setProfiles} />
      </BrowserRouter>
    )
  }

  return (
    <BrowserRouter>
      <RouteLogger />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navigation
          profiles={profiles}
          profile={profile}
          hasDbCreds={hasDbCreds}
          setProfile={setProfile}
          setProfiles={setProfiles}
        />
        <div style={{ flexGrow: 1, padding: '16px' }}>
          <Routes>
            <Route
              path="/configure"
              element={
                isRedirected
                  ? (() => { setIsRedirected(false); return <Navigate to="/manage" replace /> })()
                  : <Configure mongoDBCred={MongoDBCred} setMongoDBCred={setMongoDBCred} profiles={profiles} profile={profile} setProfile={setProfile} setProfiles={setProfiles} />
              }
            />
            <Route path="/manage" element={
              <Manage profile={profile} profiles={profiles} />
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
