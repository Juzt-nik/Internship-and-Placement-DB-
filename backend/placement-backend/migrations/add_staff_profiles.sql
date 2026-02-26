-- ============================================================
-- Migration: Add faculty_profiles and officer_profiles tables
-- Run this once against your existing MySQL database
-- ============================================================

-- Faculty profile table
CREATE TABLE IF NOT EXISTS faculty_profiles (
  faculty_profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL UNIQUE,           -- FK to users table (role='faculty' or 'hod')
  name               VARCHAR(150),
  email              VARCHAR(150),
  phone              VARCHAR(20),
  department         VARCHAR(100),
  designation        VARCHAR(100),                  -- e.g. Assistant Professor, HOD
  employee_id        VARCHAR(50),                   -- college staff ID
  specialization     VARCHAR(200),                  -- subjects / domains
  years_of_experience INT DEFAULT 0,
  profile_completed  TINYINT(1) DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_fp_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Placement officer profile table
CREATE TABLE IF NOT EXISTS officer_profiles (
  officer_profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id            INT NOT NULL UNIQUE,           -- FK to users table (role='placement_officer')
  name               VARCHAR(150),
  email              VARCHAR(150),
  phone              VARCHAR(20),
  employee_id        VARCHAR(50),
  designation        VARCHAR(100),                  -- e.g. Placement Officer, TPO Coordinator
  department         VARCHAR(100),                  -- their dept / cell they manage
  linkedin_url       VARCHAR(300),
  profile_completed  TINYINT(1) DEFAULT 0,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_op_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_fp_user ON faculty_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_op_user ON officer_profiles(user_id);
