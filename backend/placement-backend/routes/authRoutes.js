const express = require('express');
const router = express.Router();
const {
  login,
  createPlacementOfficer,
  createFaculty,
  getFacultyProfile,
  updateFacultyProfile,
  getOfficerProfile,
  updateOfficerProfile,
  listFaculty,
  listOfficers,
} = require('../services/authService');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// ─── PUBLIC ───────────────────────────────────────────────────────────────

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'username and password required' });

    const data = await login(username, password);
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: err.message || 'Login failed' });
  }
});

// ─── ADMIN: CREATE PLACEMENT OFFICER ─────────────────────────────────────

// POST /api/auth/register/officer
router.post(
  '/register/officer',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password)
        return res.status(400).json({ error: 'username and password required' });

      const result = await createPlacementOfficer(username, password, email);
      res.status(201).json({ message: 'Placement officer created', ...result });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ error: 'Username already exists' });
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── ADMIN: CREATE FACULTY / HOD ─────────────────────────────────────────

// POST /api/auth/register/faculty
router.post(
  '/register/faculty',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const { username, password, email, role } = req.body;
      if (!username || !password)
        return res.status(400).json({ error: 'username and password required' });

      const result = await createFaculty(username, password, email, role);
      res.status(201).json({ message: 'Faculty account created', ...result });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY')
        return res.status(409).json({ error: 'Username already exists' });
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── ADMIN: LIST FACULTY ──────────────────────────────────────────────────

// GET /api/auth/faculty
router.get(
  '/faculty',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const list = await listFaculty();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── ADMIN: LIST OFFICERS ─────────────────────────────────────────────────

// GET /api/auth/officers
router.get(
  '/officers',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    try {
      const list = await listOfficers();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── FACULTY PROFILE ──────────────────────────────────────────────────────

// GET /api/auth/profile/faculty
// Returns the profile of the currently logged-in faculty/hod user
router.get(
  '/profile/faculty',
  authenticate,
  authorize('faculty', 'hod', 'admin'),
  async (req, res) => {
    try {
      // Admin can pass ?user_id=X, faculty always gets their own
      const userId = req.user.role === 'admin' && req.query.user_id
        ? parseInt(req.query.user_id)
        : req.user.user_id;

      const profile = await getFacultyProfile(userId);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/auth/profile/faculty
// Faculty/HOD saves their own profile details
router.put(
  '/profile/faculty',
  authenticate,
  authorize('faculty', 'hod'),
  async (req, res) => {
    try {
      const result = await updateFacultyProfile(req.user.user_id, req.body);
      res.json({ message: 'Faculty profile updated', ...result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── OFFICER PROFILE ──────────────────────────────────────────────────────

// GET /api/auth/profile/officer
// Returns the profile of the currently logged-in placement officer
router.get(
  '/profile/officer',
  authenticate,
  authorize('placement_officer', 'admin'),
  async (req, res) => {
    try {
      const userId = req.user.role === 'admin' && req.query.user_id
        ? parseInt(req.query.user_id)
        : req.user.user_id;

      const profile = await getOfficerProfile(userId);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PUT /api/auth/profile/officer
// Placement officer saves their own profile details
router.put(
  '/profile/officer',
  authenticate,
  authorize('placement_officer'),
  async (req, res) => {
    try {
      const result = await updateOfficerProfile(req.user.user_id, req.body);
      res.json({ message: 'Officer profile updated', ...result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
