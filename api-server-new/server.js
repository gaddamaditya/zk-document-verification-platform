/**
 * api-server-new — Standalone Express backend
 * Entry point: sets up middleware, routes, and starts the server.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const healthRoutes = require('./routes/health');
const uploadRoutes = require('./routes/upload');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Ensure uploads directory exists ─────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);

// ─── Optional routes (depend on ZKP engine) ─────────────────────
// These routes are loaded conditionally so the server can still
// start and handle uploads even if the ZKP engine is not installed.
const optionalRoutes = [
  { path: '/api/generate-proof', module: './routes/generateProof' },
  { path: '/api/download',       module: './routes/download' },
  { path: '/api/verify-proof',   module: './routes/verifyProof' },
  { path: '/api/ocr',            module: './routes/ocr' },
  { path: '/api/proof',          module: './routes/getProof' },
];

for (const route of optionalRoutes) {
  try {
    const router = require(route.module);
    app.use(route.path, router);
    console.log(`  ✓ Loaded optional route: ${route.path}`);
  } catch (err) {
    console.warn(`  ⚠ Skipped optional route ${route.path}: ${err.message}`);
  }
}

// ─── Error handling (must be after routes) ──────────────────────
app.use(errorHandler);

// ─── Startup Validation Diagnostics ──────────────────────────────
const zkpEnginePath = path.resolve(__dirname, "zk-document-verification");
const zkpEngineExists = fs.existsSync(zkpEnginePath);
global.ZKP_ENGINE_AVAILABLE = zkpEngineExists;

console.log("-------------------------------------------------");
console.log("API Server Started");
console.log("-------------------------------------------------");
console.log(`ZKP Engine Path:\n${zkpEnginePath}\n`);
console.log(`ZKP Engine Exists:\n${zkpEngineExists}\n`);
console.log(`Node Version:\n${process.version}\n`);
console.log(`Current Working Directory:\n${process.cwd()}\n`);
console.log(`ZKP Engine Available:\n${global.ZKP_ENGINE_AVAILABLE}`);
console.log("-------------------------------------------------");

if (!global.ZKP_ENGINE_AVAILABLE) {
  console.warn("\n  ⚠️  WARNING: ZKP Engine is NOT fully available on this deployment.");
  console.warn("  Please make sure 'zk-document-verification' and its 'node_modules' exist.\n");
}

// ─── Start server (Binds explicitly to 0.0.0.0) ──────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  ✅ api-server-new running on http://0.0.0.0:${PORT}`);
  console.log(`  📋 Health:  GET  http://0.0.0.0:${PORT}/api/health`);
  console.log(`  📤 Upload:  POST http://0.0.0.0:${PORT}/api/upload\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ❌ ERROR: Port ${PORT} is already in use.`);
    console.error(`  Another instance of the API server or process is already running on port ${PORT}.`);
    console.error(`  Please stop the existing server before starting a new instance.\n`);
    process.exit(1);
  } else {
    console.error('\n  ❌ Server error:', err.message);
    process.exit(1);
  }
});
