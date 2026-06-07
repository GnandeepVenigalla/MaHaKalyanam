// ============================================================
// Express Server Entry Point
// MaHaKalyanam Wedding Server — Ranjith & Nithaya (MongoDB)
// ============================================================

import dotenv from 'dotenv';
import { fileURLToPath as _ftu } from 'url';
import { dirname as _dn, join as _jn } from 'path';
dotenv.config({ path: _jn(_dn(_ftu(import.meta.url)), '.env') });

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, seedData } from './db/init.js';
import adminRoutes from './routes/admin.js';
import rsvpRoutes from './routes/rsvp.js';
import contentRoutes from './routes/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Initialize Express ──────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'https://mahakalyanam.gnandeep.com',
      /\.vercel\.app$/,
      /\.gnandeep\.com$/,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── DB Connection (lazy for Vercel) ─────────────────────────
let dbReady = false;
async function ensureDB() {
  if (!dbReady) {
    await connectDB();
    await seedData();
    dbReady = true;
  }
}

// Ensure DB is connected before any API route
app.use('/api', async (_req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (e) {
    console.error('DB connection error:', e);
    res.status(500).json({
      success: false,
      message: 'Database connection failed: ' + e.message,
    });
  }
});

// ── Mount API Routes ────────────────────────────────────────
app.use('/api/admin', adminRoutes);
app.use('/api/rsvp', rsvpRoutes);
app.use('/api', contentRoutes);

// ── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🎊 MaHaKalyanam Wedding Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// ── Serve React Frontend in Production ──────────────────────
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res, next) => {
  if (_req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

// ── 404 Handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ── Global Error Handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

// ── Start Server (only when run directly, not on Vercel) ────
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL;
if (!isVercel) {
  ensureDB().then(() => {
    app.listen(PORT, () => {
      console.log(`\n🎉 MaHaKalyanam Wedding Server`);
      console.log(`   Ranjith & Nithaya — June 24, 2026`);
      console.log(`   Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  }).catch((error) => {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  });
}

export default app;
