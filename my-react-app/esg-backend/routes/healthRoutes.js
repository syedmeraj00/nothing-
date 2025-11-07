const express = require('express');
const { sequelize } = require('../config/db');
const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'disconnected'
    });
  }
});

// Readiness check
router.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

module.exports = router;