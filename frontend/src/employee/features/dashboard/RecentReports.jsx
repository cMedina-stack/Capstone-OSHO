import { apiFetch } from "../../../shared/api";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import RiskBadge from "../../components/ui/RiskBadge";
import StatusBadge from "../../components/ui/StatusBadge";

const RecentReport = () => {
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecentHazards = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/hazards/my-recent", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Failed to fetch hazard reports",
          );
        }

        setRecentReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching hazard reports:", error);

        setError(error.message || "Unable to load your recent hazard reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentHazards();
  }, []);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="flex h-[420px] w-full flex-col overflow-hidden rounded-2xl border border-[#E8E1DA] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EEE7E1] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#A6292F]/10 text-[#A6292F]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM10.34 3.94 1.82 18.25A1.5 1.5 0 0 0 3.11 20.5h17.78a1.5 1.5 0 0 0 1.29-2.25L13.66 3.94a1.5 1.5 0 0 0-3.32 0Z"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-sm font-bold tracking-wide text-[#651317] uppercase">
                Recent Hazard Reports
              </h2>

              <p className="mt-0.5 text-xs text-[#8A7A6A]">
                Latest hazards you have recorded
              </p>
            </div>
          </div>
        </div>

        {!loading && !error && recentReports.length > 0 && (
          <span className="rounded-full bg-[#F4B223]/15 px-3 py-1 text-xs font-bold text-[#8B6412]">
            {recentReports.length} Recent
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="size-8 animate-spin rounded-full border-4 border-[#A6292F]/20 border-t-[#A6292F]" />

            <div>
              <p className="text-sm font-semibold text-[#651317]">
                Loading reports...
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Retrieving your latest hazard reports
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM10.34 3.94 1.82 18.25A1.5 1.5 0 0 0 3.11 20.5h17.78a1.5 1.5 0 0 0 1.29-2.25L13.66 3.94a1.5 1.5 0 0 0-3.32 0Z"
                />
              </svg>
            </div>

            <p className="font-semibold text-gray-700">
              Unable to load reports
            </p>

            <p className="mt-1 max-w-sm text-sm text-gray-400">{error}</p>
          </div>
        ) : recentReports.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-[#F8F6F2] text-[#8A7A6A]">
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m5.25 0H6.375A2.625 2.625 0 0 0 3.75 4.875v14.25a2.625 2.625 0 0 0 2.625 2.625h11.25a2.625 2.625 0 0 0 2.625-2.625V9m-6.75-6.75L20.25 9"
                />
              </svg>
            </div>

            <p className="font-semibold text-[#651317]">
              No hazard reports yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Your recently recorded hazards will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#FAF9F6]">
              <tr className="border-b border-[#EEE7E1]">
                <th className="px-5 py-3 text-left text-[11px] font-bold tracking-wider text-[#8A7A6A] uppercase">
                  Date
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-[#8A7A6A] uppercase">
                  Building
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-[#8A7A6A] uppercase">
                  Hazard Type
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-[#8A7A6A] uppercase">
                  Initial Risk
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-[#8A7A6A] uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recentReports.map((report) => (
                <tr
                  key={report.hazard_id}
                  className="border-b border-[#F1ECE8] transition-colors last:border-b-0 hover:bg-[#FAF9F6]"
                >
                  {/* Date */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3.75 9h16.5M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v12a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z"
                          />
                        </svg>
                      </div>

                      <span className="text-sm font-semibold text-gray-600">
                        {formatDate(report.report_date)}
                      </span>
                    </div>
                  </td>

                  {/* Building */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4 shrink-0 text-[#A6292F]"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.75 21h16.5M4.5 21V5.25A2.25 2.25 0 0 1 6.75 3h6.75v18m0-13.5h3.75A2.25 2.25 0 0 1 19.5 9.75V21M8.25 7.5h1.5m-1.5 3.75h1.5m-1.5 3.75h1.5m6-3h.008v.008h-.008V12Zm0 3h.008v.008h-.008V15Z"
                        />
                      </svg>

                      <span className="line-clamp-2 text-sm font-semibold text-[#340306]">
                        {report.building_name || "Unknown Building"}
                      </span>
                    </div>
                  </td>

                  {/* Hazard Type */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {report.hazard_types?.length > 0 ? (
                        <>
                          {report.hazard_types
                            .slice(0, 2)
                            .map((type, index) => (
                              <span
                                key={`${report.hazard_id}-${type}-${index}`}
                                className="rounded-md bg-[#A6292F]/8 px-2 py-1 text-xs font-semibold text-[#651317]"
                              >
                                {type}
                              </span>
                            ))}

                          {report.hazard_types.length > 2 && (
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
                              +{report.hazard_types.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Initial Risk */}
                  <td className="px-4 py-4">
                    <RiskBadge risk={report.initial_risk} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#EEE7E1] bg-[#FAF9F6] px-5 py-3">
        <NavLink
          to="/employee/my-reports"
          className="group flex items-center justify-center gap-2 text-sm font-bold text-[#651317] transition hover:text-[#A6292F]"
        >
          View all my reports
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="size-4 transition-transform group-hover:translate-x-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </NavLink>
      </div>
    </section>
  );
};

export default RecentReport;
