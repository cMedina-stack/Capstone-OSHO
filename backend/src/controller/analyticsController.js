const pool = require("../config/db");
const { reportsQuery } = require("../services/reportQueries");
exports.getAnalytics = async (req, res, next) => {
  try {
    const [risk, categories] = await Promise.all([
      pool.query(
        `SELECT risk_level AS severity, count(*)::integer AS reports FROM (${reportsQuery}) reports WHERE status IN ('submitted','under_review') AND risk_level IS NOT NULL GROUP BY risk_level ORDER BY max(risk_score) DESC`,
      ),
      pool.query(
        `SELECT category AS name, count(*)::integer AS value FROM (${reportsQuery}) reports CROSS JOIN LATERAL unnest(categories) category WHERE status NOT IN ('draft','rejected') GROUP BY category ORDER BY value DESC, name`,
      ),
    ]);
    res.json({ riskDistribution: risk.rows, categories: categories.rows });
  } catch (error) {
    next(error);
  }
};
