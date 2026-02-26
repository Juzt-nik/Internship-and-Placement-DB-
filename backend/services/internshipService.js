const db = require("../config/db");

// Get all internships
const getAllInternships = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT i.*, s.name AS student_name, o.organization_name
      FROM Internship i
      JOIN Student s ON i.student_id = s.student_id
      JOIN Organization o ON i.organization_id = o.organization_id
    `;
    db.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// Get internship by ID
const getInternshipById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Internship WHERE internship_id = ?", [id], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
};

// Create internship
const createInternship = (data) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO Internship
      (student_id, organization_id, internship_domain, start_date, end_date, duration_months, mode, stipend, internship_status, certificate_submitted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
      data.student_id,
      data.organization_id,
      data.internship_domain,
      data.start_date,
      data.end_date,
      data.duration_months,
      data.mode,
      data.stipend,
      data.internship_status,
      data.certificate_submitted
    ], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// Update internship
const updateInternship = (id, data) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE Internship SET
      internship_domain = ?,
      start_date = ?,
      end_date = ?,
      duration_months = ?,
      mode = ?,
      stipend = ?,
      internship_status = ?,
      certificate_submitted = ?
      WHERE internship_id = ?
    `;

    db.query(query, [
      data.internship_domain,
      data.start_date,
      data.end_date,
      data.duration_months,
      data.mode,
      data.stipend,
      data.internship_status,
      data.certificate_submitted,
      id
    ], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// Delete internship
const deleteInternship = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM Internship WHERE internship_id = ?", [id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  deleteInternship
};
