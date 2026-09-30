const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  transition,
  valuesFor,
  risk,
} = require("../src/services/assessmentController");
const requireRole = require("../src/middleware/requireRole");

test("backend loads every registered route", () =>
  assert.doesNotThrow(() => require("../src/server")));
test("employees cannot approve, request revisions, or resolve reports", () => {
  for (const action of ["approve", "revision", "complete"])
    assert.throws(() => transition(action, {}, "employee", "2026-01-01"), {
      status: 403,
    });
});
test("approval retains an active report until completion is confirmed", () => {
  assert.deepEqual(transition("approve", {}, "admin", null), {
    assessment: "action_required",
    report: "under_review",
    review: "approved",
  });
  assert.throws(
    () =>
      transition(
        "complete",
        { review_status: "pending" },
        "admin",
        "2026-01-01",
      ),
    { status: 409 },
  );
  assert.throws(
    () => transition("complete", { review_status: "approved" }, "admin", null),
    { status: 400 },
  );
  assert.equal(
    transition("complete", { review_status: "approved" }, "admin", "2026-01-01")
      .report,
    "resolved",
  );
});
test("editing invalidates previous approval consistently", () => {
  assert.deepEqual(
    transition("save", { review_status: "approved" }, "employee"),
    { assessment: "under_review", report: "under_review", review: "pending" },
  );
});
test("risk boundaries and invalid ratings", () => {
  for (const [likelihood, severity, level] of [
    [1, 4, "Low"],
    [3, 3, "Moderate"],
    [4, 4, "High"],
    [5, 5, "Critical"],
  ])
    assert.equal(risk(likelihood, severity).level, level);
  const form = {
    assessmentDate: "2026-01-01",
    likelihood: 3,
    severity: 4,
    controlAction: "Repair",
  };
  for (const likelihood of [0, 6, 1.5, "invalid", null])
    assert.throws(() => valuesFor("hazard", { ...form, likelihood }), {
      status: 400,
    });
  assert.throws(
    () => valuesFor("hazard", { ...form, assessmentDate: "2026-02-30" }),
    { status: 400 },
  );
  assert.throws(
    () => valuesFor("hazard", { ...form, targetDate: "2025-12-01" }),
    { status: 400 },
  );
});
test("incident assessment preserves its own fields and validates residual risk pairs", () => {
  const form = {
    assessmentDate: "2026-01-01",
    incidentFinding: "Finding",
    initialLikelihood: 4,
    initialSeverity: 5,
    correctiveAction: "Repair",
  };
  const result = valuesFor("incident", form);
  assert.equal(result.initial_risk_score, 20);
  assert.equal(result.incident_finding, "Finding");
  assert.equal(result.residual_risk_score, null);
  assert.throws(
    () => valuesFor("incident", { ...form, residualLikelihood: 2 }),
    { status: 400 },
  );
  assert.equal(
    valuesFor("incident", {
      ...form,
      residualLikelihood: 2,
      residualSeverity: 2,
    }).residual_risk_score,
    4,
  );
});
test("admin middleware blocks an employee before the controller runs", () => {
  let status;
  requireRole("admin")(
    { user: { role: "employee" } },
    {
      status(value) {
        status = value;
        return this;
      },
      json() {},
    },
    () => assert.fail("must not call controller"),
  );
  assert.equal(status, 403);
});
