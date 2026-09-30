import { today } from "../../../shared/date";
import { apiFetch } from "../../../shared/api";
import { useMemo, useState } from "react";

const HazardAssessmentModal = ({ isOpen, onClose, report, onSaved }) => {
  const [form, setForm] = useState(() => ({
    reportStatus: report.status || report.report_status || "under_review",

    assessmentDate: report.assessment_date || today(),

    likelihood:
      report.likelihood !== null && report.likelihood !== undefined
        ? String(report.likelihood)
        : "",

    severity:
      report.severity !== null && report.severity !== undefined
        ? String(report.severity)
        : "",

    controlAction: report.control_action || "",

    responsibleUnit: report.responsible_unit || "",

    expectedOutput: report.expected_output || "",

    targetDate: report.target_date || "",

    assessmentStatus: "under_review",

    accomplishedDate: report.accomplished_date || "",

    remarks: report.remarks || "",

    reviewStatus: report.review_status || "pending",
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const riskScore = useMemo(() => {
    const likelihood = Number(form.likelihood);
    const severity = Number(form.severity);

    if (!likelihood || !severity) {
      return null;
    }

    return likelihood * severity;
  }, [form.likelihood, form.severity]);

  const riskLevel = useMemo(() => {
    if (!riskScore) return null;

    if (riskScore <= 4) {
      return "Low";
    }

    if (riskScore <= 9) {
      return "Moderate";
    }

    if (riskScore <= 16) {
      return "High";
    }

    return "Critical";
  }, [riskScore]);

  const getRiskClass = () => {
    switch (riskLevel) {
      case "Low":
        return "border-green-200 bg-green-50 text-green-700";

      case "Moderate":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";

      case "High":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "Critical":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-400";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!(report?.hazard_id || report?.report_id)) {
      return "This assessment does not have a valid hazard ID.";
    }

    if (!form.assessmentDate) {
      return "Assessment date is required.";
    }

    if (!form.likelihood) {
      return "Please select a likelihood rating.";
    }

    if (!form.severity) {
      return "Please select a severity rating.";
    }

    if (!form.controlAction.trim()) {
      return "Control action is required.";
    }

    return null;
  };

  const handleSubmit = async (e, reviewAction = "save") => {
    e?.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found.");
      }

      /*
        IMPORTANT:

        assessment_id:
          Used in the URL.

        hazard_id:
          Used inside the request body.

        Example:

        /api/hazard-assessments/1

        {
          hazardId: 27
        }

        assessment_id = 1
        hazard_id     = 27
      */

      const response = await apiFetch(
        report.assessment_id
          ? `/api/hazard-assessments/${report.assessment_id}`
          : "/api/hazard-assessments",
        {
          method: report.assessment_id ? "PUT" : "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            hazardId: report.hazard_id || report.report_id,

            assessmentDate: form.assessmentDate,

            likelihood: Number(form.likelihood),

            severity: Number(form.severity),

            controlAction: form.controlAction.trim(),

            responsibleUnit: form.responsibleUnit.trim() || null,

            expectedOutput: form.expectedOutput.trim() || null,

            targetDate: form.targetDate || null,

            accomplishedDate: form.accomplishedDate || null,

            remarks: form.remarks.trim() || null,

            reviewAction,
          }),
        },
      );

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(`Backend returned invalid JSON (${response.status}).`);
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to update hazard assessment.",
        );
      }

      if (onSaved) {
        await onSaved(result);
      }

      onClose();
    } catch (error) {
      console.error("Admin hazard assessment error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update hazard assessment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = (e) => {
    handleSubmit(e, "save");
  };

  const handleApprove = (e) => {
    handleSubmit(e, "approve");
  };

  const handleRequestRevision = (e) => {
    handleSubmit(e, "revision");
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-[#651317]">
                Review Hazard Assessment
              </h2>

              {form.reviewStatus === "approved" && (
                <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  Approved
                </span>
              )}

              {form.reviewStatus === "needs_revision" && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                  Needs Revision
                </span>
              )}

              {form.reviewStatus === "pending" && (
                <span className="rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                  Pending Review
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Review the employee-submitted assessment and determine whether it
              should be approved or returned for revision.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* BODY */}
        <form
          onSubmit={handleSaveChanges}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-6 p-6">
            {/* SUBMISSION NOTICE */}
            <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Employee Assessment Submitted
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    This assessment was submitted by the employee and is
                    currently under review.
                  </p>

                  {report?.employee_name && (
                    <p className="mt-2 text-xs font-semibold text-blue-800">
                      Submitted by: {report.employee_name}
                    </p>
                  )}

                  {report?.employee_email && (
                    <p className="text-xs text-blue-700">
                      {report.employee_email}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* REPORT INFORMATION */}
            <section>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Report Information
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Review the original hazard report before reviewing the
                  assessment.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Report
                  </label>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                    {report?.title || report?.report_title || "Hazard Report"}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Report Date
                  </label>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                    {report?.report_date || report?.date_observed || "—"}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Building
                  </label>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                    {report?.building_name || "Unknown Building"}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                    Exact Area
                  </label>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                    {report?.exact_area || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Hazard Description
                </label>

                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-sm leading-6 text-gray-700">
                  {report?.description || "No description provided."}
                </div>
              </div>
            </section>

            {/* REPORT STATUS */}
            <section className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Report Status
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  The report status is controlled by the OSHO review decision.
                </p>
              </div>

              <div className="max-w-md">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Current Report Status
                </label>

                <div className="flex h-10 w-full items-center rounded-lg border border-yellow-200 bg-yellow-50 px-3 text-sm font-semibold text-yellow-700">
                  {form.reportStatus === "resolved"
                    ? "Resolved"
                    : "Under Review"}
                </div>
              </div>
            </section>

            {/* RISK */}
            <section className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Risk Assessment
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Review or modify the employee's likelihood and severity
                  ratings.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Assessment Date *
                  </label>

                  <input
                    type="date"
                    name="assessmentDate"
                    value={form.assessmentDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Likelihood *
                  </label>

                  <select
                    name="likelihood"
                    value={form.likelihood}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  >
                    <option value="">Select likelihood</option>

                    <option value="1">1 — Rare</option>

                    <option value="2">2 — Unlikely</option>

                    <option value="3">3 — Possible</option>

                    <option value="4">4 — Likely</option>

                    <option value="5">5 — Almost Certain</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Severity *
                  </label>

                  <select
                    name="severity"
                    value={form.severity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  >
                    <option value="">Select severity</option>

                    <option value="1">1 — Insignificant</option>

                    <option value="2">2 — Minor</option>

                    <option value="3">3 — Moderate</option>

                    <option value="4">4 — Major</option>

                    <option value="5">5 — Severe</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                    Risk Score
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {riskScore ?? "—"}
                    </span>

                    {riskScore && (
                      <span className="mb-1 text-xs text-gray-400">/ 25</span>
                    )}
                  </div>
                </div>

                <div className={`rounded-xl border p-4 ${getRiskClass()}`}>
                  <p className="text-xs font-semibold tracking-wide uppercase opacity-70">
                    Risk Level
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {riskLevel || "Not Rated"}
                  </p>
                </div>
              </div>
            </section>

            {/* CONTROL */}
            <section className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Control Measures
                </h3>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Control Action *
                </label>

                <textarea
                  name="controlAction"
                  value={form.controlAction}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe the control measures or corrective actions..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Responsible Unit / Person
                  </label>

                  <input
                    type="text"
                    name="responsibleUnit"
                    value={form.responsibleUnit}
                    onChange={handleChange}
                    placeholder="e.g. Maintenance Office"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Target Date
                  </label>

                  <input
                    type="date"
                    name="targetDate"
                    value={form.targetDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Expected Output
                </label>

                <textarea
                  name="expectedOutput"
                  value={form.expectedOutput}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the expected result..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                />
              </div>
            </section>

            {/* IMPLEMENTATION */}
            <section className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Implementation
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Assessment Status
                  </label>

                  <div className="flex h-10 w-full items-center rounded-lg border border-yellow-200 bg-yellow-50 px-3 text-sm font-semibold text-yellow-700">
                    Under Review
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Accomplished Date
                  </label>

                  <input
                    type="date"
                    name="accomplishedDate"
                    value={form.accomplishedDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>
              </div>
            </section>

            {/* OSHO REVIEW */}
            <section className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  OSHO Review
                </h3>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Review Status
                </label>

                <div
                  className={`flex h-10 w-full items-center rounded-lg border px-3 text-sm font-semibold ${
                    form.reviewStatus === "approved"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : form.reviewStatus === "needs_revision"
                        ? "border-orange-200 bg-orange-50 text-orange-700"
                        : "border-yellow-200 bg-yellow-50 text-yellow-700"
                  }`}
                >
                  {form.reviewStatus === "approved"
                    ? "Approved"
                    : form.reviewStatus === "needs_revision"
                      ? "Needs Revision"
                      : "Pending Review"}
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  OSHO Review Remarks
                </label>

                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add OSHO comments, observations, or required revisions..."
                  className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-700 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                />
              </div>
            </section>

            {/* ERROR */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-500">
              {form.reviewStatus === "approved" ? (
                <span className="font-medium text-green-700">
                  This assessment has been approved by OSHO.
                </span>
              ) : form.reviewStatus === "needs_revision" ? (
                <span className="font-medium text-orange-700">
                  Revision has been requested from the employee.
                </span>
              ) : (
                <span>Review the assessment before approving it.</span>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {report.review_status === "approved" &&
                (report.report_status || report.status) !== "resolved" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={(event) => handleSubmit(event, "complete")}
                    className="rounded-lg bg-[#A6292F] px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Confirm completion &amp; resolve
                  </button>
                )}
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRequestRevision}
                disabled={saving || !report.assessment_id}
                className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Request Revision"}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save for Review"}
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={saving || !report.assessment_id}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F2228] disabled:opacity-60"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {saving ? "Processing..." : "Approve Assessment"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HazardAssessmentModal;
