// Integration verification against the configured database. All fixture writes roll back.
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const pool = require("../src/config/db");
const app = require("../src/server");
if (process.env.OSHO_BROWSER_TEST === "1") {
  const express = require("express");
  const path = require("node:path");
  const dist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(dist));
  app.get("/{*splat}", (req, res) =>
    res.sendFile(path.join(dist, "index.html")),
  );
}
(async () => {
  const client = await pool.connect();
  const originalQuery = pool.query.bind(pool),
    originalConnect = pool.connect.bind(pool);
  let server,
    inSavepoint = false;
  try {
    await client.query("BEGIN");
    // Controller transactions become savepoints inside this rollback-only test transaction.
    let queue = Promise.resolve();
    const executeQuery = async (sql, params) => {
      if (sql === "BEGIN") {
        inSavepoint = true;
        return client.query("SAVEPOINT workflow_test");
      }
      if (sql === "COMMIT") {
        inSavepoint = false;
        return client.query("RELEASE SAVEPOINT workflow_test");
      }
      if (sql === "ROLLBACK") {
        if (inSavepoint) {
          inSavepoint = false;
          await client.query("ROLLBACK TO SAVEPOINT workflow_test");
          return client.query("RELEASE SAVEPOINT workflow_test");
        }
        return;
      }
      return client.query(sql, params);
    };
    const query = (sql, params) => {
      const result = queue.then(() => executeQuery(sql, params));
      queue = result.catch(() => {});
      return result;
    };
    pool.query = query;
    pool.connect = async () => ({ query, release() {} });
    const suffix = crypto.randomUUID();
    const password = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 4);
    const users = {};
    for (const role of ["employee", "other", "admin"]) {
      users[role] = (
        await client.query(
          "INSERT INTO users(email,password_hash,first_name,last_name,role) VALUES($1,$2,$3,$4,$5) RETURNING user_id,email",
          [
            `${role}-${suffix}@example.test`,
            hash,
            "Workflow",
            "Test",
            role === "other" ? "employee" : role,
          ],
        )
      ).rows[0];
    }
    const buildingId = `TEST-${suffix.slice(0, 7)}`;
    await client.query(
      "INSERT INTO buildings(building_id,building_name,latitude,longitude) VALUES($1,$2,14,121)",
      [buildingId, "Workflow test building"],
    );
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    let checks = 0;
    async function request(path, role, method = "GET", body, expected = 200) {
      const response = await fetch(base + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(users[role]?.token
            ? { Authorization: `Bearer ${users[role].token}` }
            : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const data = await response.json();
      assert.equal(
        response.status,
        expected,
        `${method} ${path}: ${JSON.stringify(data)}`,
      );
      checks++;
      return data;
    }
    for (const role of Object.keys(users))
      users[role].token = (
        await request("/api/auth/login", null, "POST", {
          email: users[role].email,
          password,
        })
      ).token;
    await request(
      "/api/auth/login",
      null,
      "POST",
      { email: users.employee.email, password: "wrong" },
      401,
    );
    await request("/api/users/batch-register", null, "POST", {}, 401);
    await request("/api/users/batch-register", "employee", "POST", {}, 403);
    const registered = await request(
      "/api/users/batch-register",
      "admin",
      "POST",
      {
        email: `new-${suffix}@example.test`,
        password,
        firstName: "Test",
        lastName: "Account",
        role: "employee",
      },
      201,
    );
    assert.equal("password_hash" in registered.user, false);
    await request("/api/dashboard/admin", "employee", "GET", undefined, 403);
    await request("/api/admin-assessments", "employee", "GET", undefined, 403);
    const day = new Date().toISOString().slice(0, 10);
    const reportIds = {};
    for (const type of ["hazard", "incident"]) {
      const reportBody =
        type === "hazard"
          ? {
              reportTitle: "Test hazard",
              reportDate: day,
              buildingId,
              exactLocation: "Test area",
              hazardType: ["Physical"],
              affected: ["employees"],
              reportDescription: "Test only",
              riskAssociated: "Test risk",
              preventiveAction: "Test prevention",
            }
          : {
              name: "Test Person",
              age: 25,
              sex: "male",
              workplaceRole: ["Staff"],
              typeIncident: ["Accident"],
              natureIncident: ["Slip"],
              reportDate: day,
              buildingId,
              exactLocation: "Test area",
              description: "Test incident",
              injuryDetails: "Test",
              actionTaken: "First aid",
            };
      const created = await request(
        `/api/${type}s`,
        "employee",
        "POST",
        reportBody,
        201,
      );
      const reportId = (created[type] || created.report || created)?.[
        `${type}_id`
      ];
      assert.ok(reportId, JSON.stringify(created));
      reportIds[type] = reportId;
      await request(
        `/api/reports/my-reports/${type}/${reportId}`,
        "other",
        "GET",
        undefined,
        404,
      );
      await request(`/api/reports/my-reports/${type}/${reportId}`, "admin");
      const form =
        type === "hazard"
          ? {
              hazardId: reportId,
              assessmentDate: day,
              likelihood: 4,
              severity: 5,
              controlAction: "Repair test hazard",
              remarks: "Test review",
            }
          : {
              incidentId: reportId,
              assessmentDate: day,
              initialLikelihood: 4,
              initialSeverity: 5,
              incidentFinding: "Test finding",
              correctiveAction: "Repair test issue",
              oshoRemarks: "Test review",
              residualLikelihood: 2,
              residualSeverity: 2,
            };
      await request(`/api/${type}-assessments`, "other", "POST", form, 404);
      const assessment = (
        await request(`/api/${type}-assessments`, "employee", "POST", form, 201)
      ).assessment;
      const path = `/api/${type}-assessments/${assessment.assessment_id}`;
      await request(`/api/${type}-assessments`, "employee", "POST", form, 409);
      await request(path, "other", "GET", undefined, 404);
      await request(path, "other", "PUT", form, 404);
      await request(
        path,
        "employee",
        "PUT",
        { ...form, reviewAction: "approve" },
        403,
      );
      await request(
        path,
        "admin",
        "PUT",
        { ...form, reviewAction: "complete", accomplishedDate: day },
        409,
      );
      assert.equal(
        (
          await request(path, "admin", "PUT", {
            ...form,
            reviewAction: "revision",
          })
        ).assessment.review_status,
        "needs_revision",
      );
      assert.equal(
        (await request(path, "employee", "PUT", form)).assessment.review_status,
        "pending",
      );
      assert.equal(
        (
          await request(path, "admin", "PUT", {
            ...form,
            reviewAction: "approve",
          })
        ).assessment.assessment_status,
        "action_required",
      );
      await request(
        path,
        "admin",
        "PUT",
        { ...form, reviewAction: "complete" },
        400,
      );
      assert.equal(
        (
          await request(path, "admin", "PUT", {
            ...form,
            reviewAction: "complete",
            accomplishedDate: day,
          })
        ).assessment.assessment_status,
        "resolved",
      );
      assert.equal(
        (
          await request(
            `/api/reports/my-reports/${type}/${reportId}`,
            "employee",
          )
        ).report.status,
        "resolved",
      );
      await request(path, "employee", "PUT", form);
      const reopened = (
        await request(`/api/reports/my-reports/${type}/${reportId}`, "employee")
      ).report;
      assert.equal(reopened.status, "under_review");
      assert.equal(reopened.risk_score, 20);
      if (type === "incident") {
        await request(
          `/api/incidents/${reportId}`,
          "other",
          "GET",
          undefined,
          404,
        );
        assert.deepEqual(reopened.incident_types, ["Accident"]);
      }
      assert.equal(
        (
          await request(
            `/api/${type}-assessments/${type}/${reportId}`,
            "employee",
          )
        ).assessments.length,
        1,
      );
    }
    const map = await request("/api/buildings/map", "employee");
    const building = map.find((row) => row.building_id === buildingId);
    assert.equal(Number(building.report_count), 2);
    assert.equal(Number(building.assessed_count), 2);
    assert.equal(building.risk_level, "critical");
    const reports = await request(
      `/api/buildings/${buildingId}/reports`,
      "employee",
    );
    assert.equal(reports.length, 2);
    assert.ok(reports.every((report) => report.risk_level === "Critical"));
    for (const path of [
      "/api/buildings",
      "/api/dashboard/campus-alerts",
      "/api/reports/my-reports",
      "/api/hazards/my-recent",
    ])
      await request(path, "employee");
    for (const path of [
      "/api/dashboard/admin",
      "/api/dashboard/assessments",
      "/api/dashboard/reports-by-building",
      "/api/dashboard/analytics",
      "/api/admin-assessments",
      "/api/quick-reviews",
      "/api/hazard-assessments",
    ])
      await request(path, "admin");
    await request("/api/admin-assessments/export", null, "GET", undefined, 401);
    await request(
      "/api/admin-assessments/export",
      "employee",
      "GET",
      undefined,
      403,
    );
    await request(
      "/api/admin-assessments/export?type=invalid",
      "admin",
      "GET",
      undefined,
      400,
    );
    await request(
      `/api/admin-assessments/export?search=no-match-${suffix}-absent`,
      "admin",
      "GET",
      undefined,
      404,
    );
    const ExcelJS = require("exceljs");
    for (const type of ["all", "hazard", "incident"]) {
      const response = await fetch(
        `${base}/api/admin-assessments/export?type=${type}&search=${encodeURIComponent("Workflow test building")}`,
        { headers: { Authorization: `Bearer ${users.admin.token}` } },
      );
      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /spreadsheetml/);
      assert.match(response.headers.get("content-disposition"), /\.xlsx/);
      assert.equal(response.headers.get("cache-control"), "no-store");
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(Buffer.from(await response.arrayBuffer()));
      assert.equal(workbook.worksheets.length, type === "all" ? 2 : 1);
      for (const sheet of workbook.worksheets)
        assert.equal(
          sheet.getRow(6).getCell(1).value,
          String(
            reportIds[sheet.name.startsWith("Hazard") ? "hazard" : "incident"],
          ),
        );
      checks++;
    }
    if (process.env.OSHO_BROWSER_TEST === "1")
      await require("./browser-smoke")({
        base,
        users,
        password,
        reportIds,
        day,
        buildingId,
      });
    console.log(
      `Passed ${checks} HTTP checks plus ownership, risk, state, and aggregate assertions. All test fixtures will be rolled back.`,
    );
  } finally {
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    pool.query = originalQuery;
    pool.connect = originalConnect;
    await client.query("ROLLBACK");
    client.release();
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
