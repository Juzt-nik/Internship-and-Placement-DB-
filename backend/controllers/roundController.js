const roundService = require("../services/roundService");

const updateRound = async (req, res) => {
  try {
    const round_id = req.params.round_id;
    const { result } = req.body;

    if (!result) {
      return res.status(400).json({ message: "Result required" });
    }

    const message = await roundService.updateRoundResult(round_id, result);

    res.json({ message });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  updateRound
};