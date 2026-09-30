import { apiFetch } from "../../../../shared/api";
import { useEffect, useMemo, useState } from "react";

const ReportsByBuilding = () => {
  const [buildings, setBuildings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReportsByBuilding = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await apiFetch(
          "/api/dashboard/reports-by-building",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const responseText = await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Backend returned invalid JSON (${response.status}).`,
          );
        }

        if (!response.ok) {
          throw new Error(
            result.error ||
              result.message ||
              "Failed to load reports by building.",
          );
        }

        const data =
          result.data || result.buildings || result.reportsByBuilding || [];

        setBuildings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Reports by building error:", error);
        setError(error.message || "Failed to load reports by building.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsByBuilding();
  }, []);

  const filteredBuildings = useMemo(() => {
    return buildings
      .map((building) => {
        const hazardReports = Number(
          building.hazard_reports ??
            building.hazards ??
            building.hazard_count ??
            0,
        );

        const incidentReports = Number(
          building.incident_reports ??
            building.incidents ??
            building.incident_count ??
            0,
        );

        const totalReports = hazardReports + incidentReports;

        return {
          ...building,
          buildingName:
            building.building_name ||
            building.buildingName ||
            building.name ||
            "Unknown Building",
          hazardReports,
          incidentReports,
          totalReports,
        };
      })
      .filter((building) => {
        if (filter === "hazard") {
          return building.hazardReports > 0;
        }

        if (filter === "incident") {
          return building.incidentReports > 0;
        }

        return building.totalReports > 0;
      })
      .sort((a, b) => {
        if (filter === "hazard") {
          return b.hazardReports - a.hazardReports;
        }

        if (filter === "incident") {
          return b.incidentReports - a.incidentReports;
        }

        return b.totalReports - a.totalReports;
      });
  }, [buildings, filter]);

  const maxValue = useMemo(() => {
    if (filteredBuildings.length === 0) {
      return 1;
    }

    return Math.max(
      ...filteredBuildings.map((building) => {
        if (filter === "hazard") {
          return building.hazardReports;
        }

        if (filter === "incident") {
          return building.incidentReports;
        }

        return building.totalReports;
      }),
    );
  }, [filteredBuildings, filter]);

  const getDisplayValue = (building) => {
    if (filter === "hazard") {
      return building.hazardReports;
    }

    if (filter === "incident") {
      return building.incidentReports;
    }

    return building.totalReports;
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-3 w-56 animate-pulse rounded bg-gray-100" />
          </div>

          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
        </div>

        <div className="space-y-5">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="mb-2 flex justify-between">
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-6 animate-pulse rounded bg-gray-200" />
              </div>

              <div className="h-2 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-5">
        <div className="mb-2 text-sm font-semibold text-gray-900">
          Reports by Building
        </div>

        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {/* HEADER */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Reports by Building
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Distribution of safety reports across buildings
          </p>
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
        >
          <option value="all">All Reports</option>
          <option value="hazard">Hazards</option>
          <option value="incident">Incidents</option>
        </select>
      </div>

      {/* EMPTY STATE */}
      {filteredBuildings.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-lg bg-gray-50">
          <div className="text-center">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-2M9 7h1m-1 4h1m4-4h1m-1 4h1M9 21v-4h6v4"
                />
              </svg>
            </div>

            <p className="text-sm font-medium text-gray-700">
              No reports found
            </p>

            <p className="mt-1 text-xs text-gray-500">
              There are no reports for this filter.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================
              SCROLLABLE BUILDING LIST ONLY
              ======================================================== */}
          <div className="max-h-[20rem] overflow-y-auto pr-2">
            <div className="space-y-5">
              {filteredBuildings.map((building) => {
                const value = getDisplayValue(building);

                const percentage = Math.max(
                  (value / maxValue) * 100,
                  value > 0 ? 4 : 0,
                );

                return (
                  <div key={building.building_id || building.buildingName}>
                    {/* BUILDING HEADER */}
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-medium text-gray-800"
                          title={building.buildingName}
                        >
                          {building.buildingName}
                        </p>

                        {filter === "all" && (
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            {building.hazardReports} hazard
                            {building.hazardReports !== 1 ? "s" : ""} ·{" "}
                            {building.incidentReports} incident
                            {building.incidentReports !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 text-sm font-semibold text-gray-900">
                        {value}
                      </span>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#A6292F] transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* LEGEND - FIXED */}
      {filter === "all" && filteredBuildings.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#A6292F]" />

            <span className="text-xs text-gray-500">Total Reports</span>
          </div>

          <span className="text-xs text-gray-400">
            {filteredBuildings.length} building
            {filteredBuildings.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
};

export default ReportsByBuilding;
