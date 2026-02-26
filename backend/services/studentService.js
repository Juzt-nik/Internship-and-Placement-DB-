const db = require("../config/db");

// Get All Students
const getAllStudents = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Student", (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// Get Student By ID
const getStudentById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Student WHERE student_id = ?", [id], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
};

// Create Student
const { v4: uuidv4 } = require("uuid");

const createStudent = (data) => {
  return new Promise((resolve, reject) => {
    const token = uuidv4();

    const query = `
      INSERT INTO Student
      (register_number, email, registration_token, profile_status, is_active)
      VALUES (?, ?, ?, 'Pending', FALSE)
    `;

    db.query(query, [
      data.register_number,
      data.email,
      token
    ], (err, result) => {
      if (err) reject(err);
      resolve({ result, token });
    });
  });
};

// Update Student
const updateStudent = (id, data) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE Student SET
      name = ?,
      department = ?,
      year_of_study = ?,
      cgpa = ?,
      email = ?,
      phone = ?,
      resume_link = ?,
      skill_set = ?
      WHERE student_id = ?
    `;

    db.query(query, [
      data.name,
      data.department,
      data.year_of_study,
      data.cgpa,
      data.email,
      data.phone,
      data.resume_link,
      data.skill_set,
      id
    ], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// Delete Student
const deleteStudent = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM Student WHERE student_id = ?", [id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};
