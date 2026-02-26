const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");
const db = require("../config/db");  


const register = async (req, res) => {
  const { username, password, role, student_id } = req.body;

  try {
    if (!username || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await authService.createUser(username, hashedPassword, role, student_id);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT username, is_active FROM User WHERE username = ?", 
  [username],
  (err, rows) => {
    console.log("Direct DB check:", rows);
  }
);

  try {
    const user = await authService.findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log("USER OBJECT:", user);
    console.log("is_active value:", user.is_active);
    console.log("Type of is_active:", typeof user.is_active);
    console.log("Fresh read is_active:", user.is_active);

    // 🔥 NEW CHECK — block unverified accounts
    if (!user.is_active) {
      return res.status(403).json({
        message: "Account not verified yet."
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        student_id: user.student_id || null   // 🔥 include this
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login
};
