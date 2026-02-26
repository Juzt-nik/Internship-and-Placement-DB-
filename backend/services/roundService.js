const db = require("../config/db");

const updateRoundResult = (round_id, result) => {
  return new Promise((resolve, reject) => {

    if (!["Cleared", "Eliminated"].includes(result)) {
      return reject(new Error("Invalid result value"));
    }

    // Get round info
    db.query(
      "SELECT * FROM application_round WHERE round_id = ?",
      [round_id],
      (err, roundResults) => {
        if (err) return reject(err);
        if (roundResults.length === 0) {
          return reject(new Error("Round not found"));
        }

        const round = roundResults[0];

        // Update round result
        db.query(
          "UPDATE application_round SET result = ? WHERE round_id = ?",
          [result, round_id],
          (err2) => {
            if (err2) return reject(err2);

            // If eliminated → reject application
            if (result === "Eliminated") {
              db.query(
                "UPDATE application SET status = 'Rejected' WHERE application_id = ?",
                [round.application_id],
                (err3) => {
                  if (err3) return reject(err3);
                  resolve("Application rejected.");
                }
              );
            } else {
              resolve("Round updated successfully.");
            }
          }
        );
      }
    );
  });
};

module.exports = {
  updateRoundResult
};