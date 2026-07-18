/**
 * Health check route.
 * GET /api/health — returns server status, timestamp, and uptime.
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    zkpEngineAvailable: global.ZKP_ENGINE_AVAILABLE || false,
    nodeVersion: process.version
  });
});

module.exports = router;
