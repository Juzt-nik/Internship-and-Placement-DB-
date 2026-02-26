const placementService = require("../services/placementService");

const addPlacement = async (req, res) => {
  try {
    await placementService.createPlacement(req.body);
    res.status(201).json({ message: "Placement created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPlacements = async (req, res) => {
  try {
    const placements = await placementService.getAllPlacements();
    res.json(placements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addPlacement,
  getPlacements
};
