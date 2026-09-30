const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
module.exports = async ({
  base,
  users,
  password,
  reportIds,
  day,
  buildingId,
}) => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      timezoneId: "Asia/Manila",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + "/employee/dashboard");
    await page.waitForURL("**/login");
    await page.locator("input[type=email]").fill(users.employee.email);
    await page.locator("input[type=password]").fill("wrong-password");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.getByRole("alert").waitFor();
    await page.locator("input[type=password]").fill(password);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForURL("**/employee/dashboard");
    await page.getByText("Campus Safety", { exact: false }).first().waitFor();
    await page.goto(base + "/admin/dashboard");
    await page.waitForURL("**/employee/dashboard");
    console.log("Browser login and role checks passed.");
    await page.goto(base + "/employee/record-hazard");
    for (const [name, value] of Object.entries({
      reportTitle: "Browser created hazard",
      reportDate: day,
      exactLocation: "Test room",
      reportDescription: "Browser report",
      riskAssociated: "Test risk",
      preventiveAction: "Test prevention",
    }))
      await page.locator(`[name="${name}"]`).fill(value);
    await page.locator("select[name=building]").selectOption(buildingId);
    await page.locator("input[name=hazardType]").first().check();
    await page.locator("input[name=affected][value=employees]").check();
    await page.locator("form button[type=submit]").click();
    await page
      .getByRole("heading", { name: "Hazard Recorded", exact: true })
      .waitFor();
    await page.goto(base + "/employee/record-incident");
    for (const [name, value] of Object.entries({
      name: "Browser Test",
      age: "25",
      reportDate: day,
      exactLocation: "Test room",
      description: "Browser incident",
      injuryDetails: "Test injury",
      actionTaken: "Test first aid",
    }))
      await page.locator(`[name="${name}"]`).fill(value);
    await page.locator("select[name=sex]").selectOption("male");
    await page.locator("select[name=building]").selectOption(buildingId);
    for (const group of ["workplaceRole", "typeIncident", "natureIncident"])
      await page.locator(`input[name="${group}"]`).first().check();
    await page.locator("form button[type=submit]").click();
    await page
      .getByRole("heading", { name: "Incident Recorded", exact: true })
      .waitFor();
    console.log("Browser report creation passed.");
    await page.goto(base + "/employee/my-reports");
    await page.getByText("Test hazard", { exact: true }).waitFor();
    await page.goto(`${base}/employee/reports/hazard/${reportIds.hazard}`);
    await page.getByRole("button", { name: "Assessment", exact: true }).click();
    await page.locator("textarea[name=controlAction]").waitFor();
    assert.equal(
      await page.locator("input[name=assessmentDate]").inputValue(),
      day,
    );
    await page
      .locator("textarea[name=controlAction]")
      .fill("Browser verified repair");
    await page.locator("form button[type=submit]").click();
    await page
      .locator("textarea[name=controlAction]")
      .waitFor({ state: "detached" });
    await page.goto(
      `${base}/employee/reports/incident/${reportIds.incident}?assessment=1`,
    );
    await page.locator("#incidentFinding").waitFor();
    await page.locator("#incidentFinding").fill("Browser verified finding");
    await page.locator("form button[type=submit]").click();
    await page.locator("#incidentFinding").waitFor({ state: "detached" });
    console.log("Browser employee submissions passed.");
    // Log in as admin through the actual login screen.
    await page.goto(base + "/login");
    await page.locator("input[type=email]").fill(users.admin.email);
    await page.locator("input[type=password]").fill(password);
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForURL("**/admin/dashboard");
    await page
      .getByText("Active report risk levels", { exact: true })
      .waitFor();
    await page.goto(base + "/admin/assessments");
    await page
      .getByPlaceholder("Search report, employee, building...")
      .fill("Test hazard");
    const downloadEvent = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Download Excel", exact: true })
      .click();
    const download = await downloadEvent;
    assert.match(
      download.suggestedFilename(),
      /OSHO-all-assessments-.*\.xlsx$/,
    );
    const exported = new (require("exceljs").Workbook)();
    await exported.xlsx.readFile(await download.path());
    assert.equal(
      exported.getWorksheet("Hazard Assessments").getCell("A6").value,
      String(reportIds.hazard),
    );
    console.log("Browser Excel download passed.");

    await page
      .getByRole("button", { name: "Review / Edit", exact: true })
      .first()
      .click();
    await page.locator("textarea[name=controlAction]").waitFor();
    await page
      .getByRole("button", { name: "Approve Assessment", exact: true })
      .click();
    await page
      .locator("textarea[name=controlAction]")
      .waitFor({ state: "detached" });
    await page
      .getByRole("button", { name: "Review / Edit", exact: true })
      .first()
      .click();
    await page.locator("input[name=accomplishedDate]").fill(day);
    await page
      .getByRole("button", {
        name: "Confirm completion & resolve",
        exact: true,
      })
      .click();
    await page
      .locator("textarea[name=controlAction]")
      .waitFor({ state: "detached" });
    console.log("Browser hazard review passed.");
    await page.goto(`${base}/admin/incident-reports/${reportIds.incident}`);
    await page.getByRole("button", { name: "Assessment", exact: true }).click();
    await page.locator("#incidentFinding").waitFor();
    await page
      .getByRole("button", { name: "Approve assessment", exact: true })
      .click();
    await page.locator("#incidentFinding").waitFor({ state: "detached" });
    await page.getByRole("button", { name: "Assessment", exact: true }).click();
    await page.locator("#accomplishedDate").fill(day);
    await page
      .getByRole("button", {
        name: "Confirm completion & resolve",
        exact: true,
      })
      .click();
    await page.locator("#incidentFinding").waitFor({ state: "detached" });
    await page.goto(`${base}/admin/hazard-reports/${reportIds.hazard}`);
    await page.getByText("Test hazard", { exact: true }).waitFor();
    await page.getByText("Resolved", { exact: true }).first().waitFor();
    await page.screenshot({
      path: "/tmp/osho-admin-report.png",
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Account menu", exact: true })
      .click();
    await page.getByRole("button", { name: "Log out", exact: true }).click();
    await page.waitForURL("**/login");
    assert.deepEqual(errors, [], "Browser runtime errors");
    console.log(
      "Browser checks passed: login errors, role guards, report lists, both employee assessment submissions, both admin approval/completion flows, report navigation, and logout.",
    );
  } finally {
    await browser.close();
  }
};
