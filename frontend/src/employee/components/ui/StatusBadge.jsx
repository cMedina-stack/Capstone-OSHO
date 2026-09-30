export default function StatusBadge({ status }) {
  const statusStyles = {
    submitted: "bg-blue-100 text-blue-700 border border-blue-500 rounded-lg",

    under_review:
      "bg-yellow-100 text-yellow-700 border border-yellow-500 rounded-lg",
    action_required:
      "bg-yellow-100 text-yellow-700 border border-yellow-500 rounded-lg",
    pending:
      "bg-yellow-100 text-yellow-700 border border-yellow-500 rounded-lg",

    investigating:
      "bg-purple-100 text-purple-700 border border-purple-500 rounded-lg",

    resolved: "bg-green-100 text-green-700 border border-green-500 rounded-lg",
  };

  return (
    <span
      className={`${statusStyles[status] || "rounded-lg bg-gray-100 text-gray-700"} p-1 pr-2 pl-2`}
    >
      {String(status || "Unknown").replaceAll("_", " ")}
    </span>
  );
}
