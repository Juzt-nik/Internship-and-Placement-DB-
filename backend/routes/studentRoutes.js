const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

// GET all students
router.get("/", verifyToken, studentController.getStudents);

// UPDATE student
router.put(
  "/:id/verify",
  verifyToken,
  authorizeRoles("faculty", "hod", "placement_officer"),
  studentController.verifyStudent
);

// GET single student
router.get("/:id", verifyToken, studentController.getStudent);

// CREATE student (admin & placement_officer only)
router.post(
  "/",
  verifyToken,
  authorizeRoles("hod", "placement_officer"),
  [
    body("register_number")
      .notEmpty()
      .withMessage("Register number required"),
    body("email")
      .isEmail()
      .withMessage("Valid email required")
  ],
  validate,
  studentController.addStudent
);

router.put(
  "/:id",
  verifyToken,
  studentController.editStudent
);

// DELETE student (admin only)
router.delete("/:id", verifyToken, authorizeRoles("admin"), studentController.removeStudent);

router.post("/activate", studentController.activateStudent);

module.exports = router;