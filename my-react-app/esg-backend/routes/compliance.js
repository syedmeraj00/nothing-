const express = require('express');
const db = require('../database/db');
const router = express.Router();

// Get compliance requirements
router.get('/requirements/:companyId?', (req, res) => {
  const { companyId } = req.params;
  const query = companyId 
    ? 'SELECT * FROM compliance_requirements WHERE company_id = ? OR company_id IS NULL'
    : 'SELECT * FROM compliance_requirements WHERE company_id IS NULL';
  
  const params = companyId ? [companyId] : [];
  
  db.all(query, params, (err, requirements) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(requirements);
  });
});

// Get XBRL mappings
router.get('/xbrl/:framework', (req, res) => {
  const { framework } = req.params;
  
  db.all(
    'SELECT * FROM xbrl_mappings WHERE framework = ? AND active = 1',
    [framework],
    (err, mappings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(mappings);
    }
  );
});

// Validate data against compliance rules
router.post('/validate', (req, res) => {
  const { framework, data } = req.body;
  
  db.all(
    'SELECT * FROM validation_rules WHERE active = 1',
    [],
    (err, rules) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      const validationResults = [];
      
      Object.entries(data).forEach(([metric, value]) => {
        const rule = rules.find(r => r.metric_name === metric);
        if (rule) {
          const isValid = value >= rule.min_value && value <= rule.max_value;
          validationResults.push({
            metric,
            isValid,
            message: isValid ? 'Valid' : rule.error_message
          });
        }
      });
      
      res.json({
        framework,
        overallValid: validationResults.every(r => r.isValid),
        results: validationResults
      });
    }
  );
});

module.exports = router;