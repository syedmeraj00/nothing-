const express = require("express");
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const ESGData = require("../models/EsgData");
const { authenticateToken, requireRole } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();


// POST: Add new ESG data (new format)
router.post("/data", async (req, res) => {
  try {
    const { companyName, sector, region, reportingYear, environmental, social, governance, userId } = req.body;
    
    console.log('Saving ESG data:', { companyName, userId, environmental, social, governance });
    
    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }
    
    // Try to create with new fields, fallback to basic fields if columns don't exist
    try {
      const newEntry = await ESGData.create({
        companyName,
        year: parseInt(reportingYear) || new Date().getFullYear(),
        environmentalScore: 0,
        socialScore: 0, 
        governanceScore: 0,
        sector: sector || null,
        region: region || null,
        environmental: JSON.stringify(environmental || {}),
        social: JSON.stringify(social || {}),
        governance: JSON.stringify(governance || {}),
        userId: userId || 'admin@esgenius.com'
      });
      
      console.log('ESG data saved successfully:', newEntry.id);
      res.status(201).json({ success: true, data: newEntry });
    } catch (dbError) {
      console.log('Database error, trying basic format:', dbError.message);
      // Fallback to basic format if new columns don't exist
      const basicEntry = await ESGData.create({
        companyName,
        year: parseInt(reportingYear) || new Date().getFullYear(),
        environmentalScore: 0,
        socialScore: 0, 
        governanceScore: 0
      });
      
      console.log('Basic ESG data saved:', basicEntry.id);
      res.status(201).json({ success: true, data: basicEntry, note: 'Saved in basic format' });
    }
  } catch (error) {
    console.error("Error creating ESG entry:", error);
    res.status(500).json({ error: "Failed to create ESG data: " + error.message });
  }
});

// POST: Add new ESG data (legacy format)
router.post("/", authenticateToken, requireRole(['esg_manager', 'admin']), invalidateCache('/api/esg'), async (req, res) => {
  try {
    const { companyName, year, environmentalScore, socialScore, governanceScore, complianceRate, sustainabilityIndex } = req.body;
    
    // Input validation
    if (!companyName || !year || environmentalScore === undefined || socialScore === undefined || governanceScore === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    if (companyName.length > 100 || year < 2000 || year > 2100) {
      return res.status(400).json({ error: "Invalid input values" });
    }
    
    const newEntry = await ESGData.create({
      companyName,
      year: parseInt(year),
      environmentalScore: parseFloat(environmentalScore),
      socialScore: parseFloat(socialScore),
      governanceScore: parseFloat(governanceScore),
      complianceRate: complianceRate ? parseFloat(complianceRate) : null,
      sustainabilityIndex: sustainabilityIndex || null
    });
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating ESG entry:", error);
    res.status(500).json({ error: "Failed to create ESG data" });
  }
});

// GET: Fetch ESG data by user
router.get("/data/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching data for user:', userId);
    
    const records = await ESGData.findAll({ 
      where: { userId: decodeURIComponent(userId) },
      order: [["createdAt", "DESC"]] 
    });
    
    console.log('Found records:', records.length);
    
    // Parse JSON fields
    const processedRecords = records.map(record => {
      const data = record.toJSON();
      return {
        ...data,
        environmental: data.environmental ? JSON.parse(data.environmental) : {},
        social: data.social ? JSON.parse(data.social) : {},
        governance: data.governance ? JSON.parse(data.governance) : {}
      };
    });
    
    res.json({ success: true, data: processedRecords });
  } catch (error) {
    console.error("Error fetching ESG data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// GET: Fetch all ESG records (legacy)
router.get("/", cacheMiddleware(300), async (req, res) => {
  try {
    const records = await ESGData.findAll({ order: [["year", "DESC"]] });
    res.json(records);
  } catch (error) {
    console.error("Error fetching ESG records:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// GET: Get ESG data by company
router.get("/company/:name", async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || name.length > 100 || !/^[a-zA-Z0-9\s\-_&.]+$/.test(name)) {
      return res.status(400).json({ error: "Invalid company name" });
    }
    
    const records = await ESGData.findAll({
      where: { companyName: { [ESGData.sequelize.Op.eq]: name } },
    });
    res.json(records);
  } catch (error) {
    console.error("Error fetching company ESG data:", error);
    res.status(500).json({ error: "Failed to fetch company data" });
  }
});

// POST: Bulk upload CSV
router.post('/bulk-upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const results = [];
    const errors = [];
    
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        let success = 0;
        
        for (const [index, row] of results.entries()) {
          try {
            if (!row.Category || !row.Metric || !row.Value) {
              throw new Error('Missing required fields');
            }

            await ESGData.create({
              companyName: row.Company || 'Default Company',
              year: parseInt(row.Year) || new Date().getFullYear(),
              environmentalScore: row.Category === 'Environmental' ? parseFloat(row.Value) : 0,
              socialScore: row.Category === 'Social' ? parseFloat(row.Value) : 0,
              governanceScore: row.Category === 'Governance' ? parseFloat(row.Value) : 0
            });
            
            success++;
          } catch (error) {
            errors.push(`Row ${index + 2}: ${error.message}`);
          }
        }
        
        fs.unlinkSync(req.file.path);
        
        res.json({
          success: true,
          message: `Processed ${success} records successfully`,
          processed: success,
          errors: errors
        });
      });
      
  } catch (error) {
    console.error('Bulk upload error:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
