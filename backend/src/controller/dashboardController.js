const pool = require("../config/db");

// ============================================================
// GET ADMIN DASHBOARD
// ============================================================

const getAdminDashboard = async (req, res) => {
  try {
    const monthlyReportsResult = await pool.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', CURRENT_DATE) - INTERVAL '11 months',
          date_trunc('month', CURRENT_DATE),
          INTERVAL '1 month'
        ) AS month
      )

      SELECT
        TO_CHAR(m.month, 'Mon') AS month,

        (
          SELECT COUNT(*)
          FROM hazard_reports hr
          WHERE date_trunc('month', hr.created_at) = m.month
        ) AS hazard_reports,

        (
          SELECT COUNT(*)
          FROM incident_reports ir
          WHERE date_trunc('month', ir.created_at) = m.month
        ) AS incident_reports

      FROM months m
      ORDER BY m.month;
    `);

    return res.status(200).json({
      success: true,
      monthlyReports: monthlyReportsResult.rows,
    });
  } catch (error) {
    console.error("=================================");
    console.error("ADMIN DASHBOARD ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      error: "Failed to load admin dashboard",
    });
  }
};

// ============================================================
// GET CAMPUS SAFETY ALERTS
// ============================================================

const getCampusSafetyAlerts = async (req, res, next) => {
  try {
    const { reportsQuery } = require('../services/reportQueries');
    const result = await pool.query(`SELECT report_id, report_type, report_title, report_date, building_id, building_name, exact_area, status, assessment_id, assessment_status, risk_score, risk_level FROM (${reportsQuery}) reports WHERE status IN ('submitted','under_review') ORDER BY risk_score DESC NULLS LAST, report_date DESC LIMIT 10`);
    res.json(result.rows);
  } catch (error) { next(error); }
};

// ============================================================
// GET REPORTS BY BUILDING
// ============================================================

const getReportsByBuilding = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.building_id,
        b.building_name,

        COUNT(DISTINCT hr.hazard_id) AS hazard_reports,

        COUNT(DISTINCT ir.incident_id) AS incident_reports,

        (
          COUNT(DISTINCT hr.hazard_id) +
          COUNT(DISTINCT ir.incident_id)
        ) AS total_reports

      FROM buildings b

      LEFT JOIN hazard_reports hr
        ON hr.building_id = b.building_id

      LEFT JOIN incident_reports ir
        ON ir.building_id = b.building_id

      GROUP BY
        b.building_id,
        b.building_name

      HAVING
        COUNT(DISTINCT hr.hazard_id) +
        COUNT(DISTINCT ir.incident_id) > 0

      ORDER BY
        total_reports DESC;
    `);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("=================================");
    console.error("REPORTS BY BUILDING ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      error: "Failed to load reports by building",
      message: error.message,
    });
  }
};

// ============================================================
// GET ADMIN ASSESSMENTS
// ============================================================

const { getAdminAssessments } = require('./adminAssessmentController');

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getCampusSafetyAlerts,
  getAdminDashboard,
  getReportsByBuilding,
  getAdminAssessments,
};
