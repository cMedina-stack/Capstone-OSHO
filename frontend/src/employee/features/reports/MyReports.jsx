import useApiData from "../../../shared/useApiData";
import { useMemo, useState } from "react";

import { Link, NavLink } from "react-router-dom";

import {
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

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
  low: {
    label: "Low",
    background: "bg-green-50",
    text: "text-green-700",
  },

  moderate: {
    label: "Moderate",
    background: "bg-yellow-50",
    text: "text-yellow-700",
  },

  high: {
    label: "High",
    background: "bg-orange-50",
    text: "text-orange-700",
  },

  critical: {
    label: "Critical",
    background: "bg-red-50",
    text: "text-red-700",
  },

  catastrophic: {
    label: "Catastrophic",
    background: "bg-red-100",
    text: "text-red-800",
  },
};

const assessmentStatusStyles = {
  under_review: {
    label: "Under Review",
    background: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  action_required: {
    label: "Action Required",
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
  pending: {
    label: "Assessment Pending",
    background: "bg-gray-100",
    text: "text-gray-700",
    dot: "bg-gray-500",
  },

  in_progress: {
    label: "Assessment In Progress",
    background: "bg-yellow-50",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },

  completed: {
    label: "Assessment Completed",
    background: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-500",
  },

  overdue: {
    label: "Assessment Overdue",
    background: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },

  cancelled: {
    label: "Assessment Cancelled",
    background: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
};

const formatDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function MyReports() {
  const [reportFilter, setReportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const {
    data: reports,
    loading,
    error,
    reload: getReports,
  } = useApiData("/api/reports/my-reports");

  const filteredReports = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reports.filter((report) => {
      // Report type
      if (reportFilter !== "all" && report.report_type !== reportFilter) {
        return false;
      }

      // Status
      if (statusFilter !== "all" && report.status !== statusFilter) {
        return false;
      }

      // Search
      if (normalizedSearch) {
        const searchableText = [
          report.report_title,
          report.building_name,
          report.building_id,
          report.exact_area,
          report.description,
          report.report_type,
          report.incident_type,
          report.incident_nature,
          report.assessment_status,
          report.risk_level,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });
  }, [reports, reportFilter, statusFilter, search]);

  const totalReports = reports.length;

  const hazardCount = reports.filter(
    (report) => report.report_type === "hazard",
  ).length;

  const incidentCount = reports.filter(
    (report) => report.report_type === "incident",
  ).length;

  const assessedIncidentCount = reports.filter(
    (report) => report.report_type === "incident" && report.assessment_id,
  ).length;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#F8F6F2] p-5 md:p-7">
      {/* Header */}
      <div className="mb-7 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#340306]">My Reports</h1>

          <p className="mt-1 text-sm text-[#8A7A6A]">
            View and track the safety reports you have submitted.
          </p>
        </div>

        <div className="flex gap-2">
          <NavLink
            to="/employee/record-hazard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#A6292F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8F2026]"
          >
            <PlusIcon className="size-5" />
            Report Hazard
          </NavLink>

          <NavLink
            to="/employee/record-incident"
            className="inline-flex items-center gap-2 rounded-xl border border-[#D8CFC5] bg-white px-4 py-2.5 text-sm font-semibold text-[#6B5A4D] transition hover:bg-[#F5F1EC]"
          >
            <PlusIcon className="size-5" />
            Report Incident
          </NavLink>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Reports */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8A7A6A]">Total Reports</p>

              <p className="mt-1 text-2xl font-bold text-[#340306]">
                {totalReports}
              </p>
            </div>

            <div className="rounded-xl bg-[#FBEAEC] p-3">
              <ClipboardDocumentListIcon className="size-6 text-[#A6292F]" />
            </div>
          </div>
        </div>

        {/* Hazard Reports */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8A7A6A]">Hazard Reports</p>

              <p className="mt-1 text-2xl font-bold text-[#340306]">
                {hazardCount}
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 p-3">
              <ExclamationTriangleIcon className="size-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Incident Reports */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#8A7A6A]">Incident Reports</p>

              <p className="mt-1 text-2xl font-bold text-[#340306]">
                {incidentCount}
              </p>

              {incidentCount > 0 && (
                <p className="mt-1 text-xs text-[#8A7A6A]">
                  {assessedIncidentCount} assessed
                </p>
              )}
            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <ClipboardDocumentListIcon className="size-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 shrink-0 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Report Type */}
          <div className="flex flex-wrap gap-2">
            {[
              ["all", "All Reports"],
              ["hazard", "Hazards"],
              ["incident", "Incidents"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setReportFilter(value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  reportFilter === value
                    ? "bg-[#A6292F] text-white"
                    : "bg-[#F5F1EC] text-[#6B5A4D] hover:bg-[#ECE5DD]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search + Status */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports..."
                className="w-full rounded-lg border border-[#DDD5CC] bg-white py-2.5 pr-4 pl-10 text-sm transition outline-none focus:border-[#A6292F] sm:w-64"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <AdjustmentsHorizontalIcon className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-400" />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="appearance-none rounded-lg border border-[#DDD5CC] bg-white py-2.5 pr-9 pl-10 text-sm outline-none focus:border-[#A6292F]"
              >
                <option value="all">All Status</option>

                <option value="draft">Draft</option>

                <option value="submitted">Submitted</option>

                <option value="under_review">Under Review</option>

                <option value="resolved">Resolved</option>

                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="h-4 w-24 rounded bg-gray-200" />

                <div className="mt-3 h-5 w-2/3 rounded bg-gray-200" />

                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />

                <div className="mt-4 h-3 w-32 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Unable to load your reports
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={getReports}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredReports.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#FBEAEC]">
              <ClipboardDocumentListIcon className="size-7 text-[#A6292F]" />
            </div>

            <h3 className="mt-4 font-semibold text-[#340306]">
              No Reports Found
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-[#8A7A6A]">
              {reports.length === 0
                ? "You have not submitted any hazard or incident reports yet."
                : "No reports match your current search and filters."}
            </p>

            {reports.length === 0 && (
              <div className="mt-5 flex justify-center gap-2">
                <NavLink
                  to="/employee/record-hazard"
                  className="rounded-lg bg-[#A6292F] px-4 py-2 text-sm font-semibold text-white"
                >
                  Report a Hazard
                </NavLink>

                <NavLink
                  to="/employee/record-incident"
                  className="rounded-lg border border-[#D8CFC5] px-4 py-2 text-sm font-semibold text-[#6B5A4D]"
                >
                  Report an Incident
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Report List */}
        {!loading && !error && filteredReports.length > 0 && (
          <div className="space-y-3">
            {filteredReports.map((report) => {
              const isHazard = report.report_type === "hazard";

              const status =
                statusStyles[report.status] || statusStyles.submitted;

              const risk = report.risk_level
                ? riskStyles[String(report.risk_level).toLowerCase()]
                : null;

              const assessmentStatus = report.assessment_id
                ? assessmentStatusStyles[report.assessment_status] ||
                  assessmentStatusStyles.pending
                : null;

              const hasAssessment = Boolean(report.assessment_id);

              return (
                <article
                  key={`${report.report_type}-${report.report_id}`}
                  className="group rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Report Information */}
                    <div className="min-w-0 flex-1">
                      {/* Type + Status + Risk */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Report Type */}
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            isHazard
                              ? "bg-orange-50 text-orange-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isHazard ? "Hazard" : "Incident"}
                        </span>

                        {/* Report Status */}
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.background} ${status.text}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${status.dot}`}
                          />

                          {status.label}
                        </span>

                        {/* Hazard Risk */}
                        {risk && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${risk.background} ${risk.text}`}
                          >
                            Risk: {risk.label}
                          </span>
                        )}

                        {/* Incident Assessment */}
                        {assessmentStatus && (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${assessmentStatus.background} ${assessmentStatus.text}`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${assessmentStatus.dot}`}
                            />

                            {assessmentStatus.label}
                          </span>
                        )}

                        {/* Incident without Assessment */}
                        {!isHazard && !hasAssessment && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                            <span className="size-1.5 rounded-full bg-gray-400" />
                            Assessment Pending
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="mt-3 text-base font-semibold text-[#340306]">
                        {isHazard
                          ? report.report_title || "Hazard Report"
                          : report.report_title || "Incident Report"}
                      </h3>

                      {/* Location */}
                      <div className="mt-1 flex flex-wrap gap-x-2 text-sm text-[#6B5A4D]">
                        <span>
                          {report.building_name || report.building_id}
                        </span>

                        {report.exact_area && (
                          <>
                            <span>•</span>

                            <span>{report.exact_area}</span>
                          </>
                        )}
                      </div>

                      {/* Date */}
                      <p className="mt-2 text-xs text-[#8A7A6A]">
                        Reported on {formatDate(report.report_date)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <Link
                        to={`/employee/reports/${report.report_type}/${report.report_id}`}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#D8CFC5] px-4 py-2 text-sm font-semibold text-[#6B5A4D] transition hover:bg-[#F5F1EC]"
                      >
                        View Details
                        <ChevronRightIcon className="size-4" />
                      </Link>

                      {/* Incident Assessment */}
                      {hasAssessment && (
                        <Link
                          to={`/employee/reports/${report.report_type}/${report.report_id}?assessment=1`}
                          className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#A6292F] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#8F2026]"
                        >
                          View Assessment
                          <ChevronRightIcon className="size-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Count */}
      {!loading && !error && filteredReports.length > 0 && (
        <p className="mt-4 shrink-0 text-center text-xs text-[#8A7A6A]">
          Showing {filteredReports.length} of {reports.length} reports
        </p>
      )}
    </div>
  );
}
