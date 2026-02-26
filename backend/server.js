require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed ❌", err);
  } else {
    console.log("Connected to MySQL Database ✅");
    connection.release();
  }
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Placement Management API Running 🚀");
});

// ── Routes (MUST be before app.listen) ──────────────────────────────────────
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/students",      require("./routes/studentRoutes"));
app.use("/api/organizations", require("./routes/organizationRoutes"));
app.use("/api/internships",   require("./routes/internshipRoutes"));
app.use("/api/applications",  require("./routes/applicationRoutes"));
app.use("/api/placements",    require("./routes/placementRoutes"));
app.use("/api/reports",       require("./routes/reportRoutes"));
app.use("/api/rounds",        require("./routes/roundRoutes"));

// ── Error handler (MUST be after routes) ────────────────────────────────────
app.use(require("./middleware/errorHandler"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});  