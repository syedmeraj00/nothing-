const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const router = express.Router();

const JWT_SECRET = 'esg-app-secret-key';

// User signup
router.post('/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
      [email, hashedPassword, fullName],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Account request submitted! Awaiting admin approval.' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Check for admin
  if (email === 'admin@esgenius.com' && password === 'admin123') {
    const token = jwt.sign({ userId: 1, email, role: 'admin' }, JWT_SECRET);
    return res.json({ token, user: { email, role: 'admin' } });
  }
  
  db.get(
    'SELECT * FROM users WHERE email = ? AND status = "approved"',
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials or account not approved' });
      }
      
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET
      );
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          email: user.email, 
          fullName: user.full_name, 
          role: user.role 
        } 
      });
    }
  );
});

// Get pending users (admin only)
router.get('/pending-users', (req, res) => {
  db.all(
    'SELECT id, email, full_name, created_at FROM users WHERE status = "pending"',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    }
  );
});

// Approve user (admin only)
router.put('/approve-user/:email', (req, res) => {
  const { email } = req.params;
  
  db.run(
    'UPDATE users SET status = "approved", approved_at = CURRENT_TIMESTAMP WHERE email = ?',
    [email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'User approved successfully' });
    }
  );
});

// Reject user (admin only)
router.delete('/reject-user/:email', (req, res) => {
  const { email } = req.params;
  
  db.run('DELETE FROM users WHERE email = ? AND status = "pending"', [email], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User rejected successfully' });
  });
});

module.exports = router;