const pool = require("../config/db");

// ============================================================
// CREATE HAZARD REPORT
// ============================================================

const createHazard = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      reportTitle,
      reportDate,
      buildingId,
      exactLocation,
      hazardType,
      affected,
      affectedOthers,
      reportDescription,
      riskAssociated,
      preventiveAction,
      actionTaken,
    } = req.body;

    // --------------------------------------------------------
    // Validate required fields
    // --------------------------------------------------------

    if (
      !reportTitle ||
      !reportDate ||
      !buildingId ||
      !exactLocation ||
      !Array.isArray(hazardType) ||
      hazardType.length === 0 ||
      !Array.isArray(affected) ||
      affected.length === 0 ||
      !reportDescription ||
      !riskAssociated ||
      !preventiveAction
    ) {
      return res.status(400).json({
        error: "Please complete all required fields",
      });
    }

    await client.query("BEGIN");

    // --------------------------------------------------------
    // Get logged-in user's UUID
    // --------------------------------------------------------

    const reportedBy = req.user?.user_id || null;

    if (!reportedBy) {
      await client.query("ROLLBACK");

      return res.status(401).json({
        error: "User authentication required",
      });
    }

    // --------------------------------------------------------
    // 1. Insert main hazard report
    // --------------------------------------------------------

    const hazardResult = await client.query(
      `
      INSERT INTO hazard_reports (
        report_title,
        report_date,
        building_id,
        exact_area,
        description,
        risk_associated,
        preventive_action,
        action_taken,
        affected_others,
        reported_by
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      )
      RETURNING *
      `,
      [
        reportTitle.trim(),
        reportDate,
        buildingId,
        exactLocation.trim(),
        reportDescription.trim(),
        riskAssociated.trim(),
        preventiveAction.trim(),
        actionTaken?.trim() || null,
        affectedOthers?.trim() || null,
        reportedBy,
      ],
    );

    const hazard = hazardResult.rows[0];

    // --------------------------------------------------------
    // 2. Insert hazard types
    // --------------------------------------------------------

    for (const type of hazardType) {
      await client.query(
        `
        INSERT INTO hazard_report_types (
          hazard_id,
          hazard_type
        )
        VALUES ($1, $2)
        `,
        [hazard.hazard_id, type],
      );
    }

    // --------------------------------------------------------
    // 3. Insert affected groups
    // --------------------------------------------------------

    for (const person of affected) {
      await client.query(
        `
        INSERT INTO hazard_report_affected (
          hazard_id,
          affected_type
        )
        VALUES ($1, $2)
        `,
        [hazard.hazard_id, person],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Hazard recorded successfully",
      hazard,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CREATE HAZARD ERROR:", error);

    return res.status(500).json({
      error: "Failed to record hazard",
      details: error.message,
    });
  } finally {
    client.release();
  }
};

// ============================================================
// GET MY RECENT HAZARDS
// ============================================================

const getMyRecentHazards = async (req, res) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const result = await pool.query(
      `
      SELECT
        hr.hazard_id,
        hr.report_title,
        hr.report_date,

        hr.building_id,
        b.building_name,

        hr.exact_area,
        hr.description,

        hr.risk_associated,
        hr.preventive_action,
        hr.action_taken,
        hr.affected_others,

        hr.status,

        ARRAY_AGG(
          DISTINCT hrt.hazard_type
          ORDER BY hrt.hazard_type
        ) FILTER (
          WHERE hrt.hazard_type IS NOT NULL
        ) AS hazard_types,

        ARRAY_AGG(
          DISTINCT hra.affected_type
          ORDER BY hra.affected_type
        ) FILTER (
          WHERE hra.affected_type IS NOT NULL
        ) AS affected_types

      FROM hazard_reports hr

      JOIN buildings b
        ON b.building_id = hr.building_id

      LEFT JOIN hazard_report_types hrt
        ON hrt.hazard_id = hr.hazard_id

      LEFT JOIN hazard_report_affected hra
        ON hra.hazard_id = hr.hazard_id

      WHERE hr.reported_by = $1

      GROUP BY
        hr.hazard_id,
        hr.report_title,
        hr.report_date,
        hr.building_id,
        b.building_name,
        hr.exact_area,
        hr.description,
        hr.risk_associated,
        hr.preventive_action,
        hr.action_taken,
        hr.affected_others,
        hr.status,
        hr.created_at

      ORDER BY
        hr.report_date DESC,
        hr.created_at DESC

      LIMIT 10
      `,
      [userId],
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("GET RECENT HAZARDS ERROR:", error);

    return res.status(500).json({
      error: "Failed to retrieve hazard reports",
      details: error.message,
    });
  }
};

module.exports = {
  createHazard,
  getMyRecentHazards,
};
