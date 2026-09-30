import { apiFetch } from "../../../../shared/api";
import { useEffect, useMemo, useState } from "react";

export default function ReportOverview() {
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("6");

  useEffect(() => {
    const fetchReportsOverview = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await apiFetch(
          "/api/dashboard/admin",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        // Read response as text first
        const responseText = await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("REPORT OVERVIEW INVALID JSON RESPONSE:", responseText);

          throw new Error(
            `Unable to load the report overview. Please try again.`, { cause: parseError },
          );
        }

        if (!response.ok) {
          throw new Error(
            result.error || result.message || "Failed to load reports overview",
          );
        }

        const reports =
          result.monthlyReports || result.data?.monthlyReports || [];

        if (!Array.isArray(reports)) {
          console.error("Invalid monthlyReports data:", reports);
          throw new Error("monthlyReports is not an array");
        }

        setMonthlyReports(reports);
      } catch (error) {
        console.error("Reports overview error:", error);
        setError(error.message || "Failed to load reports overview");
      } finally {
        setLoading(false);
      }
    };

    fetchReportsOverview();
  }, []);

  // Normalize backend data
  const chartData = useMemo(() => {
    return monthlyReports
      .map((item) => {
        const hazard = Number(
          item.hazard_reports ?? item.hazards ?? item.hazard_count ?? 0,
        );

        const incident = Number(
          item.incident_reports ?? item.incidents ?? item.incident_count ?? 0,
        );

        return {
          month: item.month || item.month_name || item.label || "",
          hazard,
          incident,
          total: hazard + incident,
        };
      })
      .slice(-Number(period));
  }, [monthlyReports, period]);

  const maxValue = Math.max(
    ...chartData.map((item) => Math.max(item.hazard, item.incident)),
    1,
  );

  const totalHazards = chartData.reduce(
    (total, item) => total + item.hazard,
    0,
  );

  const totalIncidents = chartData.reduce(
    (total, item) => total + item.incident,
    0,
  );

  const totalReports = totalHazards + totalIncidents;

  return (
    <div className="h-[45rem] w-full rounded-xl bg-white p-5 shadow-lg">
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#651317] uppercase">
            Reports Overview
          </h2>

          <p className="text-xs text-[#6B5A4D]">
            Monthly hazard and incident reports
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-[#D8CEC5] bg-white px-3 py-2 text-xs font-medium text-[#651317] outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
        >
          <option value="3">3 Months</option>
          <option value="6">6 Months</option>
          <option value="12">12 Months</option>
        </select>
      </div>

      {/* SUMMARY */}
      {!loading && !error && (
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-[#E5DDD5] bg-white px-3 py-2">
            <p className="text-[10px] font-semibold text-[#6B5A4D] uppercase">
              Total
            </p>

            <p className="text-lg font-bold text-[#651317]">{totalReports}</p>
          </div>

          <div className="rounded-lg border border-[#E5DDD5] bg-white px-3 py-2">
            <p className="text-[10px] font-semibold text-[#6B5A4D] uppercase">
              Hazards
            </p>

            <p className="text-lg font-bold text-[#F4B223]">{totalHazards}</p>
          </div>

          <div className="rounded-lg border border-[#E5DDD5] bg-white px-3 py-2">
            <p className="text-[10px] font-semibold text-[#6B5A4D] uppercase">
              Incidents
            </p>

            <p className="text-lg font-bold text-red-500">{totalIncidents}</p>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="flex h-56 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-[#6B5A4D]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#A6292F] border-t-transparent" />
            Loading reports...
          </div>
        </div>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Failed to load reports overview
          </p>

          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && !error && chartData.length === 0 && (
        <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-[#D8CEC5]">
          <p className="text-sm text-[#6B5A4D]">No report data available.</p>
        </div>
      )}

      {/* CHART */}
      {!loading && !error && chartData.length > 0 && (
        <div className="space-y-4">
          {/* LEGEND - FIXED */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F4B223]" />
              <span className="text-xs text-[#6B5A4D]">Hazards</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-xs text-[#6B5A4D]">Incidents</span>
            </div>
          </div>

          {/* SCROLLABLE MONTHS ONLY */}
          <div className="max-h-[30rem] overflow-y-auto pr-2">
            <div className="space-y-4">
              {chartData.map((item, index) => {
                const hazardWidth =
                  item.hazard > 0
                    ? Math.max((item.hazard / maxValue) * 100, 4)
                    : 0;

                const incidentWidth =
                  item.incident > 0
                    ? Math.max((item.incident / maxValue) * 100, 4)
                    : 0;

                return (
                  <div key={`${item.month}-${index}`} className="space-y-2">
                    {/* MONTH */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#651317]">
                        {item.month}
                      </span>

                      <span className="text-[10px] text-[#8A796D]">
                        {item.total} reports
                      </span>
                    </div>

                    {/* HAZARD */}
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-[10px] text-[#8A796D]">
                        Hazard
                      </span>

                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#EEE8E2]">
                        <div
                          className="h-full rounded-full bg-[#F4B223] transition-all duration-500"
                          style={{
                            width: `${hazardWidth}%`,
                          }}
                        />
                      </div>

                      <span className="w-7 text-right text-[10px] font-semibold text-[#6B5A4D]">
                        {item.hazard}
                      </span>
                    </div>

                    {/* INCIDENT */}
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-[10px] text-[#8A796D]">
                        Incident
                      </span>

                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#EEE8E2]">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all duration-500"
                          style={{
                            width: `${incidentWidth}%`,
                          }}
                        />
                      </div>

                      <span className="w-7 text-right text-[10px] font-semibold text-[#6B5A4D]">
                        {item.incident}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
