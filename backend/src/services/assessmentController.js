const pool = require("../config/db");

const fail = (status, message) => Object.assign(new Error(message), { status });
const risk = (likelihood, severity) => {
  const score = likelihood * severity;
  return {
    score,
    level:
      score <= 4
        ? "Low"
        : score <= 9
          ? "Moderate"
          : score <= 16
            ? "High"
            : "Critical",
  };
};
const rating = (value, name) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5)
    throw fail(400, `${name} must be an integer from 1 to 5.`);
  return n;
};
const date = (value, name, required = false) => {
  if (!value && !required) return null;
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  )
    throw fail(400, `${name} must be a valid date.`);
  return value;
};
const text = (value, name, required = false) => {
  if (value != null && typeof value !== "string")
    throw fail(400, `${name} must be text.`);
  const result = value?.trim() || null;
  if (required && !result) throw fail(400, `${name} is required.`);
  return result;
};
function transition(action, existing, role, accomplishedDate) {
  if (!["save", "approve", "revision", "complete"].includes(action))
    throw fail(400, "Invalid review action.");
  if (action !== "save" && role !== "admin")
    throw fail(403, "Only administrators may review assessments.");
  if (action !== "save" && !existing)
    throw fail(409, "Save the assessment before reviewing it.");
  if (action === "complete") {
    if (existing.review_status !== "approved")
      throw fail(409, "Approve the assessment before resolving the report.");
    if (!accomplishedDate)
      throw fail(
        400,
        "Enter the accomplished date before resolving the report.",
      );
    return { assessment: "resolved", report: "resolved", review: "approved" };
  }
  if (action === "approve")
    return {
      assessment: "action_required",
      report: "under_review",
      review: "approved",
    };
  if (action === "revision")
    return {
      assessment: "under_review",
      report: "under_review",
      review: "needs_revision",
    };
  // Any edit is a new submission: previous approval cannot apply to changed content.
  return {
    assessment: "under_review",
    report: "under_review",
    review: "pending",
  };
}
function valuesFor(type, body) {
  const values = {
    assessment_date: date(body.assessmentDate, "Assessment date", true),
    responsible_unit: text(body.responsibleUnit, "Responsible unit"),
    target_date: date(body.targetDate, "Target date"),
    accomplished_date: date(body.accomplishedDate, "Accomplished date"),
  };
  if (values.target_date && values.target_date < values.assessment_date)
    throw fail(400, "Target date cannot precede the assessment date.");
  if (
    values.accomplished_date &&
    (values.accomplished_date < values.assessment_date ||
      values.accomplished_date >
        new Intl.DateTimeFormat("en-CA", {
          timeZone: process.env.APP_TIMEZONE || "Asia/Manila",
        }).format(new Date()))
  )
    throw fail(
      400,
      "Accomplished date must be between the assessment date and today.",
    );
  if (type === "hazard") {
    values.likelihood = rating(body.likelihood, "Likelihood");
    values.severity = rating(body.severity, "Severity");
    // PostgreSQL generates hazard risk_score and risk_level from these ratings.
    Object.assign(values, {
      control_action: text(body.controlAction, "Control action", true),
      expected_output: text(body.expectedOutput, "Expected output"),
      remarks: text(body.remarks, "Remarks"),
    });
  } else {
    for (const [column, field, required] of [
      ["incident_finding", "incidentFinding", true],
      ["immediate_cause", "immediateCause"],
      ["contributing_factors", "contributingFactors"],
      ["root_cause", "rootCause"],
      ["actual_consequence", "actualConsequence"],
      ["potential_consequence", "potentialConsequence"],
      ["corrective_action", "correctiveAction", true],
      ["preventive_action", "preventiveAction"],
      ["osho_remarks", "oshoRemarks"],
    ])
      values[column] = text(body[field], field, required);
    values.initial_likelihood = rating(
      body.initialLikelihood,
      "Initial likelihood",
    );
    values.initial_severity = rating(body.initialSeverity, "Initial severity");
    const initial = risk(values.initial_likelihood, values.initial_severity);
    values.initial_risk_score = initial.score;
    values.initial_risk_level = initial.level;
    const hasResidual =
      (body.residualLikelihood != null && body.residualLikelihood !== "") ||
      (body.residualSeverity != null && body.residualSeverity !== "");
    values.residual_likelihood = hasResidual
      ? rating(body.residualLikelihood, "Residual likelihood")
      : null;
    values.residual_severity = hasResidual
      ? rating(body.residualSeverity, "Residual severity")
      : null;
    const residual = hasResidual
      ? risk(values.residual_likelihood, values.residual_severity)
      : null;
    values.residual_risk_score = residual?.score ?? null;
    values.residual_risk_level = residual?.level ?? null;
  }
  return values;
}
function assessmentController(type) {
  // Identifiers only come from these two application-controlled configurations.
  if (!["hazard", "incident"].includes(type))
    throw new Error("Invalid assessment type");
  const table = `${type}_assessments`,
    reports = `${type}_reports`,
    key = `${type}_id`;
  const canAccess = (req, report) =>
    req.user.role === "admin" || report.reported_by === req.user.user_id;
  const save = (updating) => async (req, res, next) => {
    let client;
    try {
      client = await pool.connect();
      await client.query("BEGIN");
      let existing;
      let reportId = req.body[`${type}Id`];
      if (updating) {
        existing = (
          await client.query(
            `SELECT * FROM ${table} WHERE assessment_id = $1 FOR UPDATE`,
            [req.params.id],
          )
        ).rows[0];
        if (!existing) throw fail(404, "Assessment not found.");
        reportId = existing[key];
        if (
          req.body[`${type}Id`] &&
          String(req.body[`${type}Id`]) !== String(reportId)
        )
          throw fail(400, "An assessment cannot be moved to another report.");
      }
      if (!reportId) throw fail(400, "Report ID is required.");
      const report = (
        await client.query(
          `SELECT * FROM ${reports} WHERE ${key} = $1 FOR UPDATE`,
          [reportId],
        )
      ).rows[0];
      if (!report || !canAccess(req, report))
        throw fail(404, "Report not found.");
      if (
        !updating &&
        (
          await client.query(
            `SELECT assessment_id FROM ${table} WHERE ${key} = $1`,
            [reportId],
          )
        ).rows.length
      )
        throw fail(
          409,
          "This report already has an assessment. Refresh to edit it.",
        );
      const values = valuesFor(type, req.body);
      const action = req.body.reviewAction || "save";
      const state = transition(
        action,
        existing,
        req.user.role,
        values.accomplished_date,
      );
      if (action === "revision" && !(values.remarks || values.osho_remarks))
        throw fail(400, "Explain the required revision in the remarks.");
      Object.assign(values, {
        assessment_status: state.assessment,
        review_status: state.review,
        reviewed_by: action === "save" ? null : req.user.user_id,
        reviewed_at: action === "save" ? null : new Date(),
      });
      let result;
      if (updating) {
        const columns = Object.keys(values);
        result = await client.query(
          `UPDATE ${table} SET ${columns.map((c, i) => `${c} = $${i + 1}`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE assessment_id = $${columns.length + 1} RETURNING *`,
          [...Object.values(values), req.params.id],
        );
      } else {
        Object.assign(values, {
          [key]: reportId,
          assessed_by: req.user.user_id,
        });
        const columns = Object.keys(values);
        result = await client.query(
          `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map((_, i) => `$${i + 1}`).join(", ")}) RETURNING *`,
          Object.values(values),
        );
      }
      await client.query(
        `UPDATE ${reports} SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE ${key} = $2`,
        [state.report, reportId],
      );
      await client.query("COMMIT");
      res
        .status(updating ? 200 : 201)
        .json({
          message:
            action === "complete" ? "Report resolved." : "Assessment saved.",
          assessment: result.rows[0],
        });
    } catch (error) {
      if (client) await client.query("ROLLBACK");
      if (error.status)
        return res.status(error.status).json({ error: error.message });
      if (error.code === "23505")
        return res
          .status(409)
          .json({ error: "An assessment already exists for this report." });
      next(error);
    } finally {
      client?.release();
    }
  };
  const read = (mode) => async (req, res, next) => {
    try {
      const params = [req.user.user_id, req.user.role === "admin"];
      let filter = "";
      if (mode !== "all") {
        params.push(mode === "id" ? req.params.id : req.params[`${type}Id`]);
        filter = `AND a.${mode === "id" ? "assessment_id" : key} = $3`;
      }
      const result = await pool.query(
        `SELECT a.*, r.status AS report_status FROM ${table} a JOIN ${reports} r ON r.${key} = a.${key} WHERE ($2::boolean OR r.reported_by = $1) ${filter} ORDER BY a.created_at DESC, a.assessment_id DESC`,
        params,
      );
      if (mode === "id" && !result.rows.length)
        return res.status(404).json({ error: "Assessment not found." });
      res.json(
        mode === "id"
          ? { assessment: result.rows[0] }
          : { assessments: result.rows },
      );
    } catch (error) {
      next(error);
    }
  };
  return {
    createAssessment: save(false),
    updateAssessment: save(true),
    getAssessmentById: read("id"),
    getAllAssessments: read("all"),
    [`getAssessmentsBy${type === "hazard" ? "Hazard" : "Incident"}`]:
      read("report"),
  };
}
module.exports = { assessmentController, transition, valuesFor, risk };
