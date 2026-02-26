const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",               // change if needed
  password: "Sag@2006nik",  // put your MySQL password here
  database: "placement_db"
});

module.exports = db;

db.query("SELECT DATABASE()", (err, result) => {
  if (err) {
    console.error("DB check error:", err);
  } else {
    console.log("Backend connected to DB:", result);
  }
});
