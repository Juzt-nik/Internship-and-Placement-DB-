const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");


// GET all applications
router.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "placement_officer", "faculty"),
  applicationController.getApplications
);

router.post(
  "/:id/round",
  verifyToken,
  authorizeRoles("placement_officer", "admin"),
  applicationController.addRoundToApplication
);

router.put(
  "/:id/select",
  verifyToken,
  authorizeRoles("placement_officer", "admin"),
  applicationController.markApplicationSelected
);

// GET by ID
router.get(
  "/:id",
  verifyToken,
  applicationController.getApplication
);


// CREATE (Student applies)
router.post(
  "/",
  verifyToken,
  authorizeRoles("student"),
  [
    body("student_id").isInt().withMessage("Valid student ID required"),
    body("opportunity_id").isInt().withMessage("Valid opportunity ID required")
  ],
  validate,
  applicationController.addApplication
);


// DELETE (admin only)
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("admin"),
  applicationController.removeApplication
);


module.exports = router;