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
const generateProofRouter = require("./routes/generateProof");
const downloadRouter = require("./routes/download");
const verifyProofRouter = require("./routes/verifyProof");
const ocrRouter = require("./routes/ocr");


const app = express();
const PORT = process.env.PORT || 3001;

// ─── Ensure uploads directory exists ─────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api/generate-proof", generateProofRouter);
app.use("/api/download", downloadRouter);
app.use("/api/verify-proof", verifyProofRouter);
app.use("/api/ocr", ocrRouter);

// ─── Error handling (must be after routes) ──────────────────────
app.use(errorHandler);

// ─── Start server ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  ✅ api-server-new running on http://localhost:${PORT}`);
  console.log(`  📋 Health:  GET  http://localhost:${PORT}/api/health`);
  console.log(`  📤 Upload:  POST http://localhost:${PORT}/api/upload\n`);

});
