const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
  "/dashboard",
  verifyToken,
  authorizeRoles("faculty", "hod", "placement_officer"),
  reportController.getDashboard
);

module.exports = router;