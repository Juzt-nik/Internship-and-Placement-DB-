const express = require("express");
const router = express.Router();
const placementController = require("../controllers/placementController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

router.get("/", verifyToken, placementController.getPlacements);

const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "placement_officer"),
  [
    body("student_id").isInt().withMessage("Student ID must be valid"),
    body("organization_id").isInt().withMessage("Organization ID must be valid"),
    body("job_role").notEmpty().withMessage("Job role required"),
    body("package_lpa").isFloat({ min: 0 }).withMessage("Package must be positive"),
    body("offer_type").notEmpty().withMessage("Offer type required")
  ],
  validate,
  placementController.addPlacement
);

module.exports = router;
