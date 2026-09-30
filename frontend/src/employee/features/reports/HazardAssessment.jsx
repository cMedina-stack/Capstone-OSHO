import { today } from "../../../shared/date";
import { apiFetch } from "../../../shared/api";
import { useEffect, useMemo, useState } from "react";

import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const HazardAssessment = ({ isOpen, onClose, hazardId, onSuccess }) => {
  const [assessmentId, setAssessmentId] = useState(null);
  const [existingAssessment, setExistingAssessment] = useState(null);
  const [fetchingAssessment, setFetchingAssessment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    assessmentDate: today(),
    likelihood: "",
    severity: "",
    controlAction: "",
    responsibleUnit: "",
    expectedOutput: "",
    targetDate: "",
    assessmentStatus: "under_review",
    accomplishedDate: "",
    remarks: "",
  });

  // ============================================================
  // CALCULATE RISK SCORE
  // ============================================================

  const riskScore = useMemo(() => {
    if (!formData.likelihood || !formData.severity) {
      return "";
    }

    return Number(formData.likelihood) * Number(formData.severity);
  }, [formData.likelihood, formData.severity]);

  // ============================================================
  // CALCULATE RISK LEVEL
  // ============================================================

  const riskLevel = useMemo(() => {
    if (!riskScore) {
      return "";
    }

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

  // ============================================================
  // RISK LEVEL STYLING
  // ============================================================

  const riskLevelClass = useMemo(() => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";

      case "Moderate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";

      case "High":
        return "bg-orange-100 text-orange-700 border-orange-200";

      case "Critical":
        return "bg-red-100 text-red-700 border-red-200";

      default:
        return "bg-neutral-100 text-neutral-500 border-neutral-200";
    }
  }, [riskLevel]);

  // ============================================================
  // FETCH EXISTING ASSESSMENT
  // ============================================================

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!isOpen || !hazardId) {
        return;
      }

      try {
        setFetchingAssessment(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await apiFetch(
          `/api/hazard-assessments/hazard/${hazardId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to retrieve hazard assessment.",
          );
        }

        /*
          Your controller may return:

          {
            assessments: [...]
          }

          or directly:

          [...]
        */

        const assessment = Array.isArray(data)
          ? data[0]
          : data.assessments?.[0] || null;

        // ======================================================
        // NO EXISTING ASSESSMENT
        // ======================================================

        if (!assessment) {
          setAssessmentId(null);
          setExistingAssessment(null);

          setFormData({
            assessmentDate: today(),
            likelihood: "",
            severity: "",
            controlAction: "",
            responsibleUnit: "",
            expectedOutput: "",
            targetDate: "",
            assessmentStatus: "under_review",
            accomplishedDate: "",
            remarks: "",
          });

          return;
        }

        // ======================================================
        // EXISTING ASSESSMENT FOUND
        // ======================================================

        setAssessmentId(assessment.assessment_id);
        setExistingAssessment(assessment);

        setFormData({
          assessmentDate: assessment.assessment_date || today(),

          likelihood:
            assessment.likelihood !== null &&
            assessment.likelihood !== undefined
              ? String(assessment.likelihood)
              : "",

          severity:
            assessment.severity !== null && assessment.severity !== undefined
              ? String(assessment.severity)
              : "",

          controlAction: assessment.control_action || "",

          responsibleUnit: assessment.responsible_unit || "",

          expectedOutput: assessment.expected_output || "",

          targetDate: assessment.target_date || "",

          // IMPORTANT:
          // Employee assessment is always UNDER REVIEW.
          assessmentStatus: "under_review",

          accomplishedDate: assessment.accomplished_date || "",

          remarks: assessment.remarks || "",
        });
      } catch (err) {
        console.error("Fetch assessment error:", err);

        setError(err.message || "Failed to load hazard assessment.");
      } finally {
        setFetchingAssessment(false);
      }
    };

    fetchAssessment();
  }, [isOpen, hazardId]);

  // ============================================================
  // RESET ERROR WHEN MODAL OPENS
  // ============================================================

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // SUBMIT ASSESSMENT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (!formData.likelihood || !formData.severity) {
      setError("Please provide both likelihood and severity.");
      return;
    }

    if (!formData.controlAction.trim()) {
      setError("Please provide the required control or corrective action.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ========================================================
      // CREATE OR UPDATE
      // ========================================================

      const url = assessmentId
        ? `/api/hazard-assessments/${assessmentId}`
        : "/api/hazard-assessments";

      const method = assessmentId ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          hazardId,

          assessmentDate: formData.assessmentDate,

          likelihood: Number(formData.likelihood),

          severity: Number(formData.severity),

          controlAction: formData.controlAction.trim(),

          responsibleUnit: formData.responsibleUnit.trim() || null,

          expectedOutput: formData.expectedOutput.trim() || null,

          targetDate: formData.targetDate || null,

          // IMPORTANT:
          // Employee can only submit the assessment
          // as UNDER REVIEW.
          assessmentStatus: "under_review",

          accomplishedDate: formData.accomplishedDate || null,

          remarks: formData.remarks.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save hazard assessment.");
      }

      // ========================================================
      // SUCCESS
      // ========================================================

      onSuccess?.(data);

      onClose();
    } catch (err) {
      console.error("Assessment error:", err);

      setError(err.message || "Failed to save assessment.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  // ============================================================
  // DO NOT RENDER
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#F8F6F2] shadow-2xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#A6292F]/10 text-[#A6292F]">
              <ClipboardDocumentCheckIcon className="size-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {assessmentId ? "Hazard Assessment" : "New Hazard Assessment"}
              </h2>

              <p className="text-sm text-neutral-500">
                {assessmentId
                  ? "Review or update the existing OSHO risk assessment."
                  : "Perform the formal OSHO risk assessment."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* =====================================================
            LOADING EXISTING ASSESSMENT
        ====================================================== */}

        {fetchingAssessment ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#A6292F]" />

              <p className="text-sm font-medium text-neutral-700">
                Loading assessment...
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                Checking the existing OSHO assessment.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5">
            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0" />

                <div>
                  <p className="font-semibold">Assessment could not be saved</p>

                  <p className="mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                EXISTING ASSESSMENT NOTICE
            ================================================== */}

            {existingAssessment?.review_status && (
              <p className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-[#5F5147]">
                OSHO review:{" "}
                {existingAssessment.review_status.replaceAll("_", " ")}.{" "}
                {existingAssessment.review_status === "needs_revision"
                  ? existingAssessment.remarks
                  : "Saving changes submits the assessment for review again."}
              </p>
            )}
            {assessmentId && existingAssessment && (
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-sm font-semibold text-blue-800">
                  Existing Assessment
                </p>

                <p className="mt-1 text-xs text-blue-700">
                  This hazard already has an assessment. Changes made here will
                  update the existing assessment instead of creating another
                  one.
                </p>
              </div>
            )}

            {/* =================================================
                ASSESSMENT INFORMATION
            ================================================== */}

            <section className="mb-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-5 py-3">
                <h3 className="font-semibold text-neutral-900">
                  Assessment Information
                </h3>

                <p className="mt-0.5 text-xs text-neutral-500">
                  Record the date and formal risk rating of the hazard.
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-3">
                {/* Assessment Date */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Assessment Date
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    name="assessmentDate"
                    value={formData.assessmentDate}
                    onChange={handleChange}
                    required
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>

                {/* Likelihood */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Likelihood
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <select
                    name="likelihood"
                    value={formData.likelihood}
                    onChange={handleChange}
                    required
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  >
                    <option value="">Select likelihood</option>

                    <option value="1">1 - Rare</option>

                    <option value="2">2 - Unlikely</option>

                    <option value="3">3 - Possible</option>

                    <option value="4">4 - Likely</option>

                    <option value="5">5 - Almost Certain</option>
                  </select>
                </div>

                {/* Severity */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Severity
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    required
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  >
                    <option value="">Select severity</option>

                    <option value="1">1 - Insignificant</option>

                    <option value="2">2 - Minor</option>

                    <option value="3">3 - Moderate</option>

                    <option value="4">4 - Major</option>

                    <option value="5">5 - Catastrophic</option>
                  </select>
                </div>
              </div>

              {/* =================================================
                  RISK RESULT
              ================================================== */}

              <div className="border-t border-neutral-200 bg-neutral-50 px-5 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Risk Score */}

                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase">
                      Risk Score
                    </p>

                    <div className="flex h-12 items-center rounded-lg border border-neutral-200 bg-white px-4">
                      <span className="text-2xl font-bold text-neutral-900">
                        {riskScore || "—"}
                      </span>

                      {riskScore && (
                        <span className="ml-2 text-sm text-neutral-500">
                          / 25
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Risk Level */}

                  <div>
                    <p className="mb-1 text-xs font-medium tracking-wide text-neutral-500 uppercase">
                      Risk Level
                    </p>

                    <div
                      className={`flex h-12 items-center rounded-lg border px-4 font-semibold ${riskLevelClass}`}
                    >
                      {riskLevel || "Select likelihood and severity"}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                CONTROL ACTION
            ================================================== */}

            <section className="mb-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-5 py-3">
                <h3 className="font-semibold text-neutral-900">
                  Corrective / Control Action
                </h3>

                <p className="mt-0.5 text-xs text-neutral-500">
                  Define the action required to control or eliminate the hazard.
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-2">
                {/* Control Action */}

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Control / Corrective Action
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <textarea
                    name="controlAction"
                    value={formData.controlAction}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe the corrective action or control measure..."
                    className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>

                {/* Responsible Unit */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Responsible Unit / Office
                  </label>

                  <input
                    type="text"
                    name="responsibleUnit"
                    value={formData.responsibleUnit}
                    onChange={handleChange}
                    placeholder="e.g. General Services Office"
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>

                {/* Expected Output */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Expected Output
                  </label>

                  <input
                    type="text"
                    name="expectedOutput"
                    value={formData.expectedOutput}
                    onChange={handleChange}
                    placeholder="e.g. Hazard removed / area secured"
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                IMPLEMENTATION
            ================================================== */}

            <section className="mb-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-5 py-3">
                <h3 className="font-semibold text-neutral-900">
                  Implementation
                </h3>

                <p className="mt-0.5 text-xs text-neutral-500">
                  Track the implementation of the corrective action.
                </p>
              </div>

              <div className="grid gap-4 p-5 md:grid-cols-3">
                {/* Target Date */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Target Date
                  </label>

                  <input
                    type="date"
                    name="targetDate"
                    value={formData.targetDate}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>

                {/* Assessment Status */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Assessment Status
                  </label>

                  <div className="flex h-10 w-full items-center rounded-lg border border-yellow-200 bg-yellow-50 px-3 text-sm font-semibold text-yellow-700">
                    Under Review
                  </div>

                  <p className="mt-1.5 text-xs text-neutral-500">
                    This assessment will be reviewed by OSHO.
                  </p>
                </div>

                {/* Accomplished Date */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                    Accomplished Date
                  </label>

                  <input
                    type="date"
                    name="accomplishedDate"
                    value={formData.accomplishedDate}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                REMARKS
            ================================================== */}

            <section className="mb-5 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-200 px-5 py-3">
                <h3 className="font-semibold text-neutral-900">Remarks</h3>
              </div>

              <div className="p-5">
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional observations, notes, or recommendations..."
                  className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                />
              </div>
            </section>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8F2227] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? assessmentId
                    ? "Updating Assessment..."
                    : "Submitting Assessment..."
                  : assessmentId
                    ? "Update Assessment"
                    : "Submit Assessment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HazardAssessment;
