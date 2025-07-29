const express = require("express");
const router = express.Router();
const ESGData = require("../models/EsgData"); // ✅ consistent casing


router.get("/kpis", async (req, res) => {
  try {
    const latest = await ESGData.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!latest) {
      return res.status(404).json({ error: "No ESG data found" });
    }

    const esgScore = (
      (latest.environmentalScore + latest.socialScore + latest.governanceScore) / 3
    ).toFixed(2);

    res.json({
  companyName: latest.companyName, // ✅ Add this line
  esgScore: parseFloat(esgScore),
  co2Reduction: latest.co2Reduction || null,
  complianceRate: latest.complianceRate,
  sustainabilityIndex: latest.sustainabilityIndex,
});

  } catch (err) {
    console.error("KPI route error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
