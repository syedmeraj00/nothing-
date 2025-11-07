const express = require('express');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const esgRoutes = require('./routes/esg');
const adminRoutes = require('./routes/admin');
const complianceRoutes = require('./routes/compliance');
const integrationRoutes = require('./routes/integrations-simple');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(session({
  secret: 'esg-app-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/esg', esgRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Enhanced ESG Modules
app.use('/api/data-collection', require('./routes/dataCollection'));
app.use('/api/reporting', require('./routes/reporting'));
app.use('/api/risk-management', require('./routes/riskManagement'));
app.use('/api/stakeholders', require('./routes/stakeholders'));
app.use('/api/workflow', require('./routes/workflow'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ESG Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`ESG Backend server running on port ${PORT}`);
});