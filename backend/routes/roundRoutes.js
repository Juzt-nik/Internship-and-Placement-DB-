const express = require("express");
const router = express.Router();
const roundController = require("../controllers/roundController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.put(
  "/:round_id",
  verifyToken,
  authorizeRoles("placement_officer", "admin"),
  roundController.updateRound
);

module.exports = router;