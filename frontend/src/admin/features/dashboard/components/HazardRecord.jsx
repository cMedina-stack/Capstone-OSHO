import { Link } from "react-router-dom";
import useApiData from "../../../../shared/useApiData";
import RiskBadge from "../../../../employee/components/ui/RiskBadge";
import StatusBadge from "../../../../employee/components/ui/StatusBadge";
export default function HazardReports() {
  const { data, loading, error } = useApiData("/api/admin-assessments", {
    key: "data",
  });
  return (
    <section className="rounded-2xl bg-[#FAF9F6] p-5 shadow-lg">
      <h2 className="mb-4 font-bold text-[#651317]">Recent hazard reports</h2>
      {loading ? (
        <p>Loading reports...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        <ul className="space-y-4">
          {data
            .filter((item) => item.report_type === "hazard")
            .slice(0, 5)
            .map((item) => (
              <li
                key={item.report_id}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  to={`/admin/hazard-reports/${item.report_id}`}
                  className="text-[#651317] underline"
                >
                  {item.title}
                </Link>
                <RiskBadge risk={item.risk_level?.toLowerCase()} />
                <StatusBadge status={item.report_status} />
              </li>
            ))}
        </ul>
      )}
      <Link
        to="/admin/assessments"
        className="mt-4 block font-semibold text-[#651317]"
      >
        View all reports →
      </Link>
    </section>
  );
}
