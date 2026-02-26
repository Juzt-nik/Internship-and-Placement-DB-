const db = require("../config/db");

// Create user
const createUser = (username, password, role, student_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users (username, password, role, student_id, is_active)
      VALUES (?, ?, ?, ?, FALSE)
    `;

    db.query(query, [username, password, role, student_id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// Find user by username
const findUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT user_id, username, password, role, student_id, is_active
      FROM users
      WHERE username = ?
    `;

    db.query(query, [username], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);  // return single user
    });
  });
};

module.exports = {
  createUser,
  findUserByUsername
};
