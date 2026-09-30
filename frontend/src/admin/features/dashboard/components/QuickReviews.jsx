import { apiFetch } from "../../../../shared/api";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

export default function QuickReviews() {
  const [data, setData] = useState({
    totalReports: 0,
    hazardReports: 0,
    incidentReports: 0,
    pendingAssessments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuickReviews = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication required");
          return;
        }

        const response = await apiFetch(
          "/api/quick-reviews",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load quick review data");
        }

        setData({
          totalReports: result.data.totalReports ?? 0,
          hazardReports: result.data.hazardReports ?? 0,
          incidentReports: result.data.incidentReports ?? 0,
          pendingAssessments: result.data.pendingAssessments ?? 0,
        });
      } catch (error) {
        console.error("Quick reviews error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuickReviews();
  }, []);

  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {/* ==========================================
          TOTAL REPORTS
      ========================================== */}
      <div className="flex w-full gap-5 rounded-xl bg-[#FAF9F6] p-5 shadow-lg">
        <span className="mt-3 flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-[#A6292F] p-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        </span>

        <div>
          <h3 className="font-semibold text-[#A6292F] uppercase">
            total reports
          </h3>

          {loading ? (
            <div className="mt-1 h-9 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <h1 className="text-3xl font-bold text-[#651317]">
              {data.totalReports}
            </h1>
          )}

          <h6 className="text-sm text-[#6B5A4D]">Hazard + incident reports</h6>
        </div>
      </div>

      {/* ==========================================
          HAZARD REPORTS
      ========================================== */}
      <div className="flex w-full gap-5 rounded-xl bg-[#FAF9F6] p-5 shadow-lg">
        <span className="mt-3 flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-[#F4B223] p-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </span>

        <div>
          <h3 className="font-semibold text-[#F4B223] uppercase">
            hazard reports
          </h3>

          {loading ? (
            <div className="mt-1 h-9 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <h1 className="text-3xl font-bold text-[#651317]">
              {data.hazardReports}
            </h1>
          )}

          <h6 className="text-sm text-[#6B5A4D]">Recorded hazard reports</h6>
        </div>
      </div>

      {/* ==========================================
          INCIDENT REPORTS
      ========================================== */}
      <div className="flex w-full gap-5 rounded-xl bg-[#FAF9F6] p-5 shadow-lg">
        <span className="mt-3 flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-red-500 p-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 21a7.5 7.5 0 0 1 15 0"
            />
          </svg>
        </span>

        <div>
          <h3 className="font-semibold text-red-500 uppercase">
            incident reports
          </h3>

          {loading ? (
            <div className="mt-1 h-9 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <h1 className="text-3xl font-bold text-[#651317]">
              {data.incidentReports}
            </h1>
          )}

          <h6 className="text-sm text-[#6B5A4D]">Recorded incident reports</h6>
        </div>
      </div>

      {/* ==========================================
          PENDING ASSESSMENTS
      ========================================== */}
      <div className="flex w-full gap-5 rounded-xl bg-[#FAF9F6] p-5 shadow-lg">
        <span className="mt-3 flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-[#A6292F] p-2 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2.25-13.5h-4.5A2.25 2.25 0 0 0 10.5 4.75v.5h3V4.75A2.25 2.25 0 0 0 11.25 2.5h1.5A2.25 2.25 0 0 1 15 4.75v.5h2.25A2.25 2.25 0 0 1 19.5 7.5v12A2.25 2.25 0 0 1 17.25 21.75H6.75A2.25 2.25 0 0 1 4.5 19.5v-12A2.25 2.25 0 0 1 6.75 5.25H9"
            />
          </svg>
        </span>

        <div>
          <h3 className="font-semibold text-[#A6292F] uppercase">
            pending assessments
          </h3>

          {loading ? (
            <div className="mt-1 h-9 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <h1 className="text-3xl font-bold text-[#651317]">
              {data.pendingAssessments}
            </h1>
          )}

          <h6 className="text-sm font-semibold text-[#A6292F]">
            <NavLink to={"/admin/assessments"}>View assessments →</NavLink>
          </h6>
        </div>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}
      {error && (
        <div className="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
