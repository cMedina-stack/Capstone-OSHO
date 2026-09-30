import { today } from "../../../shared/date";
import { apiFetch } from "../../../shared/api";
import { useEffect, useMemo, useState } from "react";

import {
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

const initialForm = {
  assessmentDate: today(),

  // Findings
  incidentFinding: "",

  // Cause analysis
  immediateCause: "",
  contributingFactors: "",
  rootCause: "",

  // Consequences
  actualConsequence: "",
  potentialConsequence: "",

  // Initial risk
  initialLikelihood: "",
  initialSeverity: "",

  // Actions
  correctiveAction: "",
  preventiveAction: "",
  responsibleUnit: "",
  targetDate: "",

  // Residual risk
  residualLikelihood: "",
  residualSeverity: "",

  // Implementation
  assessmentStatus: "under_review",
  accomplishedDate: "",

  // OSHO review
  oshoRemarks: "",
};

const statusOptions = [
  { value: "resolved", label: "Resolved" },
  {
    value: "under_review",
    label: "Under Review",
  },
  {
    value: "action_required",
    label: "Action Required",
  },
  {
    value: "monitoring",
    label: "Monitoring",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

const likelihoodOptions = [
  {
    value: "1",
    label: "1 - Rare",
    description: "Very unlikely to occur",
  },
  {
    value: "2",
    label: "2 - Unlikely",
    description: "Could occur occasionally",
  },
  {
    value: "3",
    label: "3 - Possible",
    description: "Might occur",
  },
  {
    value: "4",
    label: "4 - Likely",
    description: "Expected to occur",
  },
  {
    value: "5",
    label: "5 - Almost Certain",
    description: "Expected to occur frequently",
  },
];

const severityOptions = [
  {
    value: "1",
    label: "1 - Insignificant",
    description: "Minimal impact",
  },
  {
    value: "2",
    label: "2 - Minor",
    description: "Minor injury or disruption",
  },
  {
    value: "3",
    label: "3 - Moderate",
    description: "Medical treatment or moderate disruption",
  },
  {
    value: "4",
    label: "4 - Major",
    description: "Serious injury or major disruption",
  },
  {
    value: "5",
    label: "5 - Severe",
    description: "Fatality, permanent disability, or severe impact",
  },
];

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getRiskLevel = (score) => {
  if (!score) return "Not Rated";

  if (score <= 4) return "Low";
  if (score <= 9) return "Moderate";
  if (score <= 16) return "High";

  return "Critical";
};

const getRiskClasses = (level) => {
  switch (level) {
    case "Low":
      return "border-green-200 bg-green-50 text-green-700";

    case "Moderate":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "High":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Critical":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-500";
  }
};

export default function IncidentAssessment({
  admin = false,
  isOpen,
  onClose,
  incidentId,
  onSuccess,
}) {
  const [form, setForm] = useState(initialForm);

  const [assessment, setAssessment] = useState(null);
  const [incident, setIncident] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // RISK CALCULATIONS
  // ============================================================

  const initialRiskScore = useMemo(() => {
    const likelihood = Number(form.initialLikelihood);
    const severity = Number(form.initialSeverity);

    if (!likelihood || !severity) {
      return null;
    }

    return likelihood * severity;
  }, [form.initialLikelihood, form.initialSeverity]);

  const initialRiskLevel = useMemo(
    () => getRiskLevel(initialRiskScore),
    [initialRiskScore],
  );

  const residualRiskScore = useMemo(() => {
    const likelihood = Number(form.residualLikelihood);
    const severity = Number(form.residualSeverity);

    if (!likelihood || !severity) {
      return null;
    }

    return likelihood * severity;
  }, [form.residualLikelihood, form.residualSeverity]);

  const residualRiskLevel = useMemo(
    () => getRiskLevel(residualRiskScore),
    [residualRiskScore],
  );

  // ============================================================
  // LOAD INCIDENT + ASSESSMENT
  // ============================================================

  useEffect(() => {
    if (!isOpen || !incidentId) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        // --------------------------------------------------------
        // Load incident
        // --------------------------------------------------------

        const incidentResponse = await apiFetch(
          `/api/incidents/${incidentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const incidentData = await incidentResponse.json();

        if (!incidentResponse.ok) {
          throw new Error(
            incidentData.error ||
              incidentData.message ||
              "Failed to load incident.",
          );
        }

        // --------------------------------------------------------
        // Load assessment
        // --------------------------------------------------------

        const assessmentResponse = await apiFetch(
          `/api/incident-assessments/incident/${incidentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const assessmentData = await assessmentResponse.json();

        if (!assessmentResponse.ok) {
          throw new Error(
            assessmentData.error ||
              assessmentData.message ||
              "Failed to load assessment.",
          );
        }

        if (cancelled) return;

        setIncident(
          incidentData.incident || incidentData.report || incidentData,
        );

        const existingAssessment = assessmentData.assessments?.[0] || null;

        setAssessment(existingAssessment);

        // --------------------------------------------------------
        // Existing assessment
        // --------------------------------------------------------

        if (existingAssessment) {
          setForm({
            assessmentDate: existingAssessment.assessment_date || today(),

            incidentFinding: existingAssessment.incident_finding || "",

            immediateCause: existingAssessment.immediate_cause || "",

            contributingFactors: existingAssessment.contributing_factors || "",

            rootCause: existingAssessment.root_cause || "",

            actualConsequence: existingAssessment.actual_consequence || "",

            potentialConsequence:
              existingAssessment.potential_consequence || "",

            initialLikelihood:
              existingAssessment.initial_likelihood?.toString() || "",

            initialSeverity:
              existingAssessment.initial_severity?.toString() || "",

            correctiveAction: existingAssessment.corrective_action || "",

            preventiveAction: existingAssessment.preventive_action || "",

            responsibleUnit: existingAssessment.responsible_unit || "",

            targetDate: existingAssessment.target_date || "",

            residualLikelihood:
              existingAssessment.residual_likelihood?.toString() || "",

            residualSeverity:
              existingAssessment.residual_severity?.toString() || "",

            assessmentStatus:
              existingAssessment.assessment_status || "under_review",

            accomplishedDate: existingAssessment.accomplished_date || "",

            oshoRemarks: existingAssessment.osho_remarks || "",
          });
        } else {
          // ------------------------------------------------------
          // New assessment
          // ------------------------------------------------------

          setForm({
            ...initialForm,
            assessmentDate: today(),
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("LOAD INCIDENT ASSESSMENT ERROR:", err);

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load incident assessment.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [isOpen, incidentId]);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event, reviewAction = "save") => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (!incidentId) {
        throw new Error("Invalid incident report.");
      }

      // --------------------------------------------------------
      // Required validation
      // --------------------------------------------------------

      if (!form.assessmentDate) {
        throw new Error("Assessment date is required.");
      }

      if (!form.incidentFinding.trim()) {
        throw new Error("Incident finding is required.");
      }

      if (!form.initialLikelihood) {
        throw new Error("Initial likelihood is required.");
      }

      if (!form.initialSeverity) {
        throw new Error("Initial severity is required.");
      }

      if (!form.correctiveAction.trim()) {
        throw new Error("Corrective action is required.");
      }

      // --------------------------------------------------------
      // Payload
      // --------------------------------------------------------

      const payload = {
        incidentId,
        reviewAction,

        assessmentDate: form.assessmentDate,

        incidentFinding: form.incidentFinding.trim(),

        immediateCause: form.immediateCause.trim() || null,

        contributingFactors: form.contributingFactors.trim() || null,

        rootCause: form.rootCause.trim() || null,

        actualConsequence: form.actualConsequence.trim() || null,

        potentialConsequence: form.potentialConsequence.trim() || null,

        // Initial risk
        initialLikelihood: Number(form.initialLikelihood),

        initialSeverity: Number(form.initialSeverity),

        // Actions
        correctiveAction: form.correctiveAction.trim(),

        preventiveAction: form.preventiveAction.trim() || null,

        responsibleUnit: form.responsibleUnit.trim() || null,

        targetDate: form.targetDate || null,

        // Residual risk
        residualLikelihood: form.residualLikelihood
          ? Number(form.residualLikelihood)
          : null,

        residualSeverity: form.residualSeverity
          ? Number(form.residualSeverity)
          : null,

        // Implementation
        assessmentStatus: form.assessmentStatus,

        accomplishedDate: form.accomplishedDate || null,

        // OSHO remarks
        oshoRemarks: form.oshoRemarks.trim() || null,
      };

      const isEditing = Boolean(assessment?.assessment_id);

      const url = isEditing
        ? `/api/incident-assessments/${assessment.assessment_id}`
        : "/api/incident-assessments";

      const method = isEditing ? "PUT" : "POST";

      const response = await apiFetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to save incident assessment.",
        );
      }

      setSuccess(
        isEditing
          ? "Incident assessment updated successfully."
          : "Incident assessment recorded successfully.",
      );

      if (onSuccess) {
        onSuccess(data.assessment);
      }
    } catch (err) {
      console.error("SAVE INCIDENT ASSESSMENT ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save incident assessment.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    if (saving) return;

    setError("");
    setSuccess("");

    onClose();
  };

  // ============================================================
  // DO NOT RENDER WHEN CLOSED
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // MODAL
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#F8F6F2] shadow-2xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FBEAEC] p-2">
              <ClipboardDocumentCheckIcon className="size-6 text-[#A6292F]" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#340306]">
                Incident Assessment
              </h2>

              <p className="text-xs text-[#8A7A6A]">
                OSHO investigation, risk assessment, and corrective action
                review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XMarkIcon className="size-5" />
          </button>
        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="overflow-y-auto">
          {loading ? (
            <div className="space-y-5 p-6">
              <div className="h-24 animate-pulse rounded-2xl bg-white" />
              <div className="h-48 animate-pulse rounded-2xl bg-white" />
              <div className="h-48 animate-pulse rounded-2xl bg-white" />
              <div className="h-48 animate-pulse rounded-2xl bg-white" />
            </div>
          ) : (
            <>
              {assessment?.review_status && (
                <p className="mx-6 rounded-lg border border-gray-200 bg-white p-3 text-sm text-[#5F5147]">
                  OSHO review: {assessment.review_status.replaceAll("_", " ")}.{" "}
                  {assessment.review_status === "needs_revision"
                    ? assessment.osho_remarks
                    : "Saving changes submits the assessment for review again."}
                </p>
              )}
              <form onSubmit={handleSubmit} className="space-y-6 p-6">
                {/* ==================================================
                  ERROR
              ================================================== */}

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <ExclamationTriangleIcon className="size-5 shrink-0 text-red-600" />

                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Unable to save assessment
                      </p>

                      <p className="mt-1 text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* ==================================================
                  SUCCESS
              ================================================== */}

                {success && (
                  <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                    <CheckCircleIcon className="size-5 shrink-0 text-green-600" />

                    <div>
                      <p className="text-sm font-semibold text-green-700">
                        Assessment saved
                      </p>

                      <p className="mt-1 text-sm text-green-600">{success}</p>
                    </div>
                  </div>
                )}

                {/* ==================================================
                  INCIDENT SUMMARY
              ================================================== */}

                {incident && (
                  <section className="rounded-2xl border border-[#E8DDD6] bg-white p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-2">
                        <MagnifyingGlassIcon className="size-5 text-blue-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#340306]">
                          Incident Under Review
                        </h3>

                        <p className="text-xs text-[#8A7A6A]">
                          Review the original incident before completing the
                          assessment.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Person Involved
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#340306]">
                          {incident.name || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Location
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#340306]">
                          {incident.building_name ||
                            incident.building_id ||
                            "Not specified"}
                        </p>

                        {incident.exact_area && (
                          <p className="mt-1 text-xs text-[#8A7A6A]">
                            {incident.exact_area}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Incident Date
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#340306]">
                          {formatDate(incident.report_date)}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* ==================================================
                  SECTION 1 — ASSESSMENT INFORMATION
              ================================================== */}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-[#FBEAEC] p-2">
                      <ClipboardDocumentCheckIcon className="size-5 text-[#A6292F]" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Assessment Information
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Basic information about the OSHO investigation.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="assessmentDate"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Assessment Date
                        <span className="text-red-500"> *</span>
                      </label>

                      <input
                        id="assessmentDate"
                        name="assessmentDate"
                        type="date"
                        value={form.assessmentDate}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="assessmentStatus"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Implementation Status
                      </label>

                      <select
                        disabled
                        title="Status is updated through review and completion actions."
                        id="assessmentStatus"
                        name="assessmentStatus"
                        value={form.assessmentStatus}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* ==================================================
                  SECTION 2 — FINDINGS
              ================================================== */}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2">
                      <MagnifyingGlassIcon className="size-5 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Incident Findings
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Record what OSHO determined from the incident review.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="incidentFinding"
                      className="mb-2 block text-sm font-medium text-[#5F5147]"
                    >
                      Incident Finding
                      <span className="text-red-500"> *</span>
                    </label>

                    <textarea
                      id="incidentFinding"
                      name="incidentFinding"
                      value={form.incidentFinding}
                      onChange={handleChange}
                      rows={5}
                      required
                      placeholder="Describe what was determined after reviewing the incident..."
                      className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                    />
                  </div>
                </section>

                {/* ==================================================
                  SECTION 3 — CAUSE ANALYSIS
              ================================================== */}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-orange-50 p-2">
                      <ExclamationTriangleIcon className="size-5 text-orange-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Cause Analysis
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Identify the factors that contributed to the incident.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="immediateCause"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Immediate Cause
                      </label>

                      <textarea
                        id="immediateCause"
                        name="immediateCause"
                        value={form.immediateCause}
                        onChange={handleChange}
                        rows={3}
                        placeholder="What directly caused the incident?"
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contributingFactors"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Contributing Factors
                      </label>

                      <textarea
                        id="contributingFactors"
                        name="contributingFactors"
                        value={form.contributingFactors}
                        onChange={handleChange}
                        rows={3}
                        placeholder="What conditions, actions, or circumstances contributed to the incident?"
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="rootCause"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Root Cause
                      </label>

                      <textarea
                        id="rootCause"
                        name="rootCause"
                        value={form.rootCause}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Identify the underlying cause or system/process issue that allowed the incident to occur."
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>
                  </div>
                </section>

                {/* ==================================================
                  SECTION 4 — CONSEQUENCE
              ================================================== */}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-red-50 p-2">
                      <ExclamationTriangleIcon className="size-5 text-red-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Consequence Assessment
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Document the actual and potential consequences.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="actualConsequence"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Actual Consequence
                      </label>

                      <textarea
                        id="actualConsequence"
                        name="actualConsequence"
                        value={form.actualConsequence}
                        onChange={handleChange}
                        rows={5}
                        placeholder="What actually happened as a result of the incident?"
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="potentialConsequence"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Potential Consequence
                      </label>

                      <textarea
                        id="potentialConsequence"
                        name="potentialConsequence"
                        value={form.potentialConsequence}
                        onChange={handleChange}
                        rows={5}
                        placeholder="What could have happened if the incident had resulted in a more serious outcome?"
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>
                  </div>
                </section>

                {/* ==================================================
                  SECTION 5 — INITIAL RISK
              ================================================== */}

                <section className="rounded-2xl border border-[#E8DDD6] bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-orange-50 p-2">
                      <ShieldExclamationIcon className="size-5 text-orange-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Initial Risk Assessment
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Assess the level of risk associated with the incident
                        before corrective controls are implemented.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {/* Likelihood */}

                    <div>
                      <label
                        htmlFor="initialLikelihood"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Likelihood
                        <span className="text-red-500"> *</span>
                      </label>

                      <select
                        id="initialLikelihood"
                        name="initialLikelihood"
                        value={form.initialLikelihood}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      >
                        <option value="">Select likelihood</option>

                        {likelihoodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {form.initialLikelihood && (
                        <p className="mt-1.5 text-xs text-[#8A7A6A]">
                          {
                            likelihoodOptions.find(
                              (item) => item.value === form.initialLikelihood,
                            )?.description
                          }
                        </p>
                      )}
                    </div>

                    {/* Severity */}

                    <div>
                      <label
                        htmlFor="initialSeverity"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Severity
                        <span className="text-red-500"> *</span>
                      </label>

                      <select
                        id="initialSeverity"
                        name="initialSeverity"
                        value={form.initialSeverity}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      >
                        <option value="">Select severity</option>

                        {severityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {form.initialSeverity && (
                        <p className="mt-1.5 text-xs text-[#8A7A6A]">
                          {
                            severityOptions.find(
                              (item) => item.value === form.initialSeverity,
                            )?.description
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Risk Result */}

                  <div className="mt-5 rounded-2xl border border-gray-200 bg-[#F8F6F2] p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Initial Risk Score
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#340306]">
                          {initialRiskScore ?? "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Initial Risk Level
                        </p>

                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRiskClasses(
                              initialRiskLevel,
                            )}`}
                          >
                            {initialRiskLevel}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Calculation
                        </p>

                        <p className="mt-2 text-sm font-medium text-[#5F5147]">
                          {form.initialLikelihood && form.initialSeverity
                            ? `${form.initialLikelihood} × ${form.initialSeverity}`
                            : "Select values"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ==================================================
                  SECTION 6 — ACTIONS
              ================================================== */}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-green-50 p-2">
                      <WrenchScrewdriverIcon className="size-5 text-green-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Corrective and Preventive Actions
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Define the actions required to address the identified
                        causes and prevent recurrence.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label
                        htmlFor="correctiveAction"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Corrective Action
                        <span className="text-red-500"> *</span>
                      </label>

                      <textarea
                        id="correctiveAction"
                        name="correctiveAction"
                        value={form.correctiveAction}
                        onChange={handleChange}
                        rows={4}
                        required
                        placeholder="What action must be taken to correct the identified issue?"
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="preventiveAction"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Preventive Action
                      </label>

                      <textarea
                        id="preventiveAction"
                        name="preventiveAction"
                        value={form.preventiveAction}
                        onChange={handleChange}
                        rows={4}
                        placeholder="What should be implemented to prevent a similar incident from happening again?"
                        className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="responsibleUnit"
                          className="mb-2 block text-sm font-medium text-[#5F5147]"
                        >
                          Responsible Unit
                        </label>

                        <input
                          id="responsibleUnit"
                          name="responsibleUnit"
                          type="text"
                          value={form.responsibleUnit}
                          onChange={handleChange}
                          placeholder="e.g. OSHO, Facilities Management"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="targetDate"
                          className="mb-2 block text-sm font-medium text-[#5F5147]"
                        >
                          Target Completion Date
                        </label>

                        <input
                          id="targetDate"
                          name="targetDate"
                          type="date"
                          value={form.targetDate}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ==================================================
                  SECTION 7 — RESIDUAL RISK
              ================================================== */}

                <section className="rounded-2xl border border-[#E8DDD6] bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2">
                      <ShieldExclamationIcon className="size-5 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Residual Risk Assessment
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Assess the remaining risk after corrective and
                        preventive controls are implemented.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="residualLikelihood"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Residual Likelihood
                      </label>

                      <select
                        id="residualLikelihood"
                        name="residualLikelihood"
                        value={form.residualLikelihood}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      >
                        <option value="">Select likelihood</option>

                        {likelihoodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="residualSeverity"
                        className="mb-2 block text-sm font-medium text-[#5F5147]"
                      >
                        Residual Severity
                      </label>

                      <select
                        id="residualSeverity"
                        name="residualSeverity"
                        value={form.residualSeverity}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                      >
                        <option value="">Select severity</option>

                        {severityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-gray-200 bg-[#F8F6F2] p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Residual Risk Score
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#340306]">
                          {residualRiskScore ?? "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Residual Risk Level
                        </p>

                        <div className="mt-2">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRiskClasses(
                              residualRiskLevel,
                            )}`}
                          >
                            {residualRiskLevel}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                          Risk Reduction
                        </p>

                        <p className="mt-2 text-sm font-semibold text-[#5F5147]">
                          {initialRiskScore && residualRiskScore
                            ? initialRiskScore - residualRiskScore
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ==================================================
                  SECTION 8 — FOLLOW UP
              ================================================== */}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-green-50 p-2">
                      <CheckCircleIcon className="size-5 text-green-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        Implementation and Follow-up
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Record the implementation status and completion of
                        corrective actions.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="accomplishedDate"
                      className="mb-2 block text-sm font-medium text-[#5F5147]"
                    >
                      Accomplished Date
                    </label>

                    <input
                      id="accomplishedDate"
                      name="accomplishedDate"
                      type="date"
                      value={form.accomplishedDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 sm:w-1/2"
                    />
                  </div>
                </section>

                {/* ==================================================
                  SECTION 9 — OSHO REVIEW
              ================================================== */}

                <section className="rounded-2xl border border-[#E8DDD6] bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-xl bg-[#FBEAEC] p-2">
                      <ClipboardDocumentCheckIcon className="size-5 text-[#A6292F]" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#340306]">
                        OSHO Review / Conclusion
                      </h3>

                      <p className="text-xs text-[#8A7A6A]">
                        Record final observations, follow-up requirements, or
                        closure remarks.
                      </p>
                    </div>
                  </div>

                  <textarea
                    id="oshoRemarks"
                    name="oshoRemarks"
                    value={form.oshoRemarks}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Enter the final assessment, observations, follow-up requirements, or closure remarks..."
                    className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm leading-6 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
                  />
                </section>

                {/* ==================================================
                  FOOTER
              ================================================== */}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={saving}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  {admin && assessment && (
                    <>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={(event) => handleSubmit(event, "revision")}
                        className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-2.5 font-semibold text-orange-700"
                      >
                        Request revision
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={(event) => handleSubmit(event, "approve")}
                        className="rounded-xl bg-[#A6292F] px-5 py-2.5 font-semibold text-white"
                      >
                        Approve assessment
                      </button>
                      {assessment.review_status === "approved" &&
                        assessment.assessment_status !== "resolved" && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={(event) => handleSubmit(event, "complete")}
                            className="rounded-xl bg-[#A6292F] px-5 py-2.5 font-semibold text-white"
                          >
                            Confirm completion &amp; resolve
                          </button>
                        )}
                    </>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-xl bg-[#A6292F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F2227] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : assessment
                        ? "Submit Changes for Review"
                        : "Save Assessment"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
