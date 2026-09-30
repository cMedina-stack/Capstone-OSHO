const pool = require("../config/db");

const getQuickReviews = async (req, res) => {
  try {
    // ==========================================
    // 1. TOTAL REPORTS
    // ==========================================
    const totalReportsResult = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM hazard_reports
        )
        +
        (
          SELECT COUNT(*)
          FROM incident_reports
        ) AS total_reports
    `);

    // ==========================================
    // 2. HAZARD REPORTS
    // ==========================================
    const hazardReportsResult = await pool.query(`
      SELECT COUNT(*) AS hazard_reports
      FROM hazard_reports
    `);

    // ==========================================
    // 3. INCIDENT REPORTS
    // ==========================================
    const incidentReportsResult = await pool.query(`
      SELECT COUNT(*) AS incident_reports
      FROM incident_reports
    `);

    // ==========================================
    // 4. PENDING ASSESSMENTS
    // ==========================================
    const pendingAssessmentsResult = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM hazard_reports hr
          WHERE NOT EXISTS (
            SELECT 1
            FROM hazard_assessments ha
            WHERE ha.hazard_id = hr.hazard_id
          )
          AND hr.status IN ('submitted', 'under_review')
        )
        +
        (
          SELECT COUNT(*)
          FROM incident_reports ir
          WHERE NOT EXISTS (
            SELECT 1
            FROM incident_assessments ia
            WHERE ia.incident_id = ir.incident_id
          )
          AND ir.status IN ('submitted', 'under_review')
        ) AS pending_assessments
    `);

    // ==========================================
    // 5. HIGH RISK HAZARDS
    //
    // High = 10-16
    // Critical = 17-25
    // ==========================================
    const highRiskHazardsResult = await pool.query(`
      SELECT COUNT(*) AS high_risk_hazards
      FROM hazard_assessments ha JOIN hazard_reports hr USING(hazard_id)
      WHERE ha.risk_level IN ('High', 'Critical') AND hr.status IN ('submitted','under_review')
    `);

    // ==========================================
    // 6. OPEN CORRECTIVE ACTIONS
    //
    // For hazards:
    // assessment_status = action_required,
    // monitoring, or in_progress
    //
    // For incidents:
    // assessment_status = action_required,
    // monitoring, or under_review
    // ==========================================
    const openCorrectiveActionsResult = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM hazard_assessments
          WHERE assessment_status IN (
            'in_progress',
            'pending',
            'under_review',
            'action_required',
            'monitoring'
          )
          AND control_action IS NOT NULL
          AND TRIM(control_action) <> ''
        )
        +
        (
          SELECT COUNT(*)
          FROM incident_assessments
          WHERE assessment_status IN (
            'action_required',
            'monitoring',
            'under_review'
          )
          AND corrective_action IS NOT NULL
          AND TRIM(corrective_action) <> ''
        ) AS open_corrective_actions
    `);

    // ==========================================
    // RESPONSE
    // ==========================================
    return res.status(200).json({
      success: true,
      data: {
        totalReports: Number(totalReportsResult.rows[0].total_reports),

        hazardReports: Number(hazardReportsResult.rows[0].hazard_reports),

        incidentReports: Number(incidentReportsResult.rows[0].incident_reports),

        pendingAssessments: Number(
          pendingAssessmentsResult.rows[0].pending_assessments,
        ),

        highRiskHazards: Number(
          highRiskHazardsResult.rows[0].high_risk_hazards,
        ),

        openCorrectiveActions: Number(
          openCorrectiveActionsResult.rows[0].open_corrective_actions,
        ),
      },
    });
  } catch (error) {
    console.error("=================================");
    console.error("QUICK REVIEWS ERROR");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);
    console.error("=================================");

    return res.status(500).json({
      success: false,
      error: "Failed to load quick review data",
    });
  }
};

module.exports = {
  getQuickReviews,
};
