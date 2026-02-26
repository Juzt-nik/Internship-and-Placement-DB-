const applicationService = require("../services/applicationService");


// GET ALL
const getApplications = async (req, res) => {
  try {
    const applications = await applicationService.getAllApplications();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET BY ID
const getApplication = async (req, res) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// CREATE (Student applies)
const addApplication = async (req, res) => {
  try {
    const { student_id, opportunity_id } = req.body;

    if (!student_id || !opportunity_id) {
      return res.status(400).json({ message: "student_id and opportunity_id required" });
    }

    await applicationService.createApplication(student_id, opportunity_id);

    res.status(201).json({ message: "Applied successfully" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// DELETE
const removeApplication = async (req, res) => {
  try {
    await applicationService.deleteApplication(req.params.id);
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addRoundToApplication = async (req, res) => {
  try {
    const application_id = req.params.id;
    const { round_number, round_name, round_date } = req.body;

    if (!round_number || !round_name || !round_date) {
      return res.status(400).json({ message: "All fields required" });
    }

    await applicationService.addRound(
      application_id,
      round_number,
      round_name,
      round_date
    );

    res.status(201).json({ message: "Round added successfully" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markApplicationSelected = async (req, res) => {
  try {
    const application_id = req.params.id;

    const message = await applicationService.markAsSelected(application_id);

    res.json({ message });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getApplications,
  getApplication,
  addApplication,
  removeApplication,
  addRoundToApplication,
  markApplicationSelected
};
