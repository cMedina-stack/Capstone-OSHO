import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminAssessmentPage = () => {
  const navigate = useNavigate();

  const [assessmentType, setAssessmentType] = useState("hazard");
  const [assessments, setAssessments] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH ASSESSMENTS
  // ============================================================

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const endpoint =
        assessmentType === "hazard"
          ? "/api/admin/assessments/hazards"
          : "/api/admin/assessments/incidents";

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to fetch assessments.",
        );
      }

      setAssessments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Assessment fetch error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [assessmentType]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        assessment.report_title?.toLowerCase().includes(searchValue) ||
        assessment.building_name?.toLowerCase().includes(searchValue) ||
        assessment.responsible_unit?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || assessment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [assessments, search, statusFilter]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const pendingCount = assessments.filter(
    (assessment) => assessment.status === "pending",
  ).length;

  const completedCount = assessments.filter(
    (assessment) => assessment.status === "completed",
  ).length;

  const highRiskCount = assessments.filter((assessment) => {
    const score =
      Number(assessment.likelihood || 0) * Number(assessment.severity || 0);

    return score >= 15;
  }).length;

  // ============================================================
  // EXPORT
  // ============================================================

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("token");

      const endpoint =
        assessmentType === "hazard"
          ? "/api/admin/exports/hazard-assessments"
          : "/api/admin/exports/incident-assessments";

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate Excel file.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download =
        assessmentType === "hazard"
          ? "OSHO-Hazard-Assessments.xlsx"
          : "OSHO-Incident-Assessments.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2] p-6">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#651317]">Assessments</h1>

          <p className="mt-1 text-sm text-[#8A7A6A]">
            Review and manage hazard and incident assessments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#217346] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#185C37]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 10.5 12 15m0 0 4.5-4.5M12 15V3"
            />
          </svg>
          Export Excel
        </button>
      </div>

      {/* ====================================================== */}
      {/* TYPE TABS */}
      {/* ====================================================== */}

      <div className="mb-6 inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setAssessmentType("hazard")}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            assessmentType === "hazard"
              ? "bg-[#A6292F] text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Hazard Assessments
        </button>

        <button
          type="button"
          onClick={() => setAssessmentType("incident")}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
            assessmentType === "incident"
              ? "bg-[#A6292F] text-white"
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          Incident Assessments
        </button>
      </div>

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Pending</p>

          <p className="mt-2 text-3xl font-bold text-[#A6292F]">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">Completed</p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">High Risk</p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {highRiskCount}
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE CARD */}
      {/* ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-gray-200 p-5 md:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search report, building, responsible unit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-[#A6292F]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-[#FAF9F6]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold text-[#8A7A6A] uppercase">
                  Report
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold text-[#8A7A6A] uppercase">
                  Location
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold text-[#8A7A6A] uppercase">
                  Risk
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold text-[#8A7A6A] uppercase">
                  Responsible Unit
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold text-[#8A7A6A] uppercase">
                  Target Date
                </th>

                <th className="px-5 py-3 text-left text-xs font-bold text-[#8A7A6A] uppercase">
                  Status
                </th>

                <th className="px-5 py-3 text-right text-xs font-bold text-[#8A7A6A] uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Loading assessments...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : filteredAssessments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    No assessments found.
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((assessment) => {
                  const riskScore =
                    Number(assessment.likelihood || 0) *
                    Number(assessment.severity || 0);

                  return (
                    <tr
                      key={assessment.assessment_id}
                      className="border-t border-gray-100 transition hover:bg-[#FAF9F6]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#340306]">
                          {assessment.report_title ||
                            `${
                              assessmentType === "hazard"
                                ? "Hazard"
                                : "Incident"
                            } #${assessment.report_id}`}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Assessment #{assessment.assessment_id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {assessment.building_name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            riskScore >= 15
                              ? "bg-red-100 text-red-700"
                              : riskScore >= 8
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {riskScore}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {assessment.responsible_unit || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {assessment.target_date
                          ? new Date(assessment.target_date).toLocaleDateString(
                              "en-PH",
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 capitalize">
                          {assessment.status?.replaceAll("_", " ") || "Pending"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (assessmentType === "hazard") {
                              navigate(
                                `/admin/assessments/hazard/${assessment.assessment_id}`,
                              );
                            } else {
                              navigate(
                                `/admin/assessments/incident/${assessment.assessment_id}`,
                              );
                            }
                          }}
                          className="rounded-lg border border-[#A6292F] px-4 py-2 text-xs font-semibold text-[#A6292F] transition hover:bg-[#A6292F] hover:text-white"
                        >
                          View Assessment
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAssessmentPage;
