const pool = require("../config/db");
const { reportsQuery } = require("../services/reportQueries");
const getAllBuildings = async (req, res, next) => {
  try {
    res.json(
      (await pool.query("SELECT * FROM buildings ORDER BY building_name")).rows,
    );
  } catch (error) {
    next(error);
  }
};
const getCampusMap = async (req, res, next) => {
  try {
    const result = await pool.query(`WITH reports AS (${reportsQuery})
    SELECT b.*, count(r.report_id) AS report_count,
      count(*) FILTER (WHERE r.report_type='hazard') AS hazard_count,
      count(*) FILTER (WHERE r.report_type='incident') AS incident_count,
      count(r.assessment_id) AS assessed_count,
      count(r.report_id) FILTER (WHERE r.assessment_id IS NULL) AS unassessed_count,
      count(*) FILTER (WHERE r.status IN ('submitted','under_review')) AS active_count,
      count(*) FILTER (WHERE r.status='submitted') AS submitted_count,
      count(*) FILTER (WHERE r.status='under_review') AS under_review_count,
      count(*) FILTER (WHERE r.status='resolved') AS resolved_count,
      CASE WHEN max(r.risk_score) FILTER (WHERE r.status IN ('submitted','under_review')) > 16 THEN 'critical'
           WHEN max(r.risk_score) FILTER (WHERE r.status IN ('submitted','under_review')) > 9 THEN 'high'
           WHEN max(r.risk_score) FILTER (WHERE r.status IN ('submitted','under_review')) > 4 THEN 'moderate'
           WHEN max(r.risk_score) FILTER (WHERE r.status IN ('submitted','under_review')) > 0 THEN 'low' ELSE 'none' END AS risk_level
    FROM buildings b LEFT JOIN reports r ON r.building_id=b.building_id AND r.status NOT IN ('rejected','draft')
    GROUP BY b.building_id ORDER BY b.building_name`);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
const getBuildingReports = async (req, res, next) => {
  try {
    // Campus views expose safety summaries, not the affected person's private details.
    const result = await pool.query(
      `SELECT report_id, report_type, report_title, report_date, exact_area, status, assessment_id, assessment_status, risk_score, risk_level, categories FROM (${reportsQuery}) reports WHERE building_id=$1 AND status NOT IN ('draft','rejected') ORDER BY report_date DESC, report_id DESC`,
      [req.params.buildingId],
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
module.exports = { getAllBuildings, getCampusMap, getBuildingReports };
