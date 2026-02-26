const db = require("../config/db");

const getDashboardReport = (filters) => {
  return new Promise((resolve, reject) => {

    let where = " WHERE 1=1 ";
    let values = [];

    if (filters.year  && filters.year !== "") {
      where += " AND s.year_of_study = ? ";
      values.push(filters.year);
    }

    if (filters.cgpa_min && filters.cgpa_min !== "") {
      where += " AND s.cgpa >= ? ";
      values.push(filters.cgpa_min);
    }

    if (filters.cgpa_max && filters.cgpa_max !== "") {
      where += " AND s.cgpa <= ? ";
      values.push(filters.cgpa_max);
    }

    if (filters.organization_id && filters.organization_id !== "") {
      where += " AND o.organization_id = ? ";
      values.push(filters.organization_id);
    }

    if (filters.type && filters.type !== "") {
      where += " AND op.type = ? ";
      values.push(filters.type);
    }

    const summaryQuery = `
      SELECT
        COUNT(CASE WHEN a.status='Selected' AND op.type='Placement' THEN 1 END) AS totalPlaced,
        COUNT(CASE WHEN op.type='Internship' THEN 1 END) AS totalInternships,
        COUNT(CASE WHEN op.type='Placement' THEN 1 END) AS totalPlacements
      FROM application a
      JOIN Student s ON a.student_id = s.student_id
      JOIN opportunity op ON a.opportunity_id = op.opportunity_id
      JOIN organization o ON op.organization_id = o.organization_id
      ${where}
    `;

    db.query(summaryQuery, values, (err, summary) => {
      if (err) return reject(err);

      const stageQuery = `
        SELECT a.status, COUNT(*) as count
        FROM application a
        JOIN Student s ON a.student_id = s.student_id
        JOIN opportunity op ON a.opportunity_id = op.opportunity_id
        JOIN organization o ON op.organization_id = o.organization_id
        ${where}
        GROUP BY a.status
      `;

      db.query(stageQuery, values, (err2, stageData) => {
        if (err2) return reject(err2);

        const orgQuery = `
          SELECT o.organization_name, COUNT(*) as count
          FROM application a
          JOIN opportunity op ON a.opportunity_id = op.opportunity_id
          JOIN organization o ON op.organization_id = o.organization_id
          WHERE a.status='Selected'
          GROUP BY o.organization_name
        `;

        db.query(orgQuery, (err3, orgData) => {
          if (err3) return reject(err3);

        // Placement by Year
const yearQuery = `
  SELECT s.year_of_study AS year, COUNT(*) AS count
  FROM application a
  JOIN Student s ON a.student_id = s.student_id
  JOIN opportunity op ON a.opportunity_id = op.opportunity_id
  WHERE a.status='Selected' AND op.type='Placement'
  GROUP BY s.year_of_study
`;

db.query(yearQuery, (err4, yearData) => {
  if (err4) return reject(err4);

  // Internship vs Placement ratio
  const ratioQuery = `
    SELECT op.type, COUNT(*) AS count
    FROM application a
    JOIN opportunity op ON a.opportunity_id = op.opportunity_id
    GROUP BY op.type
  `;

  db.query(ratioQuery, (err5, ratioData) => {
    if (err5) return reject(err5);

    // Internship stats by stage
    const internshipStatsQuery = `
      SELECT a.status, COUNT(*) AS count
      FROM application a
      JOIN opportunity op ON a.opportunity_id = op.opportunity_id
      WHERE op.type='Internship'
      GROUP BY a.status
    `;

    db.query(internshipStatsQuery, (err6, internshipData) => {
      if (err6) return reject(err6);

      resolve({
        summary: summary[0],
        studentsByStage: stageData,
        placementByOrganization: orgData,
        placementByYear: yearData,
        internshipVsPlacementRatio: ratioData,
        internshipStats: internshipData
      });
    });
  });
});

          resolve({
            summary: summary[0],
            studentsByStage: stageData,
            placementByOrganization: orgData
          });
        });
      });
    });
  });
};

module.exports = {
  getDashboardReport
};