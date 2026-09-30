const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
module.exports = (type) => (req, res, next) => {
  const body = req.body;
  const required =
    type === "hazard"
      ? [
          "reportTitle",
          "buildingId",
          "exactLocation",
          "reportDescription",
          "riskAssociated",
          "preventiveAction",
        ]
      : ["name", "buildingId", "exactLocation", "description"];
  if (
    required.some(
      (key) => typeof body[key] !== "string" || !body[key].trim(),
    ) ||
    !validDate(body.reportDate)
  )
    return res
      .status(400)
      .json({
        error:
          "Complete all required text fields and provide a valid report date.",
      });
  const optional =
    type === "hazard"
      ? ["actionTaken", "affectedOthers"]
      : [
          "contactNumber",
          "witnessName",
          "witnessDesignation",
          "witnessContactNumber",
          "typeIncidentOthers",
          "natureIncidentOthers",
          "injuryDetails",
          "actionTaken",
        ];
  if (
    optional.some((key) => body[key] != null && typeof body[key] !== "string")
  )
    return res.status(400).json({ error: "Report details must be text." });
  const arrays =
    type === "hazard"
      ? ["hazardType", "affected"]
      : ["workplaceRole", "typeIncident", "natureIncident"];
  for (const key of arrays) {
    if (
      !Array.isArray(body[key]) ||
      !body[key].length ||
      body[key].some((value) => typeof value !== "string" || !value.trim())
    )
      return res
        .status(400)
        .json({ error: `Select at least one valid ${key}.` });
    body[key] = [...new Set(body[key].map((value) => value.trim()))];
  }
  if (
    type === "hazard" &&
    body.affected.some(
      (value) => !["students", "employees", "others"].includes(value),
    )
  )
    return res.status(400).json({ error: "Invalid affected group." });
  if (
    type === "incident" &&
    (!Number.isInteger(Number(body.age)) ||
      Number(body.age) < 1 ||
      Number(body.age) > 120 ||
      !["male", "female"].includes(body.sex) ||
      body.workplaceRole.some(
        (value) =>
          !["Staff", "Student", "Contractor", "Visitor"].includes(value),
      ))
  )
    return res
      .status(400)
      .json({ error: "Check the age, sex, and workplace role." });
  next();
};
