const express = require('express');
const ERPConnector = require('../integrations/erpConnector');
const HRConnector = require('../integrations/hrConnector');
const router = express.Router();

// Configure integrations
router.post('/erp/configure', (req, res) => {
  const { type, baseURL, apiKey } = req.body;
  
  try {
    const connector = new ERPConnector({ type, baseURL, apiKey });
    // Store config in session or database
    req.session = req.session || {};
    req.session.erpConfig = { type, baseURL, apiKey };
    
    res.json({ message: 'ERP integration configured successfully', type });
  } catch (error) {
    res.status(500).json({ error: 'Configuration failed' });
  }
});

// Configure HR integration
router.post('/hr/configure', (req, res) => {
  const { type, baseURL, apiKey } = req.body;
  
  try {
    const connector = new HRConnector({ type, baseURL, apiKey });
    req.session = req.session || {};
    req.session.hrConfig = { type, baseURL, apiKey };
    
    res.json({ message: 'HR integration configured successfully', type });
  } catch (error) {
    res.status(500).json({ error: 'Configuration failed' });
  }
});

// Sync ERP data
router.post('/erp/sync', async (req, res) => {
  try {
    const config = req.session?.erpConfig || {
      type: 'SAP',
      baseURL: 'https://api.mock-erp.com',
      apiKey: 'mock-key'
    };
    
    const connector = new ERPConnector(config);
    const energyData = await connector.getEnergyData();
    const financialData = await connector.getFinancialData();
    
    res.json({
      success: true,
      data: {
        energy: energyData,
        financial: financialData,
        syncTime: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'ERP sync failed', details: error.message });
  }
});

// Sync HR data
router.post('/hr/sync', async (req, res) => {
  try {
    const config = req.session?.hrConfig || {
      type: 'Workday',
      baseURL: 'https://api.mock-hr.com',
      apiKey: 'mock-key'
    };
    
    const connector = new HRConnector(config);
    const employeeData = await connector.getEmployeeData();
    const diversityData = await connector.getDiversityData();
    const safetyData = await connector.getSafetyData();
    
    res.json({
      success: true,
      data: {
        employees: employeeData,
        diversity: diversityData,
        safety: safetyData,
        syncTime: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'HR sync failed', details: error.message });
  }
});

// Get integration status
router.get('/status', (req, res) => {
  const status = {
    erp: {
      configured: !!req.session?.erpConfig,
      type: req.session?.erpConfig?.type || null,
      lastSync: req.session?.lastERPSync || null
    },
    hr: {
      configured: !!req.session?.hrConfig,
      type: req.session?.hrConfig?.type || null,
      lastSync: req.session?.lastHRSync || null
    }
  };
  
  res.json(status);
});

module.exports = router;