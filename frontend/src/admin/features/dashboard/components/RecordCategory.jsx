import useApiData from "../../../../shared/useApiData";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

const colors = [
  "#991b1b",
  "#f59e0b",
  "#dc2626",
  "#f97316",
  "#c4b5fd",
  "#a3a3a3",
];

export default function RecordCategories() {
  const {
    data: records,
    loading,
    error,
  } = useApiData("/api/dashboard/analytics", { key: "categories" });
  const data = records.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));
  if (loading) return <p>Loading categories...</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!data.length) return <p>No report categories yet.</p>;
  return (
    <div className="relative flex h-full w-full justify-between">
      <div className="relative h-52.5 w-55">
        <PieChart width={220} height={210} className="z-50">
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={70}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip animationDuration={0} />
        </PieChart>

        <div className="absolute top-[37%] right-[39%] z-10 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-[#651317]">
            {data.reduce((total, item) => total + item.value, 0)}
          </h1>

          <span className="font-semibold text-[#6B5A4D]">Categories</span>
        </div>
      </div>

      <div className="flex w-60 flex-col gap-2.5">
        {data.map((item) => (
          <div key={item.name} className="flex justify-between">
            <div className="flex gap-4">
              <div
                className="rounded-lg p-3"
                style={{
                  backgroundColor: item.color,
                }}
              />

              <h1 className="font-semibold text-[#651317]">{item.name}</h1>
            </div>

            <span className="font-semibold text-[#651317]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
