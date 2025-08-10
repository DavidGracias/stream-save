/* Unified Node server: serves React (dev with Vite middleware, prod from dist) and exposes /api routes */
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';
import fetch from 'node-fetch';

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
  const safeId = encodeURIComponent(String(id || '').trim());
  const urls = [
    `https://cinemeta-live.strem.io/meta/${kind}/${safeId}.json`,
    `https://v3-cinemeta.strem.io/meta/${kind}/${safeId}.json`,
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (!r.ok) continue;
      const j = await r.json();
      const meta = j && j.meta ? j.meta : {};
      if (meta && (meta.poster || meta.background || meta.logo || meta.name || meta.title)) {
        return meta;
      }
    } catch {
      // try next
    }
  }
  return {};
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

  // --- Request logging + recent route history ---
  const requestHistory = [];
  function maskSensitiveQuery(urlStr) {
    try {
      const u = new URL(urlStr, 'http://localhost');
      if (u.searchParams.has('pass')) u.searchParams.set('pass', '***');
      return `${u.pathname}${u.search}`;
    } catch {
      return urlStr;
    }
  }
  app.use((req, _res, next) => {
    const now = new Date().toISOString();
    const maskedUrl = maskSensitiveQuery(req.originalUrl || req.url || '');
    const entry = {
      t: now,
      method: req.method,
      url: maskedUrl,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown',
      ua: req.headers['user-agent'] || '',
    };
    requestHistory.push(entry);
    if (requestHistory.length > 200) requestHistory.shift();
    // Log hit + last 5 routes
    const recent = requestHistory.slice(-5).map((e) => `${e.method} ${e.url}`).join('  |  ');
    console.log(`[hit] ${entry.method} ${entry.url} from ${entry.ip} @ ${entry.t}`);
    console.log(`[recent] ${recent}`);
    next();
  });

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
      { type: 'other', name: 'Saved Links', id: 'stream_save_all' },
      // { type: 'movie', name: 'Saved Movies', id: 'stream_save_movies' },
      // { type: 'series', name: 'Saved Series', id: 'stream_save_series' },
    ],
    behaviorHints: { configurable: true },
    idPrefixes: ['tt'],
  };

  // For Debugging: Plain manifest (no credentials): /manifest.json
  app.get('/manifest.json', (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(MANIFEST);
  });

  // Dynamic manifest
  const sendManifest = (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(MANIFEST);
  };
  app.get('/:user/:pass/:cluster/manifest.json', sendManifest);

  // Dynamic config: /:user/:pass/:cluster/configure
  app.get('/:user/:pass/:cluster/configure', (req, res) => {
    const { user, pass, cluster } = req.params;
    res.redirect(`/configure?user=${user}&pass=${pass}&cluster=${cluster}`);
  });


  // Build Mongo URL from path params (for Stremio addon endpoints)
  function mongoUrlFromParams(params) {
    const user = params.user || '';
    const pw = params.pass || '';
    const cluster = params.cluster || '';
    if (!user || !pw || !cluster) return '';
    return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(pw)}@${encodeURIComponent(cluster)}.mongodb.net`;
  }

  async function getCollectionsFromParams(params) {
    const url = mongoUrlFromParams(params);
    if (!url) {
      const err = new Error('Missing or invalid credentials in URL');
      err.statusCode = 400;
      throw err;
    }
    let client = clientCache.get(url);
    if (!client) {
      client = await createMongoClient(url).connect();
      try { await client.db('admin').command({ ping: 1 }); } catch { }
      clientCache.set(url, client);
    }
    const db = client.db(DB_NAME);
    return {
      movieCatalog: db.collection(MOVIE_CATALOG),
      movieStreams: db.collection(MOVIE_STREAMS),
      seriesCatalog: db.collection(SERIES_CATALOG),
    };
  }

  // Stremio Catalog endpoint
  async function handleCatalog(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { entity_type, id } = req.params;
      const { movieCatalog, seriesCatalog } = await getCollectionsFromParams(req.params);
      if (entity_type === 'all' && id === 'stream_save_all') {
        const [movies, series] = await Promise.all([
          movieCatalog.find({}).toArray(),
          seriesCatalog.find({}).toArray(),
        ]);
        const metas = [
          ...movies.map((m) => normalize({ ...m, type: 'movie' })),
          ...series.map((s) => normalize({ ...s, type: 'series' })),
        ];
        return res.json({ metas });
      }
      if (entity_type === 'movie' && id === 'stream_save_movies') {
        const movies = await movieCatalog.find({}).toArray();
        const metas = movies.map((m) => normalize({ ...m, type: 'movie' }));
        return res.json({ metas });
      }
      if (entity_type === 'series' && id === 'stream_save_series') {
        const series = await seriesCatalog.find({}).toArray();
        const metas = series.map((s) => normalize({ ...s, type: 'series' }));
        return res.json({ metas });
      }
      return res.json({ metas: [] });
    } catch (e) {
      const code = e?.statusCode || 500;
      return res.status(code).json({ metas: [], error: e?.message || 'catalog error' });
    }
  }
  app.get('/:user/:pass/:cluster/catalog/:entity_type/:id.json', handleCatalog);

  // Stremio Stream endpoint
  async function handleStream(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { type, id } = req.params;
      const { movieStreams } = await getCollectionsFromParams(req.params);
      if (type === 'movie') {
        const doc = await movieStreams.findOne({ _id: id });
        const url = doc?.data?.url || '';
        if (url) {
          return res.json({ streams: [{ title: 'Saved', name: 'Stream Save', url }] });
        }
        return res.json({ streams: [] });
      }
      // series per-episode links not stored yet
      return res.json({ streams: [] });
    } catch (e) {
      const code = e?.statusCode || 500;
      return res.status(code).json({ streams: [], error: e?.message || 'stream error' });
    }
  }
  app.get('/:user/:pass/:cluster/stream/:type/:id.json', handleStream);

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
      const cleanId = String(imdbID).trim();
      if (type === 'movie') {
        await Promise.all([
          movieCatalog.deleteOne({ _id: cleanId }),
          movieStreams.deleteOne({ _id: cleanId }),
        ]);
        const meta = await fetchMeta('movie', cleanId);
        const poster = meta?.poster || meta?.logo || meta?.background || '';
        await movieCatalog.insertOne({
          _id: cleanId, id: cleanId, type: 'movie',
          name: meta?.name || meta?.title || imdbID,
          description: meta?.description ?? null,
          poster,
          releaseInfo: meta?.releaseInfo || '',
          imdbRating: meta?.imdbRating || null,
        });
        if (stream) await movieStreams.insertOne({ _id: cleanId, data: { url: String(stream).trim() } });
      } else if (type === 'series') {
        await seriesCatalog.deleteOne({ _id: cleanId });
        const meta = await fetchMeta('series', cleanId);
        const poster = meta?.poster || meta?.logo || meta?.background || '';
        await seriesCatalog.insertOne({
          _id: cleanId, id: cleanId, type: 'series',
          name: meta?.name || meta?.title || imdbID,
          description: meta?.description ?? null,
          poster,
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

  // Fetch a single content item (with stream for movies)
  app.get('/api/content/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const { movieCatalog, movieStreams, seriesCatalog } = await getCollections(req);
      if (type === 'movie') {
        const [meta, streamDoc] = await Promise.all([
          movieCatalog.findOne({ _id: id }),
          movieStreams.findOne({ _id: id }),
        ]);
        if (!meta) return res.status(404).json({ error: 'not found' });
        const item = normalize({ ...meta, type: 'movie' });
        const stream = streamDoc?.data?.url || '';
        return res.json({ item, stream });
      }
      if (type === 'series') {
        const meta = await seriesCatalog.findOne({ _id: id });
        if (!meta) return res.status(404).json({ error: 'not found' });
        const item = normalize({ ...meta, type: 'series' });
        return res.json({ item });
      }
      return res.status(400).json({ error: 'invalid type' });
    } catch (e) {
      const code = e?.statusCode || 500;
      res.status(code).json({ error: e?.message || 'Failed to fetch item' });
    }
  });

  // Update a single content item (supports movie stream link and basic metadata)
  app.put('/api/content/:type/:id', async (req, res) => {
    try {
      const { type, id } = req.params;
      const { stream, name, description, poster, releaseInfo, imdbRating } = req.body || {};
      const { movieCatalog, movieStreams, seriesCatalog } = await getCollections(req);

      const buildSetFields = () => {
        const fields = {};
        if (typeof name === 'string') fields.name = name;
        if (typeof description === 'string') fields.description = description;
        if (typeof poster === 'string') fields.poster = poster;
        if (typeof releaseInfo === 'string') fields.releaseInfo = releaseInfo;
        if (typeof imdbRating === 'string' || typeof imdbRating === 'number' || imdbRating === null) fields.imdbRating = imdbRating;
        return fields;
      };

      if (type === 'movie') {
        const setFields = buildSetFields();
        if (Object.keys(setFields).length > 0) {
          await movieCatalog.updateOne({ _id: id }, { $set: setFields });
        }
        if (typeof stream === 'string') {
          const trimmed = stream.trim();
          if (trimmed) {
            await movieStreams.updateOne(
              { _id: id },
              { $set: { data: { url: trimmed } } },
              { upsert: true }
            );
          } else {
            await movieStreams.deleteOne({ _id: id });
          }
        }
        return res.send('Success');
      } else if (type === 'series') {
        const setFields = buildSetFields();
        if (Object.keys(setFields).length > 0) {
          await seriesCatalog.updateOne({ _id: id }, { $set: setFields });
        }
        return res.send('Success');
      }
      return res.status(400).json({ error: 'invalid type' });
    } catch (e) {
      const code = e?.statusCode || 500;
      res.status(code).json({ error: e?.message || 'Failed to update item' });
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


