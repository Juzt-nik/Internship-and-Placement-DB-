const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// ─── LOGIN ─────────────────────────────────────────────────────────────────

const login = (username, password) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM users WHERE username = ?',
      [username],
      async (err, results) => {
        if (err) return reject(err);
        if (!results.length) return reject(new Error('Invalid credentials'));

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return reject(new Error('Invalid credentials'));

        const token = jwt.sign(
          { user_id: user.user_id, username: user.username, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: '8h' }
        );

        resolve({ token, role: user.role, user_id: user.user_id, username: user.username });
      }
    );
  });
};

// ─── CREATE PLACEMENT OFFICER (admin only) ────────────────────────────────

const createPlacementOfficer = (username, password, email) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);

      db.query(
        `INSERT INTO users (username, password_hash, role, email)
         VALUES (?, ?, 'placement_officer', ?)`,
        [username, hash, email || null],
        (err2, result) => {
          if (err2) return reject(err2);

          const userId = result.insertId;

          // Auto-create an empty officer profile row
          db.query(
            `INSERT INTO officer_profiles (user_id, email) VALUES (?, ?)`,
            [userId, email || null],
            (err3) => {
              if (err3) console.warn('officer_profiles insert warning:', err3.message);
              resolve({ user_id: userId, username, role: 'placement_officer' });
            }
          );
        }
      );
    });
  });
};

// ─── CREATE FACULTY (admin only) ─────────────────────────────────────────

const createFaculty = (username, password, email, role) => {
  const allowedRoles = ['faculty', 'hod'];
  const userRole = allowedRoles.includes(role) ? role : 'faculty';

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);

      db.query(
        `INSERT INTO users (username, password_hash, role, email)
         VALUES (?, ?, ?, ?)`,
        [username, hash, userRole, email || null],
        (err2, result) => {
          if (err2) return reject(err2);

          const userId = result.insertId;

          // Auto-create an empty faculty profile row
          db.query(
            `INSERT INTO faculty_profiles (user_id, email) VALUES (?, ?)`,
            [userId, email || null],
            (err3) => {
              if (err3) console.warn('faculty_profiles insert warning:', err3.message);
              resolve({ user_id: userId, username, role: userRole });
            }
          );
        }
      );
    });
  });
};

// ─── GET FACULTY PROFILE ──────────────────────────────────────────────────

const getFacultyProfile = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT fp.*, u.username, u.role
       FROM faculty_profiles fp
       JOIN users u ON u.user_id = fp.user_id
       WHERE fp.user_id = ?`,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        if (!results.length) {
          // Return an empty shell if no profile row yet
          return resolve({ user_id: userId, profile_completed: false });
        }
        resolve(results[0]);
      }
    );
  });
};

// ─── UPDATE FACULTY PROFILE ───────────────────────────────────────────────

const updateFacultyProfile = (userId, data) => {
  const {
    name, email, phone, department, designation,
    employee_id, specialization, years_of_experience
  } = data;

  return new Promise((resolve, reject) => {
    // Upsert pattern: insert if not exists, else update
    db.query(
      `INSERT INTO faculty_profiles
         (user_id, name, email, phone, department, designation, employee_id, specialization, years_of_experience, profile_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         phone = VALUES(phone),
         department = VALUES(department),
         designation = VALUES(designation),
         employee_id = VALUES(employee_id),
         specialization = VALUES(specialization),
         years_of_experience = VALUES(years_of_experience),
         profile_completed = 1`,
      [userId, name, email, phone, department, designation, employee_id, specialization, years_of_experience || 0],
      (err, result) => {
        if (err) return reject(err);
        resolve({ success: true, user_id: userId });
      }
    );
  });
};

// ─── GET OFFICER PROFILE ──────────────────────────────────────────────────

const getOfficerProfile = (userId) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT op.*, u.username, u.role
       FROM officer_profiles op
       JOIN users u ON u.user_id = op.user_id
       WHERE op.user_id = ?`,
      [userId],
      (err, results) => {
        if (err) return reject(err);
        if (!results.length) {
          return resolve({ user_id: userId, profile_completed: false });
        }
        resolve(results[0]);
      }
    );
  });
};

// ─── UPDATE OFFICER PROFILE ───────────────────────────────────────────────

const updateOfficerProfile = (userId, data) => {
  const { name, email, phone, employee_id, designation, department, linkedin_url } = data;

  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO officer_profiles
         (user_id, name, email, phone, employee_id, designation, department, linkedin_url, profile_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         phone = VALUES(phone),
         employee_id = VALUES(employee_id),
         designation = VALUES(designation),
         department = VALUES(department),
         linkedin_url = VALUES(linkedin_url),
         profile_completed = 1`,
      [userId, name, email, phone, employee_id, designation, department, linkedin_url],
      (err, result) => {
        if (err) return reject(err);
        resolve({ success: true, user_id: userId });
      }
    );
  });
};

// ─── LIST ALL FACULTY (admin) ─────────────────────────────────────────────

const listFaculty = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT u.user_id, u.username, u.role, u.email AS login_email,
              fp.faculty_profile_id, fp.name, fp.email, fp.phone,
              fp.department, fp.designation, fp.employee_id,
              fp.specialization, fp.years_of_experience, fp.profile_completed
       FROM users u
       LEFT JOIN faculty_profiles fp ON fp.user_id = u.user_id
       WHERE u.role IN ('faculty', 'hod')
       ORDER BY u.user_id DESC`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

// ─── LIST ALL OFFICERS (admin) ────────────────────────────────────────────

const listOfficers = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT u.user_id, u.username, u.role, u.email AS login_email,
              op.officer_profile_id, op.name, op.email, op.phone,
              op.employee_id, op.designation, op.department,
              op.linkedin_url, op.profile_completed
       FROM users u
       LEFT JOIN officer_profiles op ON op.user_id = u.user_id
       WHERE u.role = 'placement_officer'
       ORDER BY u.user_id DESC`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

module.exports = {
  login,
  createPlacementOfficer,
  createFaculty,
  getFacultyProfile,
  updateFacultyProfile,
  getOfficerProfile,
  updateOfficerProfile,
  listFaculty,
  listOfficers,
};
