const express = require('express');
const db = require('../database/db');
const router = express.Router();

// View all users
router.get('/users', (req, res) => {
  db.all('SELECT id, email, full_name, role, status, created_at FROM users', (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(users);
  });
});

// View all companies
router.get('/companies', (req, res) => {
  db.all('SELECT * FROM companies', (err, companies) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(companies);
  });
});

// View all ESG data
router.get('/esg-data', (req, res) => {
  db.all(`
    SELECT e.*, c.name as company_name, u.email as user_email 
    FROM esg_data e 
    JOIN companies c ON e.company_id = c.id 
    JOIN users u ON e.user_id = u.id 
    ORDER BY e.created_at DESC
  `, (err, data) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(data);
  });
});

// View all ESG scores
router.get('/esg-scores', (req, res) => {
  db.all(`
    SELECT s.*, c.name as company_name, u.email as user_email 
    FROM esg_scores s 
    JOIN companies c ON s.company_id = c.id 
    JOIN users u ON s.user_id = u.id 
    ORDER BY s.calculated_at DESC
  `, (err, scores) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(scores);
  });
});

// Database stats
router.get('/stats', (req, res) => {
  db.serialize(() => {
    const stats = {};
    
    db.get('SELECT COUNT(*) as count FROM users', (err, result) => {
      stats.users = result?.count || 0;
      
      db.get('SELECT COUNT(*) as count FROM companies', (err, result) => {
        stats.companies = result?.count || 0;
        
        db.get('SELECT COUNT(*) as count FROM esg_data', (err, result) => {
          stats.esgData = result?.count || 0;
          
          db.get('SELECT COUNT(*) as count FROM esg_scores', (err, result) => {
            stats.esgScores = result?.count || 0;
            res.json(stats);
          });
        });
      });
    });
  });
});

module.exports = router;