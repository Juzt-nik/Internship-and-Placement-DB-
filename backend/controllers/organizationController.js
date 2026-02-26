const organizationService = require("../services/organizationService");

// GET ALL
const getOrganizations = async (req, res) => {
  try {
    const organizations = await organizationService.getAllOrganizations();
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
const getOrganization = async (req, res) => {
  try {
    const organization = await organizationService.getOrganizationById(req.params.id);
    if (!organization) return res.status(404).json({ message: "Organization not found" });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE
const addOrganization = async (req, res) => {
  try {
    await organizationService.createOrganization(req.body);
    res.status(201).json({ message: "Organization created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const editOrganization = async (req, res) => {
  try {
    await organizationService.updateOrganization(req.params.id, req.body);
    res.json({ message: "Organization updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const removeOrganization = async (req, res) => {
  try {
    await organizationService.deleteOrganization(req.params.id);
    res.json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOrganizations,
  getOrganization,
  addOrganization,
  editOrganization,
  removeOrganization
};
