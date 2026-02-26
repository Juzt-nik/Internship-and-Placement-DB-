const db = require("../config/db");

// Get all organizations
const getAllOrganizations = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Organization", (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// Get organization by ID
const getOrganizationById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Organization WHERE organization_id = ?", [id], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
};

// Create organization
const createOrganization = (data) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO Organization
      (organization_name, organization_type, location, contact_details)
      VALUES (?, ?, ?, ?)
    `;

    db.query(query, [
      data.organization_name,
      data.organization_type,
      data.location,
      data.contact_details
    ], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// Update organization
const updateOrganization = (id, data) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE Organization SET
      organization_name = ?,
      organization_type = ?,
      location = ?,
      contact_details = ?
      WHERE organization_id = ?
    `;

    db.query(query, [
      data.organization_name,
      data.organization_type,
      data.location,
      data.contact_details,
      id
    ], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

// Delete organization
const deleteOrganization = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM Organization WHERE organization_id = ?", [id], (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization
};
