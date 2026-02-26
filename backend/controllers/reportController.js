const reportService = require("../services/reportService");

const getDashboard = async (req, res) => {
  try {
    const filters = req.query;
    const report = await reportService.getDashboardReport(filters);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard
};