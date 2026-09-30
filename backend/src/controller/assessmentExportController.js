const pool = require("../config/db");
const { reportsQuery } = require("../services/reportQueries");
const { createAssessmentWorkbook } = require("../services/assessmentWorkbook");

exports.exportAssessments = async (req, res, next) => {
  try {
    const { type = "all", status = "all", search = "" } = req.query;
    if (
      !["all", "hazard", "incident"].includes(type) ||
      ![
        "all",
        "pending",
        "under_review",
        "action_required",
        "monitoring",
        "in_progress",
        "completed",
        "closed",
        "resolved",
        "submitted",
        "rejected",
      ].includes(status) ||
      typeof search !== "string" ||
      search.length > 200
    )
      return res.status(400).json({ error: "Invalid export filters." });
    const result = await pool.query(
      `
      SELECT r.*, concat_ws(' ', assessor.first_name,assessor.last_name) AS assessor_name,
        to_jsonb(ia) AS incident_details
      FROM (${reportsQuery}) r
      LEFT JOIN users assessor ON assessor.user_id=r.assessed_by
      LEFT JOIN incident_assessments ia ON r.report_type='incident' AND ia.assessment_id=r.assessment_id
      WHERE r.assessment_id IS NOT NULL AND r.status <> 'rejected'
        AND ($1='all' OR r.report_type=$1)
        AND ($2='all' OR r.assessment_status=$2)
        AND strpos(lower(concat_ws(' ',r.report_title,r.building_name,r.exact_area,r.report_type,r.employee_name,r.employee_email,r.assessment_status,r.report_status,r.review_status,r.risk_level,r.risk_score,r.likelihood,r.severity,r.control_action,r.responsible_unit)),lower($3))>0
      ORDER BY r.assessment_date DESC,r.report_type,r.report_id DESC
      LIMIT 10001`,
      [type, status, search.trim()],
    );
    if (!result.rows.length)
      return res
        .status(404)
        .json({ error: "No saved assessments match these filters." });
    if (result.rows.length > 10000)
      return res
        .status(413)
        .json({
          error:
            "This export exceeds 10,000 assessments. Narrow the type, status, or search filter.",
        });
    const generatedAt = new Date();
    const workbook = createAssessmentWorkbook(result.rows, {
      type,
      status,
      search: search.trim(),
      generatedAt,
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: process.env.APP_TIMEZONE || "Asia/Manila",
    }).format(generatedAt);
    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="OSHO-${type}-assessments-${date}.xlsx"`,
      "Cache-Control": "no-store",
    });
    res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
};
