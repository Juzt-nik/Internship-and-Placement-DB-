const studentService = require("../services/studentService");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

// GET ALL
const getStudents = async (req, res) => {
  try {
    const students = await studentService.getAllStudents();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
const getStudent = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE
const addStudent = async (req, res) => {
  try {
    const response = await studentService.createStudent(req.body);

    res.status(201).json({
      message: "Student shell created successfully",
      registration_token: response.token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const editStudent = async (req, res) => {
  try {
    await studentService.updateStudent(req.params.id, req.body);
    res.json({ message: "Student updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const removeStudent = async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const activateStudent = async (req, res) => {
  try {
    const { registration_token, password } = req.body;

    if (!registration_token || !password) {
      return res.status(400).json({ message: "Token and password required" });
    }

    db.query(
      "SELECT * FROM Student WHERE registration_token = ?",
      [registration_token],
      async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
          return res.status(400).json({ message: "Invalid token" });
        }

        const student = results[0];

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user account
        db.query(
          `INSERT INTO users (username, password, role, student_id, is_active)
           VALUES (?, ?, 'student', ?, FALSE)`,
          [student.email, hashedPassword, student.student_id],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            // Update student record
            db.query(
              `UPDATE Student
               SET profile_status = 'Submitted',
                   registration_token = NULL
               WHERE student_id = ?`,
              [student.student_id]
            );

            res.json({ message: "Account activated. Awaiting verification." });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// VERIFY STUDENT (Faculty / HOD / Placement Officer)
const verifyStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Check if student exists
    db.query(
      "SELECT * FROM Student WHERE student_id = ?",
      [studentId],
      (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
          return res.status(404).json({ message: "Student not found" });
        }

        // Update student status
        db.query(
          "UPDATE Student SET profile_status = 'Verified' WHERE student_id = ?",
          [studentId],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });

            // Activate user login
            db.query(
              "UPDATE users SET is_active = 1 WHERE student_id = ?",
              [studentId],
              (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });

                res.json({ message: "Student verified successfully." });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStudents,
  getStudent,
  addStudent,
  editStudent,
  removeStudent,
  activateStudent,
  verifyStudent
};
