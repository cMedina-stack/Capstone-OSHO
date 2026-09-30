import { apiFetch } from "../../../shared/api";
import IncidentAssessment from "../../../employee/features/reports/IncidentAssessment";
import useApiData from "../../../shared/useApiData";
import { useMemo, useState } from "react";

import HazardAssessmentModal from "./HazardAssessmentModal";

const AdminAssessments = () => {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [incidentId, setIncidentId] = useState(null);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState(false);

  // ============================================================
  // FETCH ASSESSMENTS
  // ============================================================

  const {
    data: assessments,
    loading,
    error,
    reload: fetchAssessments,
  } = useApiData("/api/admin-assessments", { key: "data" });

  // ============================================================
  // NORMALIZE DATA
  // ============================================================

  const normalizedAssessments = useMemo(() => {
    return assessments.map((item) => {
      const reportType = item.report_type || item.reportType || "";

      const assessmentId = item.assessment_id || item.assessmentId || null;

      /*
       * Assessment status now follows the employee/report status.
       *
       * Priority:
       * 1. report_status
       * 2. status
       * 3. assessment_status
       * 4. submitted
       */
      const assessmentStatus =
        item.assessment_status || item.assessmentStatus || "submitted";

      const hasAssessment = Boolean(assessmentId);

      return {
        ...item,

        // --------------------------------------------------------
        // REPORT
        // --------------------------------------------------------

        reportId: item.report_id,

        reportType,

        title:
          item.title ||
          (reportType === "incident"
            ? `Incident Report #${item.report_id}`
            : `Hazard Report #${item.report_id}`),

        buildingName: item.building_name || "Unknown Building",

        exactArea: item.exact_area || "Not specified",

        reportDate: item.report_date,

        /*
         * Employee/report status.
         */
        reportStatus: item.report_status || item.status || "submitted",

        // --------------------------------------------------------
        // ASSESSMENT
        // --------------------------------------------------------

        assessmentId,

        hasAssessment,

        assessmentDate: item.assessment_date || item.assessmentDate || null,

        /*
         * Assessment status is intentionally the same
         * as the employee/report status.
         */
        assessmentStatus,

        // --------------------------------------------------------
        // EMPLOYEE / ASSESSOR
        // --------------------------------------------------------

        assessedByName:
          item.assessed_by_name ||
          item.assessor_name ||
          item.employee_name ||
          item.reported_by_name ||
          "Employee",

        assessedByEmail: item.assessed_by_email || item.employee_email || null,

        // --------------------------------------------------------
        // HAZARD RISK ASSESSMENT
        // --------------------------------------------------------

        likelihood:
          item.likelihood !== null && item.likelihood !== undefined
            ? Number(item.likelihood)
            : null,

        severity:
          item.severity !== null && item.severity !== undefined
            ? Number(item.severity)
            : null,

        riskScore:
          item.risk_score !== null && item.risk_score !== undefined
            ? Number(item.risk_score)
            : null,

        riskLevel: item.risk_level || null,

        // --------------------------------------------------------
        // ASSESSMENT DETAILS
        // --------------------------------------------------------

        controlAction: item.control_action || item.controlAction || "",

        responsibleUnit: item.responsible_unit || item.responsibleUnit || "",

        expectedOutput: item.expected_output || item.expectedOutput || "",

        targetDate: item.target_date || item.targetDate || null,

        remarks: item.remarks || "",

        // --------------------------------------------------------
        // ADMIN REVIEW
        // --------------------------------------------------------

        reviewedByName: item.reviewed_by_name || null,

        reviewedAt: item.reviewed_at || null,

        reviewStatus: item.review_status || "pending",
      };
    });
  }, [assessments]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAssessments = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return normalizedAssessments.filter((item) => {
      // --------------------------------------------------------
      // REPORT TYPE
      // --------------------------------------------------------

      if (filter !== "all" && item.reportType !== filter) {
        return false;
      }

      // --------------------------------------------------------
      // ASSESSMENT STATUS
      // --------------------------------------------------------

      if (statusFilter !== "all") {
        /*
         * Assessment status now uses the same four statuses
         * as the employee/report status.
         */

        if (item.assessmentStatus !== statusFilter) {
          return false;
        }
      }

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      if (searchTerm) {
        const searchableText = [
          item.title,
          item.buildingName,
          item.exactArea,
          item.reportType,
          item.assessedByName,
          item.assessedByEmail,
          item.assessmentStatus,
          item.reportStatus,
          item.reviewStatus,
          item.riskLevel,
          item.riskScore,
          item.likelihood,
          item.severity,
          item.controlAction,
          item.responsibleUnit,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [normalizedAssessments, filter, statusFilter, search]);

  // ============================================================
  // COUNTS
  // ============================================================

  const totalCount = normalizedAssessments.length;

  const hazardCount = normalizedAssessments.filter(
    (item) => item.reportType === "hazard",
  ).length;

  const employeeAssessmentCount = normalizedAssessments.filter(
    (item) => item.hasAssessment,
  ).length;

  /*
   * Pending now means submitted or under review.
   */

  const pendingCount = normalizedAssessments.filter(
    (item) =>
      !item.hasAssessment ||
      item.assessmentStatus === "submitted" ||
      item.assessmentStatus === "under_review",
  ).length;

  // ============================================================
  // STATUS LABEL
  // ============================================================

  const getStatusLabel = (item) => {
    if (!item.hasAssessment) {
      return "Awaiting Assessment";
    }

    switch (item.assessmentStatus) {
      case "submitted":
        return "Submitted";

      case "under_review":
        return "Under Review";

      case "action_required":
        return "Action Required";
      case "resolved":
        return "Resolved";

      case "rejected":
        return "Rejected";

      default:
        return "Submitted";
    }
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (item) => {
    if (!item.hasAssessment) {
      return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
    }

    switch (item.assessmentStatus) {
      case "submitted":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";

      case "under_review":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";

      case "action_required":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";
      case "resolved":
        return "bg-green-50 text-green-700 ring-1 ring-green-200";

      case "rejected":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      default:
        return "bg-gray-100 text-gray-600 ring-1 ring-gray-200";
    }
  };

  // ============================================================
  // TYPE BADGE
  // ============================================================

  const getTypeClass = (type) => {
    if (type === "hazard") {
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    }

    return "bg-red-50 text-red-700 ring-1 ring-red-200";
  };

  // ============================================================
  // RISK CLASS
  // ============================================================

  const getRiskClass = (riskLevel) => {
    switch (riskLevel) {
      case "Low":
        return "bg-green-50 text-green-700 ring-1 ring-green-200";

      case "Moderate":
        return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200";

      case "High":
        return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";

      case "Critical":
        return "bg-red-50 text-red-700 ring-1 ring-red-200";

      default:
        return "bg-gray-50 text-gray-400 ring-1 ring-gray-200";
    }
  };

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setFilter("all");
    setStatusFilter("all");
  };

  // ============================================================
  // REVIEW / EDIT
  // ============================================================

  const handleAssessment = (item) => {
    if (item.reportType === "hazard") {
      setSelectedAssessment(item);
      setIsHazardModalOpen(true);
      return;
    }

    setIncidentId(item.reportId);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeHazardModal = () => {
    setIsHazardModalOpen(false);
    setSelectedAssessment(null);
  };

  const downloadExcel = async () => {
    setExporting(true);
    setExportError("");
    try {
      const params = new URLSearchParams({
        type: filter,
        status: statusFilter,
        search: search.trim(),
      });
      const response = await apiFetch(
        `/api/admin-assessments/export?${params}`,
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Unable to generate the workbook.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        /filename="([^"]+)"/.exec(
          response.headers.get("Content-Disposition") || "",
        )?.[1] || "OSHO-assessments.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError(error.message || "Unable to download the workbook.");
    } finally {
      setExporting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />

          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>

        <div className="h-[500px] animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-900">
            Failed to Load Assessments
          </h2>

          <p className="mt-2 text-sm text-red-600">{error}</p>

          <button
            type="button"
            onClick={fetchAssessments}
            className="mt-4 rounded-lg bg-[#A6292F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8F2228]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="min-h-screen w-full bg-[#F8F6F2] p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#651317]">Assessments</h1>

        <p className="mt-1 text-sm text-gray-500">
          Review employee safety assessments and finalize assessment records.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={downloadExcel}
          disabled={
            exporting || !filteredAssessments.some((item) => item.hasAssessment)
          }
          className="rounded-lg bg-[#A6292F] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F2228] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? "Generating Excel..." : "Download Excel"}
        </button>
        <p className="text-sm text-[#8A7A6A]">
          Exports saved assessments matching the current filters. Hazards and
          incidents use separate sheets.
        </p>
      </div>
      {exportError && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-700">
          {exportError}
        </p>
      )}

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Total Reports
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">{totalCount}</p>

          <p className="mt-1 text-xs text-gray-400">
            Reports with assessment records
          </p>
        </div>

        {/* EMPLOYEE ASSESSMENTS */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Employee Assessments
          </p>

          <p className="mt-2 text-2xl font-bold text-blue-600">
            {employeeAssessmentCount}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Assessments submitted by employees
          </p>
        </div>

        {/* HAZARDS */}

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Hazard Reports
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {hazardCount}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Hazard assessment records
          </p>
        </div>

        {/* PENDING */}

        <div className="rounded-xl border border-red-200 bg-white p-5">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Pending Review
          </p>

          <p className="mt-2 text-2xl font-bold text-[#A6292F]">
            {pendingCount}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Submitted or under OSHO review
          </p>
        </div>
      </div>

      {/* ======================================================
          FILTER TOOLBAR
      ====================================================== */}

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          {/* SEARCH */}

          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Search
            </label>

            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search report, employee, building..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pr-3 pl-9 text-sm text-gray-700 transition outline-none placeholder:text-gray-400 focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
              />
            </div>
          </div>

          {/* REPORT TYPE */}

          <div className="w-full lg:w-48">
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Report Type
            </label>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
            >
              <option value="all">All Reports</option>

              <option value="hazard">Hazards</option>

              <option value="incident">Incidents</option>
            </select>
          </div>

          {/* STATUS */}

          <div className="w-full lg:w-56">
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Assessment Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
            >
              <option value="all">All Statuses</option>

              <option value="submitted">Submitted</option>

              <option value="under_review">Under Review</option>

              <option value="action_required">Action Required</option>
              <option value="resolved">Resolved</option>

              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* CLEAR */}

          {(search || filter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium whitespace-nowrap text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* RESULT COUNT */}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredAssessments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {normalizedAssessments.length}
            </span>{" "}
            records
          </p>

          {(search || filter !== "all" || statusFilter !== "all") && (
            <span className="text-xs font-medium text-[#A6292F]">
              Filters active
            </span>
          )}
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="max-h-[620px] overflow-auto">
          <table className="w-full min-w-[1250px] table-fixed">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="border-b border-gray-100">
                <th className="w-[15%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Report
                </th>

                <th className="w-[9%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Type
                </th>

                <th className="w-[15%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Employee
                </th>

                <th className="w-[15%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Building
                </th>

                <th className="w-[10%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Assessment
                </th>

                <th className="w-[12%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Risk
                </th>

                <th className="w-[13%] px-5 py-3 text-left text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Status
                </th>

                <th className="w-[11%] px-5 py-3 text-right text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400">
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0118 8.414V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>

                      <p className="text-sm font-medium text-gray-700">
                        No assessments found
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Try changing your filters or search term.
                      </p>

                      {(search ||
                        filter !== "all" ||
                        statusFilter !== "all") && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 text-xs font-semibold text-[#A6292F] hover:underline"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((item) => (
                  <tr
                    key={`${item.reportType}-${item.reportId}`}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    {/* REPORT */}

                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold text-gray-800"
                          title={item.title}
                        >
                          {item.title}
                        </p>

                        <p
                          className="mt-1 truncate text-xs text-gray-400"
                          title={item.exactArea}
                        >
                          {item.exactArea}
                        </p>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${getTypeClass(
                          item.reportType,
                        )}`}
                      >
                        {item.reportType}
                      </span>
                    </td>

                    {/* EMPLOYEE */}

                    <td className="px-5 py-4">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium text-gray-700"
                          title={item.assessedByName}
                        >
                          {item.assessedByName}
                        </p>

                        {item.assessedByEmail && (
                          <p
                            className="mt-1 truncate text-xs text-gray-400"
                            title={item.assessedByEmail}
                          >
                            {item.assessedByEmail}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* BUILDING */}

                    <td className="px-5 py-4">
                      <span
                        className="block truncate text-sm text-gray-700"
                        title={item.buildingName}
                      >
                        {item.buildingName}
                      </span>
                    </td>

                    {/* ASSESSMENT DATE */}

                    <td className="px-5 py-4">
                      {item.hasAssessment ? (
                        <div>
                          <p className="text-sm text-gray-700">
                            {formatDate(item.assessmentDate)}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Submitted
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Not submitted
                        </span>
                      )}
                    </td>

                    {/* RISK */}

                    <td className="px-5 py-4">
                      {item.riskLevel ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${getRiskClass(
                              item.riskLevel,
                            )}`}
                          >
                            {item.riskLevel}
                          </span>

                          {item.riskScore !== null && (
                            <span className="text-xs font-medium text-gray-400">
                              {item.riskScore}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Not assessed
                        </span>
                      )}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${getStatusClass(
                          item,
                        )}`}
                      >
                        {getStatusLabel(item)}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4 text-right">
                      {item.hasAssessment ? (
                        <button
                          type="button"
                          onClick={() => handleAssessment(item)}
                          className="rounded-lg border border-[#A6292F] bg-white px-3 py-2 text-xs font-semibold whitespace-nowrap text-[#A6292F] transition hover:bg-[#A6292F] hover:text-white"
                        >
                          Review / Edit
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          Awaiting Employee
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================
          HAZARD ASSESSMENT MODAL
      ====================================================== */}

      {incidentId && (
        <IncidentAssessment
          admin
          isOpen
          incidentId={incidentId}
          onClose={() => setIncidentId(null)}
          onSuccess={() => {
            setIncidentId(null);
            fetchAssessments();
          }}
        />
      )}
      {isHazardModalOpen && (
        <HazardAssessmentModal
          isOpen={isHazardModalOpen}
          report={selectedAssessment}
          onClose={closeHazardModal}
          onSaved={async () => {
            await fetchAssessments();

            setIsHazardModalOpen(false);
            setSelectedAssessment(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAssessments;
