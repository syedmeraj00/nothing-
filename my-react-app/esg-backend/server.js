require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/database");
const { securityHeaders, createRateLimit, sanitizeQuery } = require('./middleware/security');
const { requestLogger, errorLogger } = require('./middleware/logging');

// ✅ Import all route modules (with fallbacks for missing routes)
const esgRoutes = require("./routes/esgRoutes");
const esgRoutes2 = require('./routes/esg');           // ✅ FIX: Import esg.js routes
const esgLiveRoute = require('./routes/esgLive');
const integrationRoutes = require('./routes/integrations');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/healthRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(securityHeaders);
app.use(createRateLimit());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeQuery);
app.use(requestLogger);

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/esg", esgRoutes2);     // ✅ Mount esg.js FIRST for /api/esg/data endpoint (raw sqlite3)
app.use("/api/esg", esgRoutes);      // POST /api/esg (legacy Sequelize route)
app.use("/api/esg/live", esgLiveRoute);
app.use("/api/integration", integrationRoutes);

// Error handling middleware (must be last)
app.use(errorLogger);

// Start server directly without waiting for Sequelize sync
// The esg.js routes use raw sqlite3, not Sequelize
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 ESG Backend ready for connections`);
});

// Try to sync Sequelize in background (non-blocking)
sequelize.authenticate()
  .then(() => {
    console.log(`✅ Sequelize DB connected (dialect=${sequelize.getDialect()}).`);
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log(`� Sequelize models synced`);
  })
  .catch((err) => console.error("⚠️  Sequelize warning:", err.message));
