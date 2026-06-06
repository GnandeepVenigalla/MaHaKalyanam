// ============================================================
// Vercel Serverless Function — Wraps Express API
// All /api/* requests are handled by this function
// ============================================================

import dotenv from 'dotenv';
dotenv.config({ path: new URL('../server/.env', import.meta.url).pathname });

import app from '../server/index.js';

export default app;
