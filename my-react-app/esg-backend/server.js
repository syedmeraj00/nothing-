require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./config/db");

const esgRoutes = require("./routes/esgRoutes");
const esgLiveRoute = require('./routes/esgLive');
const esgKpiRoutes = require('./routes/esgKpiRoutes'); // ✅ New line added

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/esg", esgRoutes);
app.use("/api/esg/live", esgLiveRoute);
app.use("/api/esg", esgKpiRoutes); // ✅ Mount KPI route

sequelize.authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connected.");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ DB connection error:", err));
