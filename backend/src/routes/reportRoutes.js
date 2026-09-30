const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authenticateToken = require("../middleware/auth");

// ============================================================
// GET /api/reports/my-reports
// Get all reports belonging to the logged-in employee
// ============================================================

router.get("/my-reports", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { reportsQuery } = require('../services/reportQueries');
    const result = await pool.query(`SELECT * FROM (${reportsQuery}) reports WHERE reported_by=$1 ORDER BY report_date DESC, created_at DESC`, [userId]);

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("GET MY REPORTS ERROR:", error);

    return res.status(500).json({
      error: "Failed to retrieve your reports",
      message: error.message,
    });
  }
});

// ============================================================
// GET /api/reports/my-reports/:reportType/:reportId
// Get a specific report belonging to the logged-in employee
// ============================================================

router.get(
  "/my-reports/:reportType/:reportId",
  authenticateToken,
  async (req, res) => {
    try {
      const { reportType, reportId } = req.params;
      const userId = req.user?.user_id;

      // --------------------------------------------------------
      // Authentication
      // --------------------------------------------------------

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      // --------------------------------------------------------
      // Validate report type
      // --------------------------------------------------------

      if (!["hazard", "incident"].includes(reportType)) {
        return res.status(400).json({
          error: "Invalid report type",
        });
      }

      // --------------------------------------------------------
      // Validate report ID
      // --------------------------------------------------------

      if (!reportId) {
        return res.status(400).json({
          error: "Report ID is required",
        });
      }

      let result;

      // ========================================================
      // HAZARD
      // ========================================================

      if (reportType === "hazard") {
        result = await pool.query(
          `
          SELECT

            -- --------------------------------------------------
            -- Report information
            -- --------------------------------------------------

            hr.hazard_id AS report_id,
            'hazard' AS report_type,

            hr.report_title,
            hr.report_date,

            hr.building_id,
            b.building_name,

            hr.exact_area,
            hr.description,

            -- --------------------------------------------------
            -- Hazard details
            -- --------------------------------------------------

            hr.risk_associated,
            hr.preventive_action,
            hr.action_taken,
            hr.affected_others,

            -- --------------------------------------------------
            -- Hazard status
            -- --------------------------------------------------

            hr.status,
            hr.created_at,
            hr.updated_at,

            -- --------------------------------------------------
            -- Hazard types
            -- --------------------------------------------------

            (
              SELECT ARRAY_AGG(
                hrt.hazard_type
                ORDER BY hrt.hazard_type
              )
              FROM hazard_report_types hrt
              WHERE hrt.hazard_id = hr.hazard_id
            ) AS hazard_types,

            -- --------------------------------------------------
            -- Affected groups
            -- --------------------------------------------------

            (
              SELECT ARRAY_AGG(
                hra.affected_type
                ORDER BY hra.affected_type
              )
              FROM hazard_report_affected hra
              WHERE hra.hazard_id = hr.hazard_id
            ) AS affected_types,

            -- ==================================================
            -- HAZARD ASSESSMENT
            -- ==================================================

            ha.assessment_id,
            ha.assessment_date,
            ha.assessed_by,

            ha.likelihood,
            ha.severity,
            ha.risk_score,
            ha.risk_level,

            ha.control_action,
            ha.responsible_unit,
            ha.expected_output,
            ha.target_date,

            ha.assessment_status,
            ha.accomplished_date,
            ha.remarks,

            -- --------------------------------------------------
            -- Assessment review
            -- --------------------------------------------------

            ha.review_status,
            ha.reviewed_by,
            ha.reviewed_at,

            ha.created_at AS assessment_created_at,
            ha.updated_at AS assessment_updated_at

          FROM hazard_reports hr

          INNER JOIN buildings b
            ON b.building_id = hr.building_id

          LEFT JOIN hazard_assessments ha
            ON ha.hazard_id = hr.hazard_id

          WHERE hr.hazard_id = $1
            AND ($3::boolean OR hr.reported_by = $2)
          `,
          [reportId, userId, req.user.role === "admin"],
        );
      }

      // ========================================================
      // INCIDENT
      // ========================================================

      if (reportType === "incident") {
        result = await pool.query(
          `
          SELECT

            -- --------------------------------------------------
            -- Report information
            -- --------------------------------------------------

            ir.incident_id AS report_id,
            'incident' AS report_type,

            NULL AS report_title,

            ir.report_date,

            ir.building_id,
            b.building_name,

            ir.exact_area,

            ir.description,

            -- --------------------------------------------------
            -- Incident-specific fields
            -- --------------------------------------------------

            ir.name,
            ir.age,
            ir.sex,
            ir.contact_number,

            ir.incident_type_others,
            ir.incident_nature_others,

            ir.injury_details,

            ir.intervention_done,
            ir.action_taken,

            ir.witness_name,
            ir.witness_designation,
            ir.witness_contact_number,

            -- --------------------------------------------------
            -- Generic fields
            -- --------------------------------------------------

            ia.assessment_id,
            ia.assessment_date,
            ia.assessment_status,
            ia.initial_risk_level AS risk_level,
            ia.initial_risk_score AS risk_score,
            ia.corrective_action,
            ia.responsible_unit,
            ia.target_date,
            ia.accomplished_date,
            ia.review_status,
            ia.osho_remarks,
            ARRAY(SELECT incident_type FROM incident_types WHERE incident_id=ir.incident_id) AS incident_types,
            ARRAY(SELECT incident_nature FROM incident_natures WHERE incident_id=ir.incident_id) AS incident_natures,
            ARRAY(SELECT workplace_role FROM incident_workplace_roles WHERE incident_id=ir.incident_id) AS workplace_roles,
            NULL AS risk_associated,
            NULL AS preventive_action,
            NULL AS affected_others,

            ir.status,

            ir.created_at,
            ir.updated_at

          FROM incident_reports ir

          INNER JOIN buildings b
            ON b.building_id = ir.building_id

          LEFT JOIN incident_assessments ia ON ia.incident_id=ir.incident_id
          WHERE ir.incident_id = $1
            AND ($3::boolean OR ir.reported_by = $2)
          `,
          [reportId, userId, req.user.role === "admin"],
        );
      }

      // --------------------------------------------------------
      // Report not found
      // --------------------------------------------------------

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Report not found",
        });
      }

      // --------------------------------------------------------
      // Return report
      // --------------------------------------------------------

      return res.status(200).json({
        report: result.rows[0],
      });
    } catch (error) {
      console.error("GET REPORT DETAILS ERROR:", error);

      return res.status(500).json({
        error: "Failed to retrieve report",
        message: error.message,
      });
    }
  },
);

module.exports = router;
