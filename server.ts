import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { usersRouter } from './server/routes/users.js';
import { sessionsRouter } from './server/routes/sessions.js';
import { researchRouter } from './server/routes/research.js';
import { adminRouter } from './server/routes/admin.js';
import { qrRouter } from './server/routes/qr.js';
import { cycleManager } from './server/cycleManager.js';
import { db } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure uploads folder exists and serve static uploads
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/research', researchRouter);
app.use('/api/admin', adminRouter);
app.use('/api/qr', qrRouter);

// Direct cycle status endpoint
app.get('/api/cycle-status', (_req, res) => {
  const report = cycleManager.getCycleReport();
  res.json({ success: true, cycle: report });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'Smart Library QR-Based Research Registration & Session Management System',
    timezone: 'Asia/Kolkata',
    timestamp: new Date().toISOString(),
  });
});

// Vite Middleware integration for development or Static Serving for production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n===============================================================`);
    console.log(`SMART LIBRARY RESEARCH REGISTRATION & SESSION MANAGEMENT SYSTEM`);
    console.log(`Server actively running at: http://localhost:${PORT}`);
    console.log(`Timezone: Asia/Kolkata | 24-Hour Cycle Daemon: ACTIVE`);
    console.log(`===============================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
