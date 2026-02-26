const internshipService = require("../services/internshipService");

// GET ALL
const getInternships = async (req, res) => {
  try {
    const internships = await internshipService.getAllInternships();
    res.json(internships);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET BY ID
const getInternship = async (req, res) => {
  try {
    const internship = await internshipService.getInternshipById(req.params.id);
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE
const addInternship = async (req, res) => {
  try {
    await internshipService.createInternship(req.body);
    res.status(201).json({ message: "Internship created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE
const editInternship = async (req, res) => {
  try {
    await internshipService.updateInternship(req.params.id, req.body);
    res.json({ message: "Internship updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE
const removeInternship = async (req, res) => {
  try {
    await internshipService.deleteInternship(req.params.id);
    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getInternships,
  getInternship,
  addInternship,
  editInternship,
  removeInternship
};
