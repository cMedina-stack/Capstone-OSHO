const ExcelJS = require("exceljs");
const pool = require("../config/db");

// ============================================================
// RISK LEVEL
// ============================================================

const getRiskLevel = (score) => {
  if (score >= 15) return "High";
  if (score >= 8) return "Medium";
  return "Low";
};

// ============================================================
// EXPORT HAZARD ASSESSMENTS
// ============================================================

const exportHazardAssessments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ha.assessment_id,
        ha.assessment_date,
        ha.likelihood,
        ha.severity,
        ha.control_action,
        ha.responsible_unit,
        ha.expected_output,
        ha.target_date,
        ha.accomplished_date,
        ha.remarks,

        hr.hazard_id,
        hr.report_title,
        hr.description,
        hr.risk_associated,
        hr.preventive_action,
        hr.action_taken,
        hr.status,

        b.building_name

      FROM hazard_assessments ha

      INNER JOIN hazard_reports hr
        ON hr.hazard_id = ha.hazard_id

      LEFT JOIN buildings b
        ON b.building_id = hr.building_id

      ORDER BY
        ha.assessment_date DESC,
        ha.assessment_id DESC
    `);

    const assessments = result.rows;

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "OSHO";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Hazard Assessments", {
      views: [
        {
          state: "frozen",
          ySplit: 2,
        },
      ],
    });

    // ========================================================
    // TITLE
    // ========================================================

    worksheet.mergeCells("A1:R1");

    const titleCell = worksheet.getCell("A1");

    titleCell.value =
      "OCCUPATIONAL SAFETY AND HEALTH OFFICE - HAZARD ASSESSMENT REGISTER";

    titleCell.font = {
      bold: true,
      size: 16,
      color: {
        argb: "FFFFFFFF",
      },
    };

    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "FF651317",
      },
    };

    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getRow(1).height = 35;

    // ========================================================
    // COLUMN HEADERS
    // ========================================================

    const headers = [
      "A. Hazard",
      "B. Potential Harm / Adverse Health Effect",
      "C. Likelihood",
      "D. Severity / Impact",
      "E. Control Action",
      "F. Expected Output",
      "G. Other Unit / Office Participation",
      "H. Expected Output / Action Taken",
      "I. Risk Score",
      "J. Risk Priority Level",
      "K. Responsible Unit",
      "L. Expected Time Frame",
      "M. Status",
      "N. Accomplished Date",
      "O. Reassessment Likelihood",
      "P. Reassessment Severity",
      "Q. Reassessment Risk Score",
      "R. Remarks",
    ];

    worksheet.addRow(headers);

    const headerRow = worksheet.getRow(2);

    headerRow.height = 65;

    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: {
          argb: "FFFFFFFF",
        },
      };

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "FFA6292F",
        },
      };

      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      cell.border = {
        top: {
          style: "thin",
        },
        left: {
          style: "thin",
        },
        bottom: {
          style: "thin",
        },
        right: {
          style: "thin",
        },
      };
    });

    // ========================================================
    // DATA
    // ========================================================

    assessments.forEach((assessment, index) => {
      const rowNumber = index + 3;

      const likelihood = Number(assessment.likelihood) || 0;

      const severity = Number(assessment.severity) || 0;

      const riskScore = likelihood * severity;

      const riskLevel = getRiskLevel(riskScore);

      const hazardText = [assessment.report_title, assessment.building_name]
        .filter(Boolean)
        .join("\n");

      const row = worksheet.addRow([
        hazardText,
        assessment.risk_associated || assessment.description || "—",

        likelihood,
        severity,

        assessment.control_action || assessment.preventive_action || "—",

        assessment.expected_output || "—",

        assessment.responsible_unit || "—",

        assessment.action_taken || "—",

        // Risk Score
        {
          formula: `C${rowNumber}*D${rowNumber}`,
          result: riskScore,
        },

        riskLevel,

        assessment.responsible_unit || "—",

        assessment.target_date || null,

        assessment.status || "Pending",

        assessment.accomplished_date || null,

        // Reassessment
        "",

        "",

        {
          formula: `IF(AND(O${rowNumber}<>"",P${rowNumber}<>""),O${rowNumber}*P${rowNumber},"")`,
        },

        assessment.remarks || "",
      ]);

      row.height = 75;

      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "top",
          wrapText: true,
        };

        cell.border = {
          top: {
            style: "thin",
            color: {
              argb: "FFD9D9D9",
            },
          },
          left: {
            style: "thin",
            color: {
              argb: "FFD9D9D9",
            },
          },
          bottom: {
            style: "thin",
            color: {
              argb: "FFD9D9D9",
            },
          },
          right: {
            style: "thin",
            color: {
              argb: "FFD9D9D9",
            },
          },
        };
      });

      // Center numeric/status fields
      ["C", "D", "I", "J", "L", "M", "N", "O", "P", "Q"].forEach((column) => {
        worksheet.getCell(`${column}${rowNumber}`).alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });

      // Date formatting
      worksheet.getCell(`L${rowNumber}`).numFmt = "mmm dd, yyyy";

      worksheet.getCell(`N${rowNumber}`).numFmt = "mmm dd, yyyy";

      // Risk level color
      const riskCell = worksheet.getCell(`J${rowNumber}`);

      if (riskLevel === "High") {
        riskCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFFFC7CE",
          },
        };

        riskCell.font = {
          bold: true,
          color: {
            argb: "FF9C0006",
          },
        };
      } else if (riskLevel === "Medium") {
        riskCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFFFEB9C",
          },
        };

        riskCell.font = {
          bold: true,
          color: {
            argb: "FF9C6500",
          },
        };
      } else {
        riskCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: {
            argb: "FFC6EFCE",
          },
        };

        riskCell.font = {
          bold: true,
          color: {
            argb: "FF006100",
          },
        };
      }
    });

    // ========================================================
    // COLUMN WIDTHS
    // ========================================================

    const widths = [
      35, // A
      45, // B
      12, // C
      12, // D
      40, // E
      35, // F
      30, // G
      35, // H
      12, // I
      18, // J
      25, // K
      18, // L
      15, // M
      18, // N
      16, // O
      16, // P
      16, // Q
      35, // R
    ];

    widths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // ========================================================
    // AUTO FILTER
    // ========================================================

    worksheet.autoFilter = {
      from: "A2",
      to: "R2",
    };

    // ========================================================
    // SEND FILE
    // ========================================================

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="OSHO-Hazard-Assessments-${Date.now()}.xlsx"`,
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error("Export hazard assessments error:", error);

    return res.status(500).json({
      error: "Failed to generate hazard assessment Excel file.",
    });
  }
};

module.exports = {
  exportHazardAssessments,
};
