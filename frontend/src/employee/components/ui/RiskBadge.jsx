const RiskBadge = ({ risk }) => {
  const riskStyles = {
    low: "bg-green-100 text-green-700",
    moderate: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
    catastrophic: "bg-red-200 text-red-900",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        riskStyles[risk] || "bg-gray-100 text-gray-600"
      }`}
    >
      {risk || "—"}
    </span>
  );
};

export default RiskBadge;
