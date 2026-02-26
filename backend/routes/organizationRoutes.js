const express = require("express");
const router = express.Router();
const organizationController = require("../controllers/organizationController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// GET all organizations
router.get("/", verifyToken, organizationController.getOrganizations);

// GET by ID
router.get("/:id", verifyToken, organizationController.getOrganization);

// CREATE (admin + placement_officer)
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

router.post(
  "/",
  verifyToken,
  authorizeRoles("admin", "placement_officer"),
  [
    body("organization_name").notEmpty().withMessage("Organization name required"),
    body("organization_type")
      .isIn(["Corporate", "Academic", "Research", "Government", "Startup"])
      .withMessage("Invalid organization type"),
    body("location").notEmpty().withMessage("Location required"),
    body("contact_details").notEmpty().withMessage("Contact details required")
  ],
  validate,
  organizationController.addOrganization
);

// UPDATE (admin + placement_officer)
router.put("/:id", verifyToken, authorizeRoles("admin", "placement_officer"), organizationController.editOrganization);

// DELETE (admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), organizationController.removeOrganization);

module.exports = router;
