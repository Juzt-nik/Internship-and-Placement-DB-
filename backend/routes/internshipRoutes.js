const express = require("express");
const router = express.Router();
const internshipController = require("../controllers/internshipController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET all internships
router.get("/", verifyToken, internshipController.getInternships);

// GET by ID
router.get("/:id", verifyToken, internshipController.getInternship);

// CREATE (admin + placement_officer)
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "placement_officer"),
  [
    body("student_id").isInt().withMessage("Valid student ID required"),
    body("organization_id").isInt().withMessage("Valid organization ID required"),
    body("internship_domain").notEmpty().withMessage("Internship domain required"),
    body("start_date").isDate().withMessage("Valid start date required"),
    body("end_date").isDate().withMessage("Valid end date required"),
    body("duration_months").isInt({ min: 1 }).withMessage("Duration must be positive"),
    body("stipend").isFloat({ min: 0 }).withMessage("Stipend must be positive")
  ],
  validate,
  internshipController.addInternship
);

// UPDATE (admin + placement_officer)
router.put("/:id", verifyToken, authorizeRoles("admin", "placement_officer"), internshipController.editInternship);

// DELETE (admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), internshipController.removeInternship);

module.exports = router;
