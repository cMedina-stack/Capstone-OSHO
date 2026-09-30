import useApiData from "../../../shared/useApiData";

// ============================================================
// ALERT STYLES
// ============================================================

const alertStyles = {
  catastrophic: {
    label: "Catastrophic Risk",
    dot: "bg-red-800",
    background: "bg-red-100",
    border: "border-red-300",
    text: "text-red-900",
  },

  critical: {
    label: "Critical Risk",
    dot: "bg-red-600",
    background: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },

  high: {
    label: "High Risk",
    dot: "bg-orange-500",
    background: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
  },

  moderate: {
    label: "Moderate Risk",
    dot: "bg-yellow-500",
    background: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
  },

  low: {
    label: "Low Risk",
    dot: "bg-green-500",
    background: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },

  pending_assessment: {
    label: "Pending Assessment",
    dot: "bg-yellow-500",
    background: "bg-yellow-50",
    border: "border-yellow-100",
    text: "text-yellow-700",
  },

  under_review: {
    label: "Under Review",
    dot: "bg-yellow-500",
    background: "bg-yellow-50",
    border: "border-yellow-100",
    text: "text-yellow-700",
  },

  submitted: {
    label: "New Report",
    dot: "bg-blue-500",
    background: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-700",
  },

  resolved: {
    label: "Resolved",
    dot: "bg-green-500",
    background: "bg-green-50",
    border: "border-green-100",
    text: "text-green-700",
  },

  rejected: {
    label: "Closed",
    dot: "bg-gray-500",
    background: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
  },
};

const defaultStyle = {
  label: "Safety Update",
  dot: "bg-gray-500",
  background: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-700",
};

// ============================================================
// GET ALERT STYLE
// ============================================================

const getAlertStyle = (alert) => {
  const reportType = String(alert.report_type || "").toLowerCase();

  // ----------------------------------------------------------
  // HAZARD
  // ----------------------------------------------------------

  if (reportType === "hazard") {
    const riskLevel = String(alert.risk_level || "").toLowerCase();

    // Has OSHO assessment
    if (riskLevel && riskLevel !== "none") {
      return alertStyles[riskLevel] || defaultStyle;
    }

    // No assessment yet
    return alertStyles.pending_assessment;
  }

  // ----------------------------------------------------------
  // INCIDENT
  // ----------------------------------------------------------

  const status = String(alert.status || "").toLowerCase();

  return alertStyles[status] || defaultStyle;
};

// ============================================================
// REPORT LABEL
// ============================================================

const getReportLabel = (reportType) => {
  if (reportType === "hazard") {
    return "Hazard Report";
  }

  if (reportType === "incident") {
    return "Incident Report";
  }

  return "Safety Report";
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================================
// FORMAT STATUS
// ============================================================

const formatStatus = (status) => {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// ============================================================
// FORMAT RISK
// ============================================================

const formatRisk = (risk) => {
  if (!risk || risk === "none") {
    return "Not Assessed";
  }

  return String(risk)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// ============================================================
// COMPONENT
// ============================================================

export default function CampusSafetyAlert() {
  // ==========================================================
  // GET ALERTS
  // ==========================================================

  const {
    data: alerts,
    loading,
    error,
    reload: getAlerts,
  } = useApiData("/api/dashboard/campus-alerts", { pollMs: 30000 });

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <section className="flex h-[40rem] flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-lg">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mb-5 flex shrink-0 items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-[#A6292F] uppercase">
            Campus Safety Alerts
          </h2>

          <p className="mt-1 text-sm text-[#8A7A6A]">
            Recent safety updates around the campus
          </p>
        </div>

        <button
          type="button"
          onClick={getAlerts}
          disabled={loading}
          className="rounded-lg border border-[#E5DED5] bg-white px-3 py-2 text-xs font-medium text-[#6B5A4D] transition hover:bg-[#F5F1EC] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ======================================================
          LOADING
      ======================================================= */}

      {loading && (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="flex gap-3">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-gray-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-200" />

                  <div className="h-4 w-3/4 rounded bg-gray-200" />

                  <div className="h-3 w-1/2 rounded bg-gray-200" />

                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}

      {!loading && error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <div className="flex gap-3">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-500" />

            <div>
              <p className="font-semibold text-red-700">
                Unable to load safety alerts
              </p>

              <p className="mt-1 text-sm text-red-600">{error}</p>

              <button
                type="button"
                onClick={getAlerts}
                className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          EMPTY STATE
      ======================================================= */}

      {!loading && !error && alerts.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full rounded-xl border border-green-100 bg-green-50 p-5 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg text-green-600">✓</span>
            </div>

            <p className="font-semibold text-green-700">
              No Recent Safety Alerts
            </p>

            <p className="mt-1 text-sm text-green-600">
              There are currently no important campus safety updates.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          ALERTS
      ======================================================= */}

      {!loading && !error && alerts.length > 0 && (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const style = getAlertStyle(alert);

            const reportType = String(
              alert.report_type || "safety",
            ).toLowerCase();

            const area = alert.exact_area?.trim();

            const hasAssessment =
              reportType === "hazard" && alert.assessment_id;

            return (
              <article
                key={`${reportType}-${alert.report_id}`}
                className={`shrink-0 rounded-xl border p-4 ${style.background} ${style.border}`}
              >
                <div className="flex gap-3">
                  {/* ==================================================
                        INDICATOR
                    =================================================== */}

                  <span
                    className={`mt-1.5 size-3 shrink-0 rounded-full ${style.dot}`}
                  />

                  <div className="min-w-0 flex-1">
                    {/* ==================================================
                          ALERT HEADER
                      =================================================== */}

                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-semibold ${style.text}`}>
                        {style.label}
                      </p>

                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium tracking-wide text-gray-500 uppercase">
                        {getReportLabel(reportType)}
                      </span>
                    </div>

                    {/* ==================================================
                          REPORT TITLE
                      =================================================== */}

                    <p className="mt-2 font-semibold text-[#340306]">
                      {alert.report_title || "Untitled Safety Report"}
                    </p>

                    {/* ==================================================
                          BUILDING
                      =================================================== */}

                    <p className="mt-1 text-sm font-medium text-[#6B5A4D]">
                      🏢 {alert.building_name || "Unknown Building"}
                    </p>

                    {/* ==================================================
                          EXACT AREA
                      =================================================== */}

                    {area && (
                      <p className="mt-1 text-sm font-medium text-[#6B5A4D]">
                        📍 {area}
                      </p>
                    )}

                    {/* ==================================================
                          REPORT INFORMATION
                      =================================================== */}

                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#8A7A6A]">
                      {reportType === "hazard" ? (
                        <>
                          <span>Risk: {formatRisk(alert.risk_level)}</span>

                          <span>•</span>

                          <span>
                            {hasAssessment ? "Assessed" : "Pending Assessment"}
                          </span>
                        </>
                      ) : (
                        <span>Status: {formatStatus(alert.status)}</span>
                      )}

                      <span>•</span>

                      <span>{formatDate(alert.report_date)}</span>
                    </div>

                    {/* ==================================================
                          ASSESSMENT STATUS
                      =================================================== */}

                    {reportType === "hazard" && alert.assessment_status && (
                      <div className="mt-2">
                        <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-medium text-[#6B5A4D]">
                          Assessment: {formatStatus(alert.assessment_status)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ======================================================
          FOOTER
      ======================================================= */}

      {!loading && !error && alerts.length > 0 && (
        <div className="mt-3 shrink-0 border-t border-[#E8E1D9] pt-3">
          <p className="text-center text-xs text-[#8A7A6A]">
            Showing the 10 most recent campus safety updates
          </p>
        </div>
      )}
    </section>
  );
}
