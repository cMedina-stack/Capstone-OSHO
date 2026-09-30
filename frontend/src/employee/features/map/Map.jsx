import { apiFetch } from "../../../shared/api";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";

import { MapIcon } from "./MapIcons";

export default function EmployeeMap() {
  const [buildings, setBuildings] = useState([]);
  const [loadingMap, setLoadingMap] = useState(true);

  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingReports, setBuildingReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [filters, setFilters] = useState({
    reportType: "all",
    days: "30",
    status: "active",
    assessment: "all",
    riskLevel: "all",
    search: "",
  });

  // ============================================================
  // FETCH MAP DATA
  // ============================================================

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/buildings/map", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load map");
        }

        setBuildings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Map loading error:", error);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchMapData();
  }, []);

  // ============================================================
  // UPDATE FILTER
  // ============================================================

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setFilters({
      reportType: "all",
      days: "30",
      status: "active",
      assessment: "all",
      riskLevel: "all",
      search: "",
    });
  };

  // ============================================================
  // VISIBLE BUILDINGS
  // ============================================================

  const visibleBuildings = useMemo(() => {
    return buildings.filter((building) => {
      const search = filters.search.trim().toLowerCase();

      // --------------------------------------------------------
      // Search
      // --------------------------------------------------------

      if (
        search &&
        !building.building_name?.toLowerCase().includes(search) &&
        !building.building_id?.toLowerCase().includes(search)
      ) {
        return false;
      }

      const reportCount = Number(building.report_count || 0);
      const hazardCount = Number(building.hazard_count || 0);
      const incidentCount = Number(building.incident_count || 0);

      // --------------------------------------------------------
      // Report Type
      // --------------------------------------------------------

      if (filters.reportType === "hazard" && hazardCount === 0) {
        return false;
      }

      if (filters.reportType === "accident" && incidentCount === 0) {
        return false;
      }

      if (filters.reportType === "all" && reportCount === 0) {
        return false;
      }

      // --------------------------------------------------------
      // Assessment Filter
      //
      // Expected backend values:
      //
      // assessed_count
      // unassessed_count
      // --------------------------------------------------------

      const assessedCount = Number(building.assessed_count || 0);
      const unassessedCount = Number(building.unassessed_count || 0);

      if (filters.assessment === "assessed" && assessedCount === 0) {
        return false;
      }

      if (filters.assessment === "unassessed" && unassessedCount === 0) {
        return false;
      }

      // --------------------------------------------------------
      // Risk Level
      //
      // Only apply this filter if the building has an
      // assessed risk level.
      // --------------------------------------------------------

      if (filters.riskLevel !== "all") {
        const buildingRisk = building.risk_level?.toLowerCase();

        if (buildingRisk !== filters.riskLevel) {
          return false;
        }
      }

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      if (filters.status !== "all") {
        if (
          filters.status === "active" &&
          Number(building.active_count || 0) === 0
        ) {
          return false;
        }

        if (
          filters.status !== "active" &&
          Number(building[`${filters.status}_count`] || 0) === 0
        ) {
          return false;
        }
      }

      return true;
    });
  }, [buildings, filters]);

  // ============================================================
  // OPEN BUILDING
  // ============================================================

  const openBuilding = async (building) => {
    setSelectedBuilding(building);
    setBuildingReports([]);
    setLoadingReports(true);

    try {
      const token = localStorage.getItem("token");

      const response = await apiFetch(
        `/api/buildings/${building.building_id}/reports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load reports");
      }

      setBuildingReports(Array.isArray(data) ? data : data.reports || []);
    } catch (error) {
      console.error("Building reports error:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  // ============================================================
  // RISK COLOR
  // ============================================================

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-green-500";

      case "moderate":
        return "bg-yellow-400";

      case "high":
        return "bg-orange-500";

      case "critical":
        return "bg-red-500";

      case "catastrophic":
        return "bg-red-700";

      default:
        return "bg-neutral-400";
    }
  };

  // ============================================================
  // REPORT STATUS
  // ============================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "submitted":
        return "Submitted";

      case "under_review":
        return "Under Review";

      case "resolved":
        return "Resolved";

      case "rejected":
        return "Rejected";

      default:
        return status || "Unknown";
    }
  };

  // ============================================================
  // REPORT STATUS COLOR
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-700";

      case "under_review":
        return "bg-yellow-100 text-yellow-700";

      case "resolved":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  // ============================================================
  // ASSESSMENT STATUS
  // ============================================================

  const getAssessmentLabel = (report) => {
    if (report.assessment_id || report.assessment_status || report.risk_level) {
      return "Assessed";
    }

    return "Not Assessed";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loadingMap) {
    return (
      <div className="flex h-160 w-full items-center justify-center rounded-2xl bg-white shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#A6292F]" />

          <p className="text-sm font-medium text-neutral-500">
            Loading campus map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-160 w-full flex-col gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-lg">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-md font-bold text-[#A6292F] uppercase">
            Campus Overview Map
          </h1>

          <p className="text-xs text-neutral-500">
            View reported hazards and incidents across campus
          </p>
        </div>

        {/* Search */}
        <div className="w-full lg:max-w-xs">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            placeholder="Search building..."
            className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
          />
        </div>
      </header>

      {/* ======================================================
          FILTERS
      ======================================================= */}

      <div className="flex flex-wrap items-center gap-2">
        {/* Report Type */}

        <select
          value={filters.reportType}
          onChange={(e) => updateFilter("reportType", e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A6292F]"
        >
          <option value="all">All Reports</option>
          <option value="hazard">Hazards</option>
          <option value="accident">Incidents</option>
        </select>

        {/* Date */}

        <select
          value={filters.days}
          onChange={(e) => updateFilter("days", e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A6292F]"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
          <option value="all">All Time</option>
        </select>

        {/* Status */}

        <select
          value={filters.status}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A6292F]"
        >
          <option value="active">Active Reports</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="all">All Statuses</option>
        </select>

        {/* Assessment */}

        <select
          value={filters.assessment}
          onChange={(e) => updateFilter("assessment", e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A6292F]"
        >
          <option value="all">All Assessment Status</option>

          <option value="assessed">Assessed</option>

          <option value="unassessed">Not Assessed</option>
        </select>

        {/* Risk */}

        <select
          value={filters.riskLevel}
          onChange={(e) => updateFilter("riskLevel", e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#A6292F]"
        >
          <option value="all">All Risk Levels</option>
          <option value="low">Low Risk</option>
          <option value="moderate">Moderate Risk</option>
          <option value="high">High Risk</option>
          <option value="critical">Critical Risk</option>
          <option value="catastrophic">Catastrophic Risk</option>
        </select>

        {/* Reset */}

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Reset
        </button>
      </div>

      {/* ======================================================
          MAP
      ======================================================= */}

      <section className="relative min-h-0 w-full flex-1 rounded-lg">
        {/* ----------------------------------------------------
            LEGEND
        ----------------------------------------------------- */}

        <div className="absolute bottom-4 left-4 z-1000 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
          <h2 className="mb-3 text-sm font-bold text-neutral-900">
            Map Legend
          </h2>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="size-3 rounded-full bg-neutral-400" />
              Not Assessed
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="size-3 rounded-full bg-green-500" />
              Low Risk
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="size-3 rounded-full bg-yellow-400" />
              Moderate Risk
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="size-3 rounded-full bg-orange-500" />
              High Risk
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-700">
              <span className="size-3 rounded-full bg-red-500" />
              Critical Risk
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------
            MAP
        ----------------------------------------------------- */}

        <div className="relative z-10 h-full w-full overflow-hidden rounded-lg">
          <MapContainer
            className="h-full w-full"
            center={[14.997816, 120.655568]}
            zoom={19}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              referrerPolicy="strict-origin-when-cross-origin"
            />

            {visibleBuildings.map((building) => (
              <Marker
                key={building.building_id}
                position={[
                  Number(building.latitude),
                  Number(building.longitude),
                ]}
                icon={MapIcon(building.risk_level || "unassessed")}
                eventHandlers={{
                  click: () => openBuilding(building),
                }}
              >
                <Tooltip>
                  <div className="min-w-45">
                    <p className="font-semibold">{building.building_name}</p>

                    <div className="mt-2 space-y-1 text-xs">
                      <p>
                        Hazards: <strong>{building.hazard_count || 0}</strong>
                      </p>

                      <p>
                        Incidents:{" "}
                        <strong>{building.incident_count || 0}</strong>
                      </p>

                      <p>
                        Assessed:{" "}
                        <strong>{building.assessed_count || 0}</strong>
                      </p>

                      <p>
                        Not Assessed:{" "}
                        <strong>{building.unassessed_count || 0}</strong>
                      </p>

                      <p>
                        Risk:{" "}
                        <strong>
                          {building.risk_level
                            ? building.risk_level
                            : "Not Assessed"}
                        </strong>
                      </p>
                    </div>

                    <p className="mt-2 border-t pt-2 text-[11px] text-neutral-500">
                      Click to view reports
                    </p>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* ====================================================
            BUILDING REPORT PANEL
        ===================================================== */}

        {selectedBuilding && (
          <div className="absolute top-4 right-4 z-1000 flex max-h-[calc(100%-2rem)] w-90 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
            {/* Panel Header */}

            <div className="flex items-start justify-between border-b border-neutral-200 p-4">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-[#A6292F] uppercase">
                  Building
                </p>

                <h2 className="mt-1 text-sm font-bold text-neutral-900">
                  {selectedBuilding.building_name}
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  {selectedBuilding.building_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedBuilding(null);
                  setBuildingReports([]);
                }}
                className="rounded-lg p-1.5 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-800"
              >
                ✕
              </button>
            </div>

            {/* Summary */}

            <div className="grid grid-cols-2 gap-2 border-b border-neutral-200 bg-neutral-50 p-3">
              <div className="rounded-lg bg-white p-3">
                <p className="text-[11px] text-neutral-500">Hazards</p>

                <p className="mt-1 text-lg font-bold text-neutral-900">
                  {selectedBuilding.hazard_count || 0}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-[11px] text-neutral-500">Incidents</p>

                <p className="mt-1 text-lg font-bold text-neutral-900">
                  {selectedBuilding.incident_count || 0}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-[11px] text-neutral-500">Assessed</p>

                <p className="mt-1 text-lg font-bold text-green-600">
                  {selectedBuilding.assessed_count || 0}
                </p>
              </div>

              <div className="rounded-lg bg-white p-3">
                <p className="text-[11px] text-neutral-500">Pending</p>

                <p className="mt-1 text-lg font-bold text-orange-600">
                  {selectedBuilding.unassessed_count || 0}
                </p>
              </div>
            </div>

            {/* Reports */}

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {loadingReports ? (
                <div className="flex justify-center py-8">
                  <div className="size-6 animate-spin rounded-full border-3 border-neutral-200 border-t-[#A6292F]" />
                </div>
              ) : buildingReports.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-neutral-700">
                    No reports found
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    There are no reports matching the selected building.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {buildingReports.map((report) => {
                    const assessed = getAssessmentLabel(report) === "Assessed";

                    return (
                      <div
                        key={`${report.report_type}-${report.report_id}`}
                        className="rounded-xl border border-neutral-200 bg-white p-3"
                      >
                        {/* Type + Assessment */}

                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md bg-[#A6292F]/10 px-2 py-1 text-[10px] font-bold text-[#A6292F] uppercase">
                            {report.report_type === "hazard"
                              ? "Hazard"
                              : "Incident"}
                          </span>

                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                              assessed
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {assessed ? "Assessed" : "Not Assessed"}
                          </span>
                        </div>

                        {/* Title */}

                        <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                          {report.report_title ||
                            report.title ||
                            "Untitled Report"}
                        </h3>

                        {/* Location */}

                        <p className="mt-1 text-xs text-neutral-500">
                          {report.exact_area ||
                            report.exact_location ||
                            "Location not specified"}
                        </p>

                        {/* Status + Risk */}

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                              report.status,
                            )}`}
                          >
                            {getStatusLabel(report.status)}
                          </span>

                          {report.risk_level && (
                            <span className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-700">
                              <span
                                className={`size-2 rounded-full ${getRiskColor(
                                  report.risk_level,
                                )}`}
                              />

                              {report.risk_level}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
