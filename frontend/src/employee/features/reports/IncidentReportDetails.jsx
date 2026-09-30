import { apiFetch } from "../../../shared/api";
import { useEffect, useState } from "react";
import {
  NavLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import IncidentAssessment from "./IncidentAssessment";

const statusStyles = {
  draft: {
    label: "Draft",
    background: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  },
  submitted: {
    label: "Submitted",
    background: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  under_review: {
    label: "Under Review",
    background: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  resolved: {
    label: "Resolved",
    background: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    background: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

const riskStyles = {
  low: "bg-green-50 text-green-700",
  moderate: "bg-yellow-50 text-yellow-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700",
};

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

const formatStatus = (status) => {
  return String(status || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatValue = (value) => {
  if (!value) return "Not specified";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function IncidentReportDetails({ admin = false }) {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const backPath = admin ? "/admin/assessments" : "/employee/my-reports";
  const [refreshKey, refresh] = useState(0);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const [showAssessment, setShowAssessment] = useState(
    () => searchParams.get("assessment") === "1",
  );

  useEffect(() => {
    let cancelled = false;

    const getReport = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!reportId) {
          throw new Error("Invalid incident report.");
        }

        const response = await apiFetch(
          `/api/reports/my-reports/incident/${reportId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Failed to retrieve incident report.",
          );
        }

        if (!cancelled) {
          setReport(data.report || data);
        }
      } catch (error) {
        console.error("Incident report details error:", error);

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load incident report.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    getReport();

    return () => {
      cancelled = true;
    };
  }, [reportId, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F2] p-5 md:p-7">
        <div className="animate-pulse">
          <div className="h-6 w-32 rounded bg-gray-200" />
          <div className="mt-6 h-8 w-2/3 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-1/3 rounded bg-gray-200" />
          <div className="mt-8 h-48 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen w-full bg-[#F8F6F2] p-5 md:p-7">
        <NavLink
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B5A4D] transition hover:text-[#A6292F]"
        >
          <ArrowLeftIcon className="size-4" />
          {admin ? "Back to Assessments" : "Back to My Reports"}
        </NavLink>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6">
          <h2 className="font-semibold text-red-700">
            Unable to load incident report
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {error || "The requested report could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const status = statusStyles[report.status] || statusStyles.submitted;

  const risk =
    report.risk_level && riskStyles[String(report.risk_level).toLowerCase()];

  // ---------------------------------------------------------
  // NORMALIZE ARRAY DATA
  // ---------------------------------------------------------

  const incidentTypes = Array.isArray(report.incident_types)
    ? [...new Set(report.incident_types)]
    : [];

  const incidentNatures = Array.isArray(report.incident_natures)
    ? [...new Set(report.incident_natures)]
    : [];

  const workplaceRoles = Array.isArray(report.workplace_roles)
    ? [...new Set(report.workplace_roles)]
    : report.workplace_role
      ? [report.workplace_role]
      : [];

  return (
    <div className="w-full overflow-auto bg-[#F8F6F2] p-5 md:p-7">
      {/* ===================================================== */}
      {/* BACK */}
      {/* ===================================================== */}

      <button
        type="button"
        onClick={() => navigate(backPath)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B5A4D] transition hover:text-[#A6292F]"
      >
        <ArrowLeftIcon className="size-4" />
        {admin ? "Back to Assessments" : "Back to My Reports"}
      </button>

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                Incident Report
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.background} ${status.text}`}
              >
                <span className={`size-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>

              {risk && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${risk}`}
                >
                  Risk:{" "}
                  {String(report.risk_level).charAt(0).toUpperCase() +
                    String(report.risk_level).slice(1)}
                </span>
              )}
            </div>

            <h1 className="mt-4 text-2xl font-bold text-[#340306]">
              {report.report_title || "Incident Report"}
            </h1>

            <p className="mt-2 text-sm text-[#8A7A6A]">
              Report ID: #{report.report_id || report.incident_id}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAssessment(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#A6292F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8F2227] focus:ring-2 focus:ring-[#A6292F] focus:ring-offset-2 focus:outline-none"
          >
            <ClipboardDocumentListIcon className="size-4" />
            Assessment
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* =================================================== */}
        {/* LEFT */}
        {/* =================================================== */}

        <div className="space-y-6 lg:col-span-2">
          {/* LOCATION */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#FBEAEC] p-2">
                <MapPinIcon className="size-5 text-[#A6292F]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#340306]">Location</h2>

                <p className="text-xs text-[#8A7A6A]">
                  Where the incident occurred
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Building
                </p>

                <p className="mt-1 font-medium text-[#340306]">
                  {report.building_name ||
                    report.building_id ||
                    "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Exact Area
                </p>

                <p className="mt-1 font-medium text-[#340306]">
                  {report.exact_area || "Not specified"}
                </p>
              </div>
            </div>
          </section>

          {/* PERSON */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#FBEAEC] p-2">
                <UserIcon className="size-5 text-[#A6292F]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#340306]">
                  Person Involved
                </h2>

                <p className="text-xs text-[#8A7A6A]">
                  Information about the affected person
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Name
                </p>

                <p className="mt-1 font-medium text-[#340306]">
                  {report.name || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Workplace Role
                </p>

                {workplaceRoles.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {workplaceRoles.map((role, index) => (
                      <span
                        key={`${role}-${index}`}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                      >
                        {formatValue(role)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 font-medium text-[#340306]">
                    Not specified
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Age
                </p>

                <p className="mt-1 font-medium text-[#340306]">
                  {report.age || "Not specified"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Sex
                </p>

                <p className="mt-1 font-medium text-[#340306]">
                  {formatValue(report.sex)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Contact Number
                </p>

                <p className="mt-1 font-medium text-[#340306]">
                  {report.contact_number || "Not provided"}
                </p>
              </div>
            </div>
          </section>

          {/* CLASSIFICATION */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2">
                <ExclamationTriangleIcon className="size-5 text-orange-600" />
              </div>

              <div>
                <h2 className="font-semibold text-[#340306]">
                  Incident Classification
                </h2>

                <p className="text-xs text-[#8A7A6A]">
                  Classification provided by the reporter
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Incident Type
                </p>

                {incidentTypes.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {incidentTypes.map((type, index) => (
                      <span
                        key={`${type}-${index}`}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                      >
                        {formatValue(type)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#5F5147]">Not specified.</p>
                )}

                {report.incident_type_others && (
                  <p className="mt-2 text-sm text-[#5F5147]">
                    <span className="font-medium">Others:</span>{" "}
                    {report.incident_type_others}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Nature of Incident
                </p>

                {incidentNatures.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {incidentNatures.map((nature, index) => (
                      <span
                        key={`${nature}-${index}`}
                        className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700"
                      >
                        {formatValue(nature)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[#5F5147]">Not specified.</p>
                )}

                {report.incident_nature_others && (
                  <p className="mt-2 text-sm text-[#5F5147]">
                    <span className="font-medium">Others:</span>{" "}
                    {report.incident_nature_others}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* INCIDENT DETAILS */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#FBEAEC] p-2">
                <ClipboardDocumentListIcon className="size-5 text-[#A6292F]" />
              </div>

              <h2 className="font-semibold text-[#340306]">Incident Details</h2>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-[#5F5147]">
                  {report.description || "No description provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Injury / Damage Details
                </p>

                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-[#5F5147]">
                  {report.injury_details ||
                    "No injury or damage details provided."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                  Action Taken
                </p>

                <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-[#5F5147]">
                  {report.action_taken || "No action recorded."}
                </p>
              </div>
            </div>
          </section>

          {/* WITNESS */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-[#FBEAEC] p-2">
                <UserIcon className="size-5 text-[#A6292F]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#340306]">
                  Witness Information
                </h2>

                <p className="text-xs text-[#8A7A6A]">
                  Information provided about the witness
                </p>
              </div>
            </div>

            {report.witness_name ? (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                    Name
                  </p>

                  <p className="mt-1 font-medium text-[#340306]">
                    {report.witness_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                    Designation
                  </p>

                  <p className="mt-1 font-medium text-[#340306]">
                    {report.witness_designation || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium tracking-wide text-[#8A7A6A] uppercase">
                    Contact Number
                  </p>

                  <p className="mt-1 font-medium text-[#340306]">
                    {report.witness_contact_number || "Not provided"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  No witness information was provided.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* =================================================== */}
        {/* RIGHT */}
        {/* =================================================== */}

        <div className="space-y-6">
          {/* REPORT DATE */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#FBEAEC] p-2">
                <CalendarDaysIcon className="size-5 text-[#A6292F]" />
              </div>

              <div>
                <p className="text-xs tracking-wide text-[#8A7A6A] uppercase">
                  Report Date
                </p>

                <p className="mt-1 font-semibold text-[#340306]">
                  {formatDate(report.report_date)}
                </p>
              </div>
            </div>
          </section>

          {/* ASSESSMENT */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-2">
                <ClipboardDocumentListIcon className="size-5 text-orange-600" />
              </div>

              <div>
                <h2 className="font-semibold text-[#340306]">
                  Incident Assessment
                </h2>

                <p className="text-xs text-[#8A7A6A]">OSHO assessment</p>
              </div>
            </div>

            {report.risk_level ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs tracking-wide text-[#8A7A6A] uppercase">
                    Risk Level
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-lg px-3 py-2 text-sm font-semibold ${
                      risk || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {String(report.risk_level).charAt(0).toUpperCase() +
                      String(report.risk_level).slice(1)}
                  </span>
                </div>

                {report.risk_score != null && (
                  <div>
                    <p className="text-xs tracking-wide text-[#8A7A6A] uppercase">
                      Risk Score
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#340306]">
                      {report.risk_score}
                    </p>
                  </div>
                )}

                {report.assessment_date && (
                  <div>
                    <p className="text-xs tracking-wide text-[#8A7A6A] uppercase">
                      Assessment Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#5F5147]">
                      {formatDate(report.assessment_date)}
                    </p>
                  </div>
                )}

                {report.assessment_status && (
                  <div>
                    <p className="text-xs tracking-wide text-[#8A7A6A] uppercase">
                      Assessment Status
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#5F5147]">
                      {formatStatus(report.assessment_status)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Assessment has not been completed yet.
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  The Occupational Safety and Health Office will assess this
                  incident.
                </p>
              </div>
            )}
          </section>

          {/* STATUS */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-2">
                <CheckCircleIcon className="size-5 text-green-600" />
              </div>

              <h2 className="font-semibold text-[#340306]">Report Status</h2>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${status.background} ${status.text}`}
            >
              <span className={`size-2 rounded-full ${status.dot}`} />

              {formatStatus(report.status)}
            </div>

            <p className="mt-3 text-xs leading-5 text-[#8A7A6A]">
              The status is updated by the Occupational Safety and Health
              Office.
            </p>
          </section>

          {/* HISTORY */}

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-[#340306]">
              Report History
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#8A7A6A]">Submitted</p>

                <p className="mt-1 text-sm font-medium text-[#5F5147]">
                  {formatDate(report.created_at)}
                </p>
              </div>

              {report.updated_at && (
                <div>
                  <p className="text-xs text-[#8A7A6A]">Last Updated</p>

                  <p className="mt-1 text-sm font-medium text-[#5F5147]">
                    {formatDate(report.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <IncidentAssessment
        admin={admin}
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        incidentId={reportId}
        onSuccess={() => {
          refresh((value) => value + 1);
          setShowAssessment(false);
        }}
      />
    </div>
  );
}
