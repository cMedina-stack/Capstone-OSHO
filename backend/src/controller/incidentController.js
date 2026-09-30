const pool = require("../config/db");

const createIncident = async (req, res) => {






  const client = await pool.connect();

  try {
    const {
      // Person involved
      name,
      age,
      sex,
      contactNumber,
      workplaceRole,

      // Witness
      witnessName,
      witnessDesignation,
      witnessContactNumber,

      // Incident classification
      typeIncident,
      typeIncidentOthers,
      natureIncident,
      natureIncidentOthers,

      // Location
      reportDate,
      buildingId,
      exactLocation,

      // Details
      description,
      injuryDetails,
      actionTaken,
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Name is required.",
      });
    }

    if (!age || Number(age) < 1 || Number(age) > 120) {
      return res.status(400).json({
        error: "A valid age is required.",
      });
    }

    if (!sex) {
      return res.status(400).json({
        error: "Sex is required.",
      });
    }

    if (!Array.isArray(workplaceRole) || workplaceRole.length === 0) {
      return res.status(400).json({
        error: "At least one workplace role is required.",
      });
    }

    if (!Array.isArray(typeIncident) || typeIncident.length === 0) {
      return res.status(400).json({
        error: "At least one incident type is required.",
      });
    }

    if (!Array.isArray(natureIncident) || natureIncident.length === 0) {
      return res.status(400).json({
        error: "At least one nature of incident is required.",
      });
    }

    if (!reportDate) {
      return res.status(400).json({
        error: "Report date is required.",
      });
    }

    if (!buildingId) {
      return res.status(400).json({
        error: "Building is required.",
      });
    }

    if (!exactLocation || !exactLocation.trim()) {
      return res.status(400).json({
        error: "Exact location is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        error: "Incident description is required.",
      });
    }

    // ========================================
    // AUTHENTICATED USER
    // ========================================

    const reportedBy = req.user?.user_id;

    if (!reportedBy) {
      return res.status(401).json({
        error: "Authenticated user could not be identified.",
      });
    }

    // ========================================
    // START TRANSACTION
    // ========================================

    await client.query("BEGIN");

    // ========================================
    // INSERT MAIN INCIDENT
    // ========================================

    const incidentResult = await client.query(
      `
      INSERT INTO incident_reports (
        name,
        age,
        sex,
        contact_number,

        report_date,
        building_id,
        exact_area,

        description,
        injury_details,
        action_taken,

        witness_name,
        witness_designation,
        witness_contact_number,

        incident_type_others,
        incident_nature_others,

        reported_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,

        $5,
        $6,
        $7,

        $8,
        $9,
        $10,

        $11,
        $12,
        $13,

        $14,
        $15,

        $16
      )
      RETURNING incident_id
      `,
      [
        // Person
        name.trim(),
        Number(age),
        sex,
        contactNumber?.trim() || null,

        // Location
        reportDate,
        buildingId,
        exactLocation.trim(),

        // Details
        description.trim(),
        injuryDetails?.trim() || null,
        actionTaken?.trim() || null,

        // Witness
        witnessName?.trim() || null,
        witnessDesignation?.trim() || null,
        witnessContactNumber?.trim() || null,

        // Others
        typeIncidentOthers?.trim() || null,
        natureIncidentOthers?.trim() || null,

        // User
        reportedBy,
      ],
    );

    const incidentId = incidentResult.rows[0].incident_id;


    // ========================================
    // INSERT WORKPLACE ROLES
    // ========================================

    for (const role of workplaceRole) {
      await client.query(
        `
        INSERT INTO incident_workplace_roles (
          incident_id,
          workplace_role
        )
        VALUES ($1, $2)
        `,
        [incidentId, role],
      );
    }

    // ========================================
    // INSERT INCIDENT TYPES
    // ========================================

    for (const type of typeIncident) {
      await client.query(
        `
        INSERT INTO incident_types (
          incident_id,
          incident_type
        )
        VALUES ($1, $2)
        `,
        [incidentId, type],
      );
    }

    // ========================================
    // INSERT INCIDENT NATURES
    // ========================================

    for (const nature of natureIncident) {
      await client.query(
        `
        INSERT INTO incident_natures (
          incident_id,
          incident_nature
        )
        VALUES ($1, $2)
        `,
        [incidentId, nature],
      );
    }

    // ========================================
    // COMMIT TRANSACTION
    // ========================================

    await client.query("COMMIT");





    return res.status(201).json({
      success: true,
      message: "Incident recorded successfully.",
      incident_id: incidentId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("=================================");
    console.error("❌ CREATE INCIDENT ERROR:");
    console.error(error);
    console.error("=================================");

    return res.status(500).json({
      error: "Failed to create incident.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    client.release();
  }
};

// ========================================
// GET INCIDENT BY ID
// ========================================

const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        ir.*,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'workplace_role',
              iwr.workplace_role
            )
          ) FILTER (
            WHERE iwr.workplace_role IS NOT NULL
          ),
          '[]'
        ) AS workplace_roles,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'incident_type',
              it.incident_type
            )
          ) FILTER (
            WHERE it.incident_type IS NOT NULL
          ),
          '[]'
        ) AS incident_types,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'incident_nature',
              ine.incident_nature
            )
          ) FILTER (
            WHERE ine.incident_nature IS NOT NULL
          ),
          '[]'
        ) AS incident_natures

      FROM incident_reports ir

      LEFT JOIN incident_workplace_roles iwr
        ON iwr.incident_id = ir.incident_id

      LEFT JOIN incident_types it
        ON it.incident_id = ir.incident_id

      LEFT JOIN incident_natures ine
        ON ine.incident_id = ir.incident_id

      WHERE ir.incident_id = $1 AND ($3::boolean OR ir.reported_by = $2)

      GROUP BY ir.incident_id
      `,
      [id, req.user.user_id, req.user.role === "admin"],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Incident not found.",
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("GET INCIDENT ERROR:", error);

    return res.status(500).json({
      error: "Failed to retrieve incident.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createIncident,
  getIncidentById,
};
