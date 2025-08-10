/* Unified Node server: serves React (dev with Vite middleware, prod from dist) and exposes /api routes */
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 5173);

// Mongo env
// We REQUIRE the DB URL to be passed per request via the 'x-db-url' header.
// We no longer use MONGO_URL fallback to avoid accidental shared creds.
const MONGO_URL = undefined;
const DB_NAME = process.env.DB_NAME || 'streamsave';
const MOVIE_CATALOG = process.env.MOVIE_CATALOG || 'movieCatalog';
const MOVIE_STREAMS = process.env.MOVIE_STREAMS || 'movieStreams';
const SERIES_CATALOG = process.env.SERIES_CATALOG || 'seriesCatalog';

// Per-URL MongoClient cache to avoid reconnecting on every request
const clientCache = new Map();

function createMongoClient(mongoUrl) {
  // Use Stable API and stricter behavior per MongoDB recommendation
  return new MongoClient(mongoUrl, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
}

async function getCollections(req) {
  const headerUrl = req.header('x-db-url');
  const mongoUrl = (headerUrl && headerUrl.startsWith('mongodb+srv://')) ? headerUrl : undefined;
  if (!mongoUrl) {
    const err = new Error("Missing 'x-db-url' header (expected mongodb+srv://user:pass@cluster.mongodb.net)");
    err.statusCode = 400;
    throw err;
  }
  let client = clientCache.get(mongoUrl);
  if (!client) {
    client = await createMongoClient(mongoUrl).connect();
    // Optional: ping to validate connectivity once
    try { await client.db('admin').command({ ping: 1 }); } catch { }
    clientCache.set(mongoUrl, client);
  }
  const db = client.db(DB_NAME);
  return {
    movieCatalog: db.collection(MOVIE_CATALOG),
    movieStreams: db.collection(MOVIE_STREAMS),
    seriesCatalog: db.collection(SERIES_CATALOG),
  };
}

async function fetchMeta(kind, id) {
  try {
    const r = await fetch(`https://cinemeta-live.strem.io/meta/${kind}/${id}.json`);
    if (!r.ok) return {};
    const j = await r.json();
    return j?.meta || {};
  } catch {
    return {};
  }
}

function normalize(d) {
  return {
    id: d._id || d.id,
    type: d.type,
    name: d.name,
    description: d.description ?? null,
    poster: d.poster || '',
    releaseInfo: d.releaseInfo || '',
    imdbRating: d.imdbRating ?? null,
  };
}

async function createServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  console.log('Server starting. Using env MONGO_URL fallback?', Boolean(MONGO_URL));

  // ---- Stremio manifest (dynamic by credentials in URL) ----
  const MANIFEST = {
    id: 'org.stremio.streamsave',
    version: '1.0.0',
    name: 'Stream Save',
    description: 'save custom stream links and play in different devices',
    resources: [
      'catalog',
      { name: 'stream', types: ['movie', 'series'], idPrefixes: ['tt'] },
    ],
    types: ['movie', 'series', 'other'],
    catalogs: [
      { type: 'movie', name: 'Saved Movies', id: 'stream_save_movies' },
      { type: 'series', name: 'Saved Series', id: 'stream_save_series' },
    ],
    behaviorHints: { configurable: true },
    idPrefixes: ['tt'],
  };

  // For Debugging: Plain manifest (no credentials): /manifest.json
  app.get('/manifest.json', (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(MANIFEST);
  });

  // Dynamic manifest: /:user/:passw/:cluster/manifest.json
  app.get('/:user/:passw/:cluster/manifest.json', (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(MANIFEST);
  });

  // Dynamic config: /:user/:passw/:cluster/configure
  app.get('/:user/:passw/:cluster/configure', (req, res) => {
    const { user, pass, cluster } = req.params;
    res.redirect(`/configure?user=${user}&pass=${pass}&cluster=${cluster}`);
  });

  // API routes
  app.get('/api/content', async (req, res) => {
    try {
      const { movieCatalog, seriesCatalog } = await getCollections(req);
      const [movies, series] = await Promise.all([
        movieCatalog.find({}).toArray(),
        seriesCatalog.find({}).toArray(),
      ]);
      const content = [
        ...movies.map((m) => normalize({ ...m, type: 'movie' })),
        ...series.map((s) => normalize({ ...s, type: 'series' })),
      ];
      res.json({ content, total_count: content.length });
    } catch (e) {
      const code = e?.statusCode || 500;
      res.status(code).json({ error: e?.message || 'Failed to fetch content' });
    }
  });

  app.post('/api/content', async (req, res) => {
    try {
      const { type, imdbID, stream } = req.body || {};
      if (!type || !imdbID) return res.status(400).json({ error: 'type and imdbID required' });
      const { movieCatalog, movieStreams, seriesCatalog } = await getCollections(req);
      if (type === 'movie') {
        await Promise.all([
          movieCatalog.deleteOne({ _id: imdbID }),
          movieStreams.deleteOne({ _id: imdbID }),
        ]);
        const meta = await fetchMeta('movie', imdbID);
        await movieCatalog.insertOne({
          _id: imdbID, id: imdbID, type: 'movie',
          name: meta?.name || meta?.title || imdbID,
          description: meta?.description ?? null,
          poster: meta?.poster || '',
          releaseInfo: meta?.releaseInfo || '',
          imdbRating: meta?.imdbRating || null,
        });
        if (stream) await movieStreams.insertOne({ _id: imdbID, data: { url: stream } });
      } else if (type === 'series') {
        await seriesCatalog.deleteOne({ _id: imdbID });
        const meta = await fetchMeta('series', imdbID);
        await seriesCatalog.insertOne({
          _id: imdbID, id: imdbID, type: 'series',
          name: meta?.name || meta?.title || imdbID,
          description: meta?.description ?? null,
          poster: meta?.poster || '',
          releaseInfo: meta?.releaseInfo || '',
          imdbRating: meta?.imdbRating || null,
        });
      } else {
        return res.status(400).json({ error: 'invalid type' });
      }
      res.send('Success');
    } catch (e) {
      const code = e?.statusCode || 500;
      res.status(code).json({ error: e?.message || 'Failed to add content' });
    }
  });

  app.delete('/api/content/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const { movieCatalog, movieStreams, seriesCatalog } = await getCollections(req);
      if (type === 'movie') {
        await Promise.all([
          movieCatalog.deleteOne({ _id: id }),
          movieStreams.deleteOne({ _id: id }),
        ]);
      } else if (type === 'series') {
        await seriesCatalog.deleteOne({ _id: id });
      } else {
        return res.status(400).json({ error: 'invalid type' });
      }
      res.send('Success');
    } catch (e) {
      const code = e?.statusCode || 500;
      res.status(code).json({ error: e?.message || 'Failed to remove content' });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: path.join(__dirname, '..', 'frontend'),
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        const indexPath = path.join(__dirname, '..', 'frontend', 'index.html');
        let html = fs.readFileSync(indexPath, 'utf-8');
        const template = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) { next(e); }
    });
  } else {
    const dist = path.join(__dirname, '..', 'frontend', 'dist');
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  const desiredPort = Number(PORT) || 0;
  const server = app.listen(desiredPort, () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : desiredPort;
    console.log(`All-in-one server on http://localhost:${actualPort}`);
  });
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`Port ${desiredPort} in use, retrying on a random port...`);
      const fallback = app.listen(0, () => {
        const addr = fallback.address();
        const p = typeof addr === 'object' && addr ? addr.port : '(unknown)';
        console.log(`All-in-one server on http://localhost:${p}`);
      });
    } else {
      throw err;
    }
  });
}

createServer().catch((e) => { console.error(e); process.exit(1); });


