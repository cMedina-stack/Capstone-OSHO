const { test } = require("node:test");
const assert = require("node:assert/strict");
const ExcelJS = require("exceljs");
const {
  createAssessmentWorkbook,
} = require("../src/services/assessmentWorkbook");
const records = [
  {
    report_type: "hazard",
    report_id: "9007199254740993",
    assessment_id: "9007199254740994",
    report_title: '=HYPERLINK("https://example.test")',
    assessment_date: "2026-10-01",
    likelihood: 4,
    severity: 5,
    risk_score: 20,
    risk_level: "Critical",
    control_action: "Repair",
    review_status: "pending",
    categories: ["Physical", "Electrical"],
  },
  {
    report_type: "incident",
    report_id: "2",
    assessment_id: "3",
    assessment_date: "2026-10-01",
    incident_details: {
      incident_finding: "Investigation findings",
      initial_likelihood: 4,
      initial_severity: 5,
      initial_risk_score: 20,
      initial_risk_level: "Critical",
      residual_likelihood: 1,
      residual_severity: 2,
      residual_risk_score: 2,
      residual_risk_level: "Low",
      preventive_action: "Training",
      osho_remarks: "Reviewed",
    },
  },
];
const cell = (sheet, header) =>
  sheet.getRow(6).getCell(sheet.getRow(5).values.indexOf(header));
test("workbook round-trips with both assessment sheets and full incident fields", async () => {
  const workbook = createAssessmentWorkbook(records);
  const read = new ExcelJS.Workbook();
  await read.xlsx.load(await workbook.xlsx.writeBuffer());
  assert.deepEqual(
    read.worksheets.map((sheet) => sheet.name),
    ["Hazard Assessments", "Incident Assessments"],
  );
  const hazard = read.worksheets[0],
    incident = read.worksheets[1];
  assert.equal(cell(hazard, "Report ID").value, "9007199254740993");
  assert.equal(cell(hazard, "Assessment ID").value, "9007199254740994");
  assert.equal(cell(hazard, "Report title").type, ExcelJS.ValueType.String);
  assert.equal(cell(hazard, "Report title").value, records[0].report_title);
  assert.equal(cell(hazard, "Risk score").value, 20);
  assert.equal(cell(hazard, "Review status").value, "Pending");
  assert.equal(
    cell(hazard, "Assessment date").value.toISOString(),
    "2026-10-01T00:00:00.000Z",
  );
  assert.equal(cell(hazard, "Categories").value, "Physical, Electrical");
  assert.equal(cell(incident, "Findings").value, "Investigation findings");
  assert.equal(cell(incident, "Residual risk score").value, 2);
  assert.equal(cell(incident, "Preventive action").value, "Training");
  assert.equal(cell(incident, "Remarks").value, "Reviewed");
  assert.ok(hazard.autoFilter);
  assert.equal(hazard.views[0].ySplit, 5);
});
test("type selection and unassessed records are respected", () => {
  const workbook = createAssessmentWorkbook(
    [...records, { report_type: "hazard", report_id: "4" }],
    { type: "hazard" },
  );
  assert.equal(workbook.worksheets.length, 1);
  assert.equal(workbook.worksheets[0].rowCount, 6);
  const empty = createAssessmentWorkbook([], { type: "incident" })
    .worksheets[0];
  assert.match(empty.getCell("A6").value, /No saved assessments/);
});
