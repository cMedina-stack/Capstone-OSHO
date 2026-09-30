const ExcelJS = require("exceljs");

const column = (header, key, width = 24, type = "text") => ({
  header,
  key,
  width,
  type,
});
const common = [
  column("Report ID", "report_id", 16),
  column("Assessment ID", "assessment_id", 18),
  column("Report title", "report_title", 32),
  column("Report date", "report_date", 16, "date"),
  column("Building", "building_name", 28),
  column("Exact area", "exact_area", 28),
  column("Categories", "categories", 28),
  column("Reported by", "employee_name", 26),
  column("Assessment date", "assessment_date", 18, "date"),
  column("Assessed by", "assessor_name", 26),
];
const ending = [
  column("Responsible unit", "responsible_unit", 28),
  column("Target date", "target_date", 16, "date"),
  column("Accomplished date", "accomplished_date", 19, "date"),
  column("Report status", "report_status", 20, "status"),
  column("Assessment status", "assessment_status", 22, "status"),
  column("Review status", "review_status", 20, "status"),
  column("Reviewed by", "reviewed_by_name", 26),
  column("Reviewed at", "reviewed_at", 28, "timestamp"),
  column("Remarks", "remarks", 45),
];
const hazardColumns = [
  ...common,
  column("Description", "description", 45),
  column("Risk associated", "risk_associated", 40),
  column("Preventive action reported", "preventive_action", 40),
  column("Immediate action taken", "action_taken", 40),
  column("Likelihood (1–5)", "likelihood", 18, "number"),
  column("Severity (1–5)", "severity", 18, "number"),
  column("Risk score", "risk_score", 16, "number"),
  column("Risk level", "risk_level", 18),
  column("Control / corrective action", "control_action", 45),
  column("Expected output", "expected_output", 40),
  ...ending,
];
const incidentColumns = [
  ...common,
  column("Description", "description", 45),
  column("Findings", "incident_finding", 45),
  column("Immediate cause", "immediate_cause", 40),
  column("Contributing factors", "contributing_factors", 40),
  column("Root cause", "root_cause", 40),
  column("Actual consequence", "actual_consequence", 40),
  column("Potential consequence", "potential_consequence", 40),
  column("Initial likelihood (1–5)", "initial_likelihood", 22, "number"),
  column("Initial severity (1–5)", "initial_severity", 22, "number"),
  column("Initial risk score", "initial_risk_score", 20, "number"),
  column("Initial risk level", "initial_risk_level", 20),
  column("Corrective action", "corrective_action", 45),
  column("Preventive action", "incident_preventive_action", 40),
  column("Residual likelihood (1–5)", "residual_likelihood", 24, "number"),
  column("Residual severity (1–5)", "residual_severity", 24, "number"),
  column("Residual risk score", "residual_risk_score", 22, "number"),
  column("Residual risk level", "residual_risk_level", 22),
  ...ending,
];
const label = (value) =>
  String(value ?? "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
function cellValue(value, type, timezone) {
  if (value == null || value === "") return null;
  if (type === "number")
    return Number.isFinite(Number(value)) ? Number(value) : null;
  if (type === "date")
    return new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  if (type === "timestamp")
    return new Intl.DateTimeFormat("en-PH", {
      timeZone: timezone,
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  if (type === "status") return label(value);
  // Plain strings stay strings in XLSX, including text beginning with '=' or '+'.
  return (Array.isArray(value) ? value.join(", ") : String(value)).slice(
    0,
    32767,
  );
}
function createAssessmentWorkbook(
  records,
  { type = "all", status = "all", search = "", generatedAt = new Date() } = {},
) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "OSHO";
  workbook.created = generatedAt;
  const timezone = process.env.APP_TIMEZONE || "Asia/Manila";
  const generated = new Intl.DateTimeFormat("en-PH", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(generatedAt);
  for (const reportType of type === "all" ? ["hazard", "incident"] : [type]) {
    const columns = reportType === "hazard" ? hazardColumns : incidentColumns;
    const rows = records.filter(
      (record) =>
        record.report_type === reportType && record.assessment_id != null,
    );
    const sheet = workbook.addWorksheet(
      reportType === "hazard" ? "Hazard Assessments" : "Incident Assessments",
      {
        views: [{ state: "frozen", xSplit: 2, ySplit: 5 }],
        pageSetup: {
          orientation: "landscape",
          paperSize: 9,
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          printTitlesRow: "1:5",
        },
      },
    );
    sheet.columns = columns.map(({ key, width }) => ({ key, width }));
    for (let row = 1; row <= 3; row++)
      sheet.mergeCells(row, 1, row, columns.length);
    sheet.getCell("A1").value =
      `OSHO — ${label(reportType)} Assessment Register`;
    sheet.getCell("A1").font = {
      name: "Calibri",
      size: 16,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    sheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF8B1E23" },
    };
    sheet.getRow(1).height = 30;
    sheet.getCell("A2").value =
      `Generated: ${generated} (${timezone}) | Saved assessments: ${rows.length}`;
    sheet.getCell("A3").value =
      `Status: ${label(status)} | Search: ${search || "None"} | Risk = likelihood × severity: Low 1–4; Moderate 5–9; High 10–16; Critical 17–25. Pending assessments are not approved decisions.`;
    sheet.getCell("A3").alignment = { wrapText: true };
    sheet.getRow(3).height = 30;
    sheet.getRow(5).values = columns.map((c) => c.header);
    sheet.getRow(5).height = 32;
    sheet.getRow(5).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF651317" },
      };
      cell.alignment = { vertical: "middle", wrapText: true };
    });
    for (const record of rows) {
      const details = record.incident_details || {};
      const data = {
        ...record,
        ...details,
        report_id: record.report_id,
        assessment_id: record.assessment_id,
        report_status: record.report_status,
        incident_preventive_action: details.preventive_action,
        remarks:
          reportType === "incident" ? details.osho_remarks : record.remarks,
      };
      const row = sheet.addRow(
        columns.map((c) => cellValue(data[c.key], c.type, timezone)),
      );
      row.alignment = { vertical: "top", wrapText: true };
      row.height = 60;
      columns.forEach((c, index) => {
        const cell = row.getCell(index + 1);
        if (c.type === "date") cell.numFmt = "yyyy-mm-dd";
        if (c.type === "number") cell.numFmt = "0";
        if (row.number % 2 === 0)
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8F6F2" },
          };
        if (
          ["risk_level", "initial_risk_level", "residual_risk_level"].includes(
            c.key,
          )
        ) {
          const colors = {
            Low: "FFDCFCE7",
            Moderate: "FFFEF9C3",
            High: "FFFFEDD5",
            Critical: "FFFEE2E2",
          };
          if (colors[cell.value])
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: colors[cell.value] },
            };
        }
      });
    }
    sheet.autoFilter = {
      from: { row: 5, column: 1 },
      to: { row: Math.max(5, sheet.rowCount), column: columns.length },
    };
    if (!rows.length)
      sheet.getCell("A6").value = "No saved assessments match these filters.";
    sheet.headerFooter.oddFooter = "&LOSHO Assessment Register&RPage &P of &N";
  }
  return workbook;
}
module.exports = { createAssessmentWorkbook };
