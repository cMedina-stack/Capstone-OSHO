import { apiFetch } from "../../../shared/api";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import MapIcon from "../../../../../frontend/src/admin/features/map/MapIcons";

// ============================================================
// MAP FOCUS

// ============================================================
// ADMIN CAMPUS MAP
// ============================================================

const AdminMapPage = () => {
  const navigate = useNavigate();

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [buildingReports, setBuildingReports] = useState([]);

  const [loadingMap, setLoadingMap] = useState(true);
  const [loadingReports, setLoadingReports] = useState(false);

  const [mapError, setMapError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    reportType: "all",
    status: "all",
    assessment: "all",
    riskLevel: "all",
  });

  // ==========================================================
  // FETCH MAP DATA
  // ==========================================================

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoadingMap(true);
        setMapError("");

        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/buildings/map", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Failed to load campus map.",
          );
        }

        setBuildings(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Admin map loading error:", error);

        setMapError(error.message);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchMapData();
  }, []);

  // ==========================================================
  // FILTER
  // ==========================================================

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      reportType: "all",
      status: "all",
      assessment: "all",
      riskLevel: "all",
    });
  };

  // ==========================================================
  // FILTERED BUILDINGS
  // ==========================================================

  const visibleBuildings = useMemo(() => {
    return buildings.filter((building) => {
      const search = filters.search.trim().toLowerCase();

      const reportCount = Number(building.report_count || 0);

      const hazardCount = Number(building.hazard_count || 0);

      const incidentCount = Number(building.incident_count || 0);

      const assessedCount = Number(building.assessed_count || 0);

      const unassessedCount = Number(building.unassessed_count || 0);

      // Search
      if (
        search &&
        !building.building_name?.toLowerCase().includes(search) &&
        !building.building_id?.toLowerCase().includes(search)
      ) {
        return false;
      }

      // Report Type
      if (filters.reportType === "hazard" && hazardCount === 0) {
        return false;
      }

      if (filters.reportType === "incident" && incidentCount === 0) {
        return false;
      }

      if (filters.reportType === "all" && reportCount === 0) {
        return false;
      }

      // Assessment
      if (filters.assessment === "assessed" && assessedCount === 0) {
        return false;
      }

      if (filters.assessment === "unassessed" && unassessedCount === 0) {
        return false;
      }

      // Risk
      if (filters.riskLevel !== "all") {
        const buildingRisk = building.risk_level?.toLowerCase();

        if (buildingRisk !== filters.riskLevel) {
          return false;
        }
      }

      // Status
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

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    return buildings.reduce(
      (result, building) => {
        result.reports += Number(building.report_count || 0);

        result.hazards += Number(building.hazard_count || 0);

        result.incidents += Number(building.incident_count || 0);

        result.pending += Number(building.unassessed_count || 0);

        return result;
      },
      {
        reports: 0,
        hazards: 0,
        incidents: 0,
        pending: 0,
      },
    );
  }, [buildings]);

  // ==========================================================
  // OPEN BUILDING
  // ==========================================================

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
        throw new Error(
          data.error || data.message || "Failed to load building reports.",
        );
      }

      setBuildingReports(Array.isArray(data) ? data : data.reports || []);
    } catch (error) {
      console.error("Building reports error:", error);
    } finally {
      setLoadingReports(false);
    }
  };

  // ==========================================================
  // REPORT NAVIGATION
  // ==========================================================

  const openReport = (report) => {
    if (report.report_type === "hazard") {
      navigate(`/admin/hazard-reports/${report.report_id}`);

      return;
    }

    navigate(`/admin/incident-reports/${report.report_id}`);
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

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
        return "bg-red-800";

      default:
        return "bg-neutral-400";
    }
  };

  const getRiskText = (risk) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "text-green-700";

      case "moderate":
        return "text-yellow-700";

      case "high":
        return "text-orange-700";

      case "critical":
      case "catastrophic":
        return "text-red-700";

      default:
        return "text-neutral-500";
    }
  };

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

  const getStatusLabel = (status) => {
    return (
      status
        ?.replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unknown"
    );
  };

  const isAssessed = (report) => {
    return Boolean(
      report.assessment_id || report.assessment_status || report.risk_level,
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingMap) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-[#F8F6F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="size-9 animate-spin rounded-full border-4 border-neutral-200 border-t-[#A6292F]" />

          <p className="text-sm font-medium text-neutral-500">
            Loading campus safety map...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="h-full w-full bg-[#F8F6F2] p-5">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="rounded-xl border border-[#E8E1DA] bg-white px-4 py-2.5 text-sm shadow-sm">
          <span className="text-neutral-500">Showing</span>

          <span className="ml-2 font-bold text-[#651317]">
            {visibleBuildings.length}
          </span>

          <span className="ml-1 text-neutral-500">buildings</span>
        </div>
      </div>

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Reports"
          value={summary.reports}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25M8.25 2.25H5.625A1.125 1.125 0 0 0 4.5 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          }
        />

        <SummaryCard
          label="Hazard Reports"
          value={summary.hazards}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM10.34 3.94 1.82 18.25A1.5 1.5 0 0 0 3.11 20.5h17.78a1.5 1.5 0 0 0 1.29-2.25L13.66 3.94a1.5 1.5 0 0 0-3.32 0Z"
              />
            </svg>
          }
        />

        <SummaryCard
          label="Incident Reports"
          value={summary.incidents}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 4.5h.008v.008H12V16.5Zm8.25-4.5A8.25 8.25 0 1 1 3.75 12a8.25 8.25 0 0 1 16.5 0Z"
              />
            </svg>
          }
        />

        <SummaryCard
          label="Pending Assessments"
          value={summary.pending}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          }
        />
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="mb-4 rounded-2xl border border-[#E8E1DA] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-neutral-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m2.1-5.4a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
              />
            </svg>

            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search building..."
              className="h-11 w-full rounded-xl border border-neutral-300 pr-4 pl-10 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
            />
          </div>

          <FilterSelect
            value={filters.reportType}
            onChange={(value) => updateFilter("reportType", value)}
          >
            <option value="all">All Reports</option>
            <option value="hazard">Hazards</option>
            <option value="incident">Incidents</option>
          </FilterSelect>

          <FilterSelect
            value={filters.status}
            onChange={(value) => updateFilter("status", value)}
          >
            <option value="all">All Statuses</option>

            <option value="active">Active</option>

            <option value="submitted">Submitted</option>

            <option value="under_review">Under Review</option>

            <option value="resolved">Resolved</option>
          </FilterSelect>

          <FilterSelect
            value={filters.assessment}
            onChange={(value) => updateFilter("assessment", value)}
          >
            <option value="all">All Assessments</option>

            <option value="assessed">Assessed</option>

            <option value="unassessed">Not Assessed</option>
          </FilterSelect>

          <FilterSelect
            value={filters.riskLevel}
            onChange={(value) => updateFilter("riskLevel", value)}
          >
            <option value="all">All Risk Levels</option>

            <option value="low">Low</option>

            <option value="moderate">Moderate</option>

            <option value="high">High</option>

            <option value="critical">Critical</option>

            <option value="catastrophic">Catastrophic</option>
          </FilterSelect>

          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-xl border border-neutral-300 px-4 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ====================================================== */}
      {/* MAIN MAP WORKSPACE */}
      {/* ====================================================== */}

      <div className="grid min-h-[680px] grid-cols-1 overflow-hidden rounded-2xl border border-[#E8E1DA] bg-white shadow-sm xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        {/* ==================================================== */}
        {/* BUILDING LIST */}
        {/* ==================================================== */}

        <aside className="flex max-h-[680px] flex-col border-r border-[#EEE7E1] bg-white">
          <div className="border-b border-[#EEE7E1] p-4">
            <h2 className="font-bold text-[#340306]">Campus Buildings</h2>

            <p className="mt-1 text-xs text-neutral-500">
              Select a building to inspect its reports.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {visibleBuildings.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-sm font-semibold text-neutral-600">
                  No buildings found
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Try adjusting your filters.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {visibleBuildings.map((building) => {
                  const selected =
                    selectedBuilding?.building_id === building.building_id;

                  return (
                    <button
                      key={building.building_id}
                      type="button"
                      onClick={() => openBuilding(building)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-[#A6292F]/30 bg-[#A6292F]/5"
                          : "border-transparent hover:bg-[#FAF9F6]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 size-3 shrink-0 rounded-full ${getRiskColor(
                            building.risk_level,
                          )}`}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-neutral-800">
                            {building.building_name}
                          </p>

                          <p className="mt-1 text-[11px] text-neutral-400">
                            {building.building_id}
                          </p>

                          <div className="mt-2 flex items-center gap-3 text-[11px] text-neutral-500">
                            <span>
                              H <strong>{building.hazard_count || 0}</strong>
                            </span>

                            <span>
                              I <strong>{building.incident_count || 0}</strong>
                            </span>

                            <span
                              className={`font-semibold ${getRiskText(
                                building.risk_level,
                              )}`}
                            >
                              {building.risk_level || "Unassessed"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ==================================================== */}
        {/* MAP */}
        {/* ==================================================== */}

        <section className="relative min-h-[600px] bg-neutral-100">
          {mapError ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <p className="font-semibold text-red-600">Unable to load map</p>

                <p className="mt-1 text-sm text-neutral-500">{mapError}</p>
              </div>
            </div>
          ) : (
            <>
              <MapContainer
                className="h-full min-h-[680px] w-full"
                center={[14.997816, 120.655568]}
                zoom={19}
                scrollWheelZoom
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {visibleBuildings.map((building) => {
                  const latitude = Number(building.latitude);

                  const longitude = Number(building.longitude);

                  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
                    return null;
                  }

                  return (
                    <Marker
                      key={building.building_id}
                      position={[latitude, longitude]}
                      icon={MapIcon(building.risk_level || "unassessed")}
                      eventHandlers={{
                        click: () => openBuilding(building),
                      }}
                    >
                      <Tooltip>
                        <div className="min-w-48">
                          <p className="font-bold">{building.building_name}</p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {building.building_id}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <span>Hazards</span>

                            <strong>{building.hazard_count || 0}</strong>

                            <span>Incidents</span>

                            <strong>{building.incident_count || 0}</strong>

                            <span>Pending</span>

                            <strong>{building.unassessed_count || 0}</strong>

                            <span>Risk</span>

                            <strong>
                              {building.risk_level || "Unassessed"}
                            </strong>
                          </div>
                        </div>
                      </Tooltip>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* LEGEND */}
              <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-neutral-200 bg-white/95 p-3 shadow-lg backdrop-blur">
                <p className="mb-2 text-xs font-bold text-neutral-700">
                  Risk Level
                </p>

                <div className="space-y-1.5 text-[11px] text-neutral-600">
                  <Legend color="bg-neutral-400" label="Not Assessed" />

                  <Legend color="bg-green-500" label="Low" />

                  <Legend color="bg-yellow-400" label="Moderate" />

                  <Legend color="bg-orange-500" label="High" />

                  <Legend color="bg-red-500" label="Critical" />

                  <Legend color="bg-red-800" label="Catastrophic" />
                </div>
              </div>
            </>
          )}
        </section>

        {/* ==================================================== */}
        {/* DETAILS PANEL */}
        {/* ==================================================== */}

        <aside className="flex max-h-[680px] flex-col bg-white">
          {!selectedBuilding ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#A6292F]/10 text-[#A6292F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 21s6.75-6.22 6.75-12A6.75 6.75 0 1 0 5.25 9C5.25 14.78 12 21 12 21Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 9a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </div>

              <h3 className="font-bold text-[#340306]">Select a Building</h3>

              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Click a marker or building from the list to inspect its safety
                reports.
              </p>
            </div>
          ) : (
            <>
              {/* Building Header */}
              <div className="border-b border-[#EEE7E1] p-4">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold tracking-wider text-[#A6292F] uppercase">
                      Selected Building
                    </p>

                    <h2 className="mt-1 font-bold text-[#340306]">
                      {selectedBuilding.building_name}
                    </h2>

                    <p className="mt-1 text-xs text-neutral-400">
                      {selectedBuilding.building_id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBuilding(null);

                      setBuildingReports([]);
                    }}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Building Stats */}
              <div className="grid grid-cols-2 gap-2 border-b border-[#EEE7E1] bg-[#FAF9F6] p-3">
                <MiniStat
                  label="Hazards"
                  value={selectedBuilding.hazard_count || 0}
                />

                <MiniStat
                  label="Incidents"
                  value={selectedBuilding.incident_count || 0}
                />

                <MiniStat
                  label="Assessed"
                  value={selectedBuilding.assessed_count || 0}
                />

                <MiniStat
                  label="Pending"
                  value={selectedBuilding.unassessed_count || 0}
                />
              </div>

              {/* Risk */}
              <div className="border-b border-[#EEE7E1] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-500">
                    Building Risk
                  </span>

                  <span className="flex items-center gap-2 text-xs font-bold capitalize">
                    <span
                      className={`size-2.5 rounded-full ${getRiskColor(
                        selectedBuilding.risk_level,
                      )}`}
                    />

                    {selectedBuilding.risk_level || "Not Assessed"}
                  </span>
                </div>
              </div>

              {/* Report List */}
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <h3 className="mb-3 text-xs font-bold tracking-wide text-neutral-500 uppercase">
                  Reports
                </h3>

                {loadingReports ? (
                  <div className="flex justify-center py-10">
                    <div className="size-6 animate-spin rounded-full border-3 border-neutral-200 border-t-[#A6292F]" />
                  </div>
                ) : buildingReports.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-neutral-600">
                      No reports found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {buildingReports.map((report) => (
                      <button
                        type="button"
                        key={`${report.report_type}-${report.report_id}`}
                        onClick={() => openReport(report)}
                        className="w-full rounded-xl border border-neutral-200 p-3 text-left transition hover:border-[#A6292F]/30 hover:bg-[#A6292F]/5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md bg-[#A6292F]/10 px-2 py-1 text-[10px] font-bold text-[#A6292F] uppercase">
                            {report.report_type === "hazard"
                              ? "Hazard"
                              : "Incident"}
                          </span>

                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
                              isAssessed(report)
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {isAssessed(report) ? "Assessed" : "Not Assessed"}
                          </span>
                        </div>

                        <h4 className="mt-2 line-clamp-2 text-sm font-semibold text-neutral-800">
                          {report.report_title ||
                            report.title ||
                            "Untitled Report"}
                        </h4>

                        <p className="mt-1 text-xs text-neutral-500">
                          {report.exact_area ||
                            report.exact_location ||
                            "Location not specified"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-semibold ${getStatusClass(
                              report.status,
                            )}`}
                          >
                            {getStatusLabel(report.status)}
                          </span>

                          {report.risk_level && (
                            <span className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600">
                              <span
                                className={`size-2 rounded-full ${getRiskColor(
                                  report.risk_level,
                                )}`}
                              />

                              {report.risk_level}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-end border-t border-neutral-100 pt-2 text-xs font-semibold text-[#A6292F]">
                          View Report →
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

const SummaryCard = ({ label, value, icon }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#E8E1DA] bg-white p-4 shadow-sm">
      <div className="flex size-11 items-center justify-center rounded-xl bg-[#A6292F]/10 text-[#A6292F]">
        {icon}
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-500">{label}</p>

        <p className="mt-1 text-2xl font-bold text-[#340306]">{value}</p>
      </div>
    </div>
  );
};

const MiniStat = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-[#EEE7E1] bg-white p-3">
      <p className="text-[10px] font-semibold text-neutral-400 uppercase">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-[#340306]">{value}</p>
    </div>
  );
};

const FilterSelect = ({ value, onChange, children }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-700 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10"
    >
      {children}
    </select>
  );
};

const Legend = ({ color, label }) => {
  return (
    <div className="flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${color}`} />

      {label}
    </div>
  );
};

export default AdminMapPage;
