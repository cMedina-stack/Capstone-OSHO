const pool = require("../config/db");
const { reportsQuery } = require("../services/reportQueries");
const getAdminAssessments = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT *, report_title AS title FROM (${reportsQuery}) reports WHERE status <> 'rejected' ORDER BY (status = 'resolved'), (assessment_id IS NOT NULL), report_date DESC, report_id DESC`,
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};
module.exports = { getAdminAssessments };
