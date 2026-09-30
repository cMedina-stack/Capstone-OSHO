import { apiFetch } from "../../../../shared/api";
import { useEffect, useState } from "react";

const HazardForm = () => {
  const [buildings, setBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await apiFetch("/api/buildings");

        if (!response.ok) {
          throw new Error("Failed to fetch buildings");
        }

        const data = await response.json();
        setBuildings(data);
      } catch (error) {
        console.error("Error loading buildings:", error);
        setError("Unable to load buildings.");
      } finally {
        setLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const hazardType = formData.getAll("hazardType");
    const affected = formData.getAll("affected");

    const data = {
      reportTitle: formData.get("reportTitle"),
      reportDate: formData.get("reportDate"),
      buildingId: formData.get("building"),
      exactLocation: formData.get("exactLocation"),

      hazardType,
      affected,
      affectedOthers: formData.get("affectedOthers"),

      reportDescription: formData.get("reportDescription"),
      riskAssociated: formData.get("riskAssociated"),
      preventiveAction: formData.get("preventiveAction"),
      actionTaken: formData.get("actionTaken"),
    };

    try {
      setIsSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await apiFetch("/api/hazards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to record hazard");
      }

      form.reset();
      setShowSuccess(true);
    } catch (error) {
      console.error("Error recording hazard:", error);
      setError(error.message || "Failed to record hazard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* =========================================================
            SECTION 1 — HAZARD INFORMATION
        ========================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Hazard Information
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Provide the basic information about the observed hazard.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Report Title */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reportTitle"
                className="text-sm font-medium text-neutral-700"
              >
                Report Title
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                id="reportTitle"
                name="reportTitle"
                placeholder="e.g. Wet Floor"
                required
                className="h-10 rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Date Reported */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reportDate"
                className="text-sm font-medium text-neutral-700"
              >
                Date Reported
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="date"
                id="reportDate"
                name="reportDate"
                required
                className="h-10 rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Building */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="building"
                className="text-sm font-medium text-neutral-700"
              >
                Building
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                id="building"
                name="building"
                required
                disabled={loadingBuildings}
                className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F] disabled:bg-neutral-100"
              >
                <option value="">
                  {loadingBuildings
                    ? "Loading buildings..."
                    : "Select Building"}
                </option>

                {buildings.map((building) => (
                  <option
                    key={building.building_id}
                    value={building.building_id}
                  >
                    {building.building_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exact Location */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="exactLocation"
                className="text-sm font-medium text-neutral-700"
              >
                Exact Location
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                id="exactLocation"
                name="exactLocation"
                placeholder="Room, hallway, laboratory..."
                required
                className="h-10 rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2 — CLASSIFICATION
        ========================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Hazard Classification
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Identify the type of hazard and the people who may be affected.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            {/* Hazard Type */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">
                Kind of Workplace Hazard
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  "Safety",
                  "Biological",
                  "Physical",
                  "Ergonomical",
                  "Chemical",
                  "Workload",
                ].map((type) => (
                  <label
                    key={type}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      name="hazardType"
                      value={type}
                      className="h-4 w-4 accent-[#A6292F]"
                    />

                    <span className="text-neutral-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Affected */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">
                Who May Be Affected
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {/* Students */}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    name="affected"
                    value="students"
                    className="h-4 w-4 accent-[#A6292F]"
                  />

                  <span>Students</span>
                </label>

                {/* Employees */}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    name="affected"
                    value="employees"
                    className="h-4 w-4 accent-[#A6292F]"
                  />

                  <span>Employees</span>
                </label>

                {/* Others */}
                <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    name="affected"
                    value="others"
                    className="h-4 w-4 shrink-0 accent-[#A6292F]"
                  />

                  <span className="shrink-0">Others:</span>

                  <input
                    type="text"
                    name="affectedOthers"
                    placeholder="Please specify"
                    className="min-w-0 flex-1 border-b border-neutral-300 bg-transparent px-1 py-0.5 text-sm outline-none focus:border-[#A6292F]"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3 — HAZARD DETAILS
        ========================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Hazard Details
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Describe the hazard, possible risks, and actions taken.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
            {/* Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="reportDescription"
                className="text-sm font-medium text-neutral-700"
              >
                Description
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                id="reportDescription"
                name="reportDescription"
                rows={4}
                required
                placeholder="Describe what was observed..."
                className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Risk Associated */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="riskAssociated"
                className="text-sm font-medium text-neutral-700"
              >
                Risk Associated
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                id="riskAssociated"
                name="riskAssociated"
                rows={4}
                required
                placeholder="What could happen because of this hazard?"
                className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Preventive Actions */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="preventiveAction"
                className="text-sm font-medium text-neutral-700"
              >
                Preventive Actions
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                id="preventiveAction"
                name="preventiveAction"
                rows={4}
                required
                placeholder="Suggested measures to prevent the hazard..."
                className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Action Taken */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="actionTaken"
                className="text-sm font-medium text-neutral-700"
              >
                Action Taken
                <span className="ml-1 text-neutral-400">(Optional)</span>
              </label>

              <textarea
                id="actionTaken"
                name="actionTaken"
                rows={4}
                placeholder="Describe any immediate action already taken..."
                className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            ACTION BUTTONS
        ========================================================= */}
        <div className="flex flex-col-reverse gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="h-10 rounded-lg border border-[#A6292F] px-6 text-sm font-medium text-[#A6292F] transition hover:bg-[#A6292F]/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 rounded-lg bg-[#A6292F] px-6 text-sm font-medium text-white shadow-sm transition hover:bg-[#8f2328] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Recording..." : "Record Hazard"}
          </button>
        </div>
      </form>

      {/* =========================================================
          LOADING MODAL
      ========================================================= */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-[#A6292F]" />

            <h2 className="text-lg font-semibold text-neutral-800">
              Saving Hazard Report
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Please wait while your report is being recorded.
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          SUCCESS MODAL
      ========================================================= */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl text-green-600">✓</span>
            </div>

            <h2 className="text-xl font-semibold text-neutral-800">
              Hazard Recorded
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Your hazard report has been successfully submitted.
            </p>

            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-6 h-10 w-full rounded-lg bg-[#A6292F] px-4 text-sm font-medium text-white transition hover:bg-[#8f2328]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardForm;
