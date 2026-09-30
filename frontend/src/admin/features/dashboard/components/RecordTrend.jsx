import useApiData from "../../../../shared/useApiData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

export default function RecordTrend() {
  const { data, loading, error } = useApiData("/api/dashboard/admin", {
    key: "monthlyReports",
  });
  const reportTrend = data.map((row) => ({
    month: row.month,
    reports: Number(row.hazard_reports) + Number(row.incident_reports),
  }));
  if (loading) return <p>Loading report trend...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <>
      <div className="flex w-full overflow-x-auto">
        <div width="100%" height="100%">
          <LineChart width={540} height={300} data={reportTrend}>
            <CartesianGrid vertical={false} stroke="#EDE9E3" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Line
              type="monotone"
              dataKey="reports"
              stroke="#A6292F"
              strokeWidth={2}
            />
          </LineChart>
        </div>
      </div>
    </>
  );
}
