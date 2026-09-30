import useApiData from "../../../../shared/useApiData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const severityColors = {
  High: "#dc2626",
  Critical: "#dc2626",
  Moderate: "#f59e0b",
  Low: "#65a30d",
};

const CustomYAxisTick = ({ x, y, payload }) => {
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      dominantBaseline="middle"
      fill={severityColors[payload.value]}
      className="font-bold"
    >
      {payload.value}
    </text>
  );
};

export default function RiskLevelDistribution() {
  const { data, loading, error } = useApiData("/api/dashboard/analytics", {
    key: "riskDistribution",
  });
  if (loading) return <p>Loading risk distribution...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!data.length) return <p>No assessed active reports yet.</p>;
  return (
    <>
      <div className="h-full w-full">
        <div width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 5,
              right: 20,
              left: 10,
              bottom: 5,
            }}
            barSize={18}
            width={500}
            height={200}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="severity"
              axisLine={false}
              tickLine={false}
              tick={CustomYAxisTick}
            />
            <Tooltip />
            <Bar dataKey="reports" fill="#991b1b" radius={[0, 6, 6, 0]} />
          </BarChart>
        </div>
      </div>
    </>
  );
}
