const express = require('express');
const axios = require('axios');

const router = express.Router();

// NOTE: Replace with a real ESG API if available
router.get('/', async (req, res) => {
  try {
    const response = await axios.get('https://api.example.com/esg/tcs'); // 🔁 Dummy URL
    res.json(response.data);
  } catch (err) {
    console.error('Error fetching ESG data:', err.message);
    res.status(500).json({ error: 'Failed to fetch live ESG data' });
  }
});

module.exports = router;
