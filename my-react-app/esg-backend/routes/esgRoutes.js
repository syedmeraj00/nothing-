const express = require("express");
const router = express.Router();
const ESGData = require("../models/EsgData"); // ✅ consistent casing


// POST: Add new ESG data
router.post("/", async (req, res) => {
  try {
    const newEntry = await EsgData.create(req.body);
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error creating ESG entry:", error);
    res.status(500).json({ error: "Failed to create ESG data" });
  }
});

// GET: Fetch all ESG records
router.get("/", async (req, res) => {
  try {
    const records = await EsgData.findAll({ order: [["year", "DESC"]] });
    res.json(records);
  } catch (error) {
    console.error("Error fetching ESG records:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// GET: Get ESG data by company
router.get("/company/:name", async (req, res) => {
  try {
    const records = await EsgData.findAll({
      where: { companyName: req.params.name },
    });
    res.json(records);
  } catch (error) {
    console.error("Error fetching company ESG data:", error);
    res.status(500).json({ error: "Failed to fetch company data" });
  }
});

module.exports = router;
