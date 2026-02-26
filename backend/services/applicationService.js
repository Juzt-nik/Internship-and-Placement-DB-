const db = require("../config/db");

// Get all applications
const getAllApplications = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        a.application_id,
        a.student_id,
        s.name AS student_name,
        a.opportunity_id,
        o.organization_name,
        op.role_title,
        a.status,
        a.current_round,
        a.application_date
      FROM application a
      JOIN Student s ON a.student_id = s.student_id
      JOIN opportunity op ON a.opportunity_id = op.opportunity_id
      JOIN organization o ON op.organization_id = o.organization_id
    `;

    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


// Get application by ID
const getApplicationById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM application
      WHERE application_id = ?
    `;

    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};


// Create application (Student applies)
const createApplication = (student_id, opportunity_id) => {
  return new Promise((resolve, reject) => {

    // Prevent duplicate application
    const checkQuery = `
      SELECT * FROM application
      WHERE student_id = ? AND opportunity_id = ?
    `;

    db.query(checkQuery, [student_id, opportunity_id], (err, results) => {
      if (err) return reject(err);

      if (results.length > 0) {
        return reject(new Error("Already applied to this opportunity"));
      }

      const insertQuery = `
        INSERT INTO application (student_id, opportunity_id)
        VALUES (?, ?)
      `;

      db.query(insertQuery, [student_id, opportunity_id], (err2, result) => {
        if (err2) return reject(err2);
        resolve(result);
      });
    });
  });
};


// Delete application
const deleteApplication = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "DELETE FROM application WHERE application_id = ?",
      [id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

// Add round to application
const addRound = (application_id, round_number, round_name, round_date) => {
  return new Promise((resolve, reject) => {

    // Check application exists
    db.query(
      "SELECT * FROM application WHERE application_id = ?",
      [application_id],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          return reject(new Error("Application not found"));
        }

        // Insert round
        const insertQuery = `
          INSERT INTO application_round
          (application_id, round_number, round_name, round_date)
          VALUES (?, ?, ?, ?)
        `;

        db.query(
          insertQuery,
          [application_id, round_number, round_name, round_date],
          (err2) => {
            if (err2) return reject(err2);

            // Update application current_round + status
            db.query(
              `UPDATE application
               SET current_round = ?, status = 'In Process'
               WHERE application_id = ?`,
              [round_number, application_id],
              (err3) => {
                if (err3) return reject(err3);
                resolve();
              }
            );
          }
        );
      }
    );
  });
};

const markAsSelected = (application_id) => {
  return new Promise((resolve, reject) => {

    // Get application info
    db.query(
      "SELECT * FROM application WHERE application_id = ?",
      [application_id],
      (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          return reject(new Error("Application not found"));
        }

        const application = results[0];

        // Update application status
        db.query(
          "UPDATE application SET status = 'Selected' WHERE application_id = ?",
          [application_id],
          (err2) => {
            if (err2) return reject(err2);

            // Update student placement status
            db.query(
              "UPDATE Student SET placement_status = 'Placed' WHERE student_id = ?",
              [application.student_id],
              (err3) => {
                if (err3) return reject(err3);

                resolve("Student marked as selected and placed.");
              }
            );
          }
        );
      }
    );
  });
};

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  deleteApplication,
  addRound,
  markAsSelected
};