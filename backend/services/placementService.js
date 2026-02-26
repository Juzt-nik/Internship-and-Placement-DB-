const db = require("../config/db");

const createPlacement = (data) => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT INTO Placement
      (student_id, organization_id, job_role, package_lpa, offer_date, joining_date, offer_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertQuery, [
      data.student_id,
      data.organization_id,
      data.job_role,
      data.package_lpa,
      data.offer_date,
      data.joining_date,
      data.offer_type
    ], (err, result) => {
      if (err) return reject(err);

      // Auto update student placement_status
      const updateQuery = `
        UPDATE Student
        SET placement_status = 'Placed'
        WHERE student_id = ?
      `;

      db.query(updateQuery, [data.student_id], (err2) => {
        if (err2) return reject(err2);
        resolve(result);
      });
    });
  });
};

const getAllPlacements = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT p.*, s.name AS student_name, o.organization_name
      FROM Placement p
      JOIN Student s ON p.student_id = s.student_id
      JOIN Organization o ON p.organization_id = o.organization_id
    `;

    db.query(query, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createPlacement,
  getAllPlacements
};
