import { apiFetch } from "../../../../shared/api";
import { useEffect, useState } from "react";

const AccidentForm = () => {
  const [buildings, setBuildings] = useState([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await apiFetch("/api/buildings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await response.text();

        let data = [];

        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error("Invalid buildings response:", text);
            throw new Error("Invalid response received from server.", { cause: parseError });
          }
        }

        if (!response.ok) {
          throw new Error(
            data.error ||
              data.message ||
              `Failed to fetch buildings. Server returned ${response.status}.`,
          );
        }

        // Support both:
        // [ ... ]
        // and
        // { buildings: [ ... ] }
        const buildingList = Array.isArray(data) ? data : data.buildings || [];

        setBuildings(buildingList);
      } catch (error) {
        console.error("Error loading buildings:", error);
        setError(error.message || "Unable to load buildings.");
      } finally {
        setLoadingBuildings(false);
      }
    };

    fetchBuildings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const form = e.currentTarget;

      // =========================================================
      // GET WORKPLACE ROLES
      // =========================================================
      const workplaceRole = Array.from(
        form.querySelectorAll('input[name="workplaceRole"]:checked'),
      ).map((input) => input.value);

      // =========================================================
      // GET INCIDENT TYPES
      // =========================================================
      const typeIncident = Array.from(
        form.querySelectorAll('input[name="typeIncident"]:checked'),
      ).map((input) => input.value);

      // =========================================================
      // GET INCIDENT NATURES
      // =========================================================
      const natureIncident = Array.from(
        form.querySelectorAll('input[name="natureIncident"]:checked'),
      ).map((input) => input.value);

      // =========================================================
      // BUILD FORM DATA
      // =========================================================
      const formData = {
        // Person involved
        name: form.elements.name.value.trim(),
        age: Number(form.elements.age.value),
        sex: form.elements.sex.value,
        contactNumber: form.elements.contactNumber.value.trim(),

        // Workplace role
        workplaceRole,

        // Witness
        witnessName: form.elements.witnessName.value.trim(),
        witnessDesignation: form.elements.witnessDesignation.value.trim(),
        witnessContactNumber: form.elements.witnessContactNumber.value.trim(),

        // Incident classification
        typeIncident,
        typeIncidentOthers: form.elements.typeIncidentOthers.value.trim(),

        natureIncident,
        natureIncidentOthers: form.elements.natureIncidentOthers.value.trim(),

        // Location
        reportDate: form.elements.reportDate.value,
        buildingId: form.elements.building.value,
        exactLocation: form.elements.exactLocation.value.trim(),

        // Details
        description: form.elements.description.value.trim(),
        injuryDetails: form.elements.injuryDetails.value.trim(),
        actionTaken: form.elements.actionTaken.value.trim(),
      };

      // =========================================================
      // DEBUG
      // =========================================================





      // =========================================================
      // VALIDATION
      // =========================================================
      if (!formData.name) {
        throw new Error("Please enter the name of the person involved.");
      }

      if (!formData.age || formData.age < 1 || formData.age > 120) {
        throw new Error("Please enter a valid age.");
      }

      if (!formData.sex) {
        throw new Error("Please select a sex.");
      }

      if (workplaceRole.length === 0) {
        throw new Error("Please select at least one workplace role.");
      }

      if (typeIncident.length === 0) {
        throw new Error("Please select at least one type of incident.");
      }

      if (natureIncident.length === 0) {
        throw new Error("Please select at least one nature of incident.");
      }

      if (!formData.reportDate) {
        throw new Error("Please select the date reported.");
      }

      if (!formData.buildingId) {
        throw new Error("Please select a building.");
      }

      if (!formData.exactLocation) {
        throw new Error("Please enter the exact location.");
      }

      if (!formData.description) {
        throw new Error("Please provide a description of the incident.");
      }

      // =========================================================
      // SEND INCIDENT TO BACKEND
      // =========================================================


      const response = await apiFetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });


      // =========================================================
      // SAFELY READ RESPONSE
      // =========================================================
      const text = await response.text();


      let data = {};

      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("Response was not valid JSON:", parseError);
        }
      }

      // =========================================================
      // HANDLE SERVER ERROR
      // =========================================================
      if (!response.ok) {
        throw new Error(
          data.error || data.message || `Server returned ${response.status}`,
        );
      }

      // =========================================================
      // SUCCESS
      // =========================================================


      // Reset the form
      form.reset();

      // Show success popup
      setShowSuccess(true);
    } catch (error) {
      console.error("Incident submission error:", error);

      setError(error.message || "Failed to submit incident. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-auto">
      {/* =========================================================
          ERROR MESSAGE
      ========================================================= */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================================================
          FORM
      ========================================================= */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* =======================================================
            SECTION 1 — INCIDENT INFORMATION
        ======================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Incident Information
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Provide information about the person involved in the incident.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-12">
            {/* Name */}
            <div className="flex flex-col gap-1 lg:col-span-4">
              <label
                htmlFor="name"
                className="text-sm font-medium text-neutral-700"
              >
                Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter full name"
                required
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-1 lg:col-span-2">
              <label
                htmlFor="age"
                className="text-sm font-medium text-neutral-700"
              >
                Age
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="number"
                name="age"
                id="age"
                min="1"
                max="120"
                placeholder="Age"
                required
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Sex */}
            <div className="flex flex-col gap-1 lg:col-span-2">
              <label
                htmlFor="sex"
                className="text-sm font-medium text-neutral-700"
              >
                Sex
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                name="sex"
                id="sex"
                defaultValue=""
                required
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              >
                <option value="" disabled>
                  Select Sex
                </option>

                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Contact Number */}
            <div className="flex flex-col gap-1 lg:col-span-4">
              <label
                htmlFor="contactNumber"
                className="text-sm font-medium text-neutral-700"
              >
                Contact Number
              </label>

              <input
                type="tel"
                name="contactNumber"
                id="contactNumber"
                placeholder="Contact number"
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Workplace Role */}
            <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-12">
              <label className="text-sm font-medium text-neutral-700">
                Workplace Role
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Staff", "Student", "Contractor", "Visitor"].map((role) => (
                  <label
                    key={role}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      name="workplaceRole"
                      value={role}
                      className="h-4 w-4 accent-[#A6292F]"
                    />

                    <span className="text-neutral-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 2 — WITNESS INFORMATION
        ======================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Witness Information
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Provide the details of anyone who witnessed the incident.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            {/* Witness Name */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="witnessName"
                className="text-sm font-medium text-neutral-700"
              >
                Witness Name
                <span className="ml-1 text-neutral-400">(Optional)</span>
              </label>

              <input
                type="text"
                name="witnessName"
                id="witnessName"
                placeholder="Enter full name"
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Relationship / Designation */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="witnessDesignation"
                className="text-sm font-medium text-neutral-700"
              >
                Relationship / Designation
                <span className="ml-1 text-neutral-400">(Optional)</span>
              </label>

              <input
                type="text"
                name="witnessDesignation"
                id="witnessDesignation"
                placeholder="e.g. Co-worker, Student, Supervisor"
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Witness Contact Number */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="witnessContactNumber"
                className="text-sm font-medium text-neutral-700"
              >
                Contact Number
                <span className="ml-1 text-neutral-400">(Optional)</span>
              </label>

              <input
                type="tel"
                name="witnessContactNumber"
                id="witnessContactNumber"
                placeholder="Contact number"
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 3 — INCIDENT CLASSIFICATION
        ======================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Incident Classification
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Identify the type and nature of the incident.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
            {/* TYPE OF INCIDENT */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">
                Type of Incident
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Injury / Illness",
                    value: "injury",
                  },
                  {
                    label: "Near Hit / Miss",
                    value: "near-hit",
                  },
                  {
                    label: "Fire / Explosion",
                    value: "fire",
                  },
                  {
                    label: "Property Damage",
                    value: "property-damage",
                  },
                  {
                    label: "Vehicle Event",
                    value: "vehicle-event",
                  },
                  {
                    label: "Environment Event",
                    value: "environment-event",
                  },
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      name="typeIncident"
                      value={type.value}
                      className="h-4 w-4 accent-[#A6292F]"
                    />

                    <span className="text-neutral-700">{type.label}</span>
                  </label>
                ))}

                {/* Others */}
                <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    name="typeIncident"
                    value="others"
                    className="h-4 w-4 shrink-0 accent-[#A6292F]"
                  />

                  <span className="shrink-0">Others:</span>

                  <input
                    type="text"
                    name="typeIncidentOthers"
                    placeholder="Please specify"
                    className="min-w-0 flex-1 border-b border-neutral-300 bg-transparent px-1 py-0.5 text-sm outline-none focus:border-[#A6292F]"
                  />
                </label>
              </div>
            </div>

            {/* NATURE OF INCIDENT */}
            <div>
              <label className="mb-3 block text-sm font-medium text-neutral-700">
                Nature of Incident
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  {
                    label: "Physical Injury",
                    value: "physical-injury",
                  },
                  {
                    label: "Violence",
                    value: "violence",
                  },
                  {
                    label: "Falls, Slips, Tripping",
                    value: "falls-slips-tripping",
                  },
                  {
                    label: "Chemical Exposure",
                    value: "chemical-exposure",
                  },
                  {
                    label: "Damage to Property",
                    value: "property-damage",
                  },
                  {
                    label: "Medical Emergency",
                    value: "medical-emergency",
                  },
                ].map((type) => (
                  <label
                    key={type.value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm transition hover:bg-neutral-50"
                  >
                    <input
                      type="checkbox"
                      name="natureIncident"
                      value={type.value}
                      className="h-4 w-4 accent-[#A6292F]"
                    />

                    <span className="text-neutral-700">{type.label}</span>
                  </label>
                ))}

                {/* Others */}
                <label className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    name="natureIncident"
                    value="others"
                    className="h-4 w-4 shrink-0 accent-[#A6292F]"
                  />

                  <span className="shrink-0">Others:</span>

                  <input
                    type="text"
                    name="natureIncidentOthers"
                    placeholder="Please specify"
                    className="min-w-0 flex-1 border-b border-neutral-300 bg-transparent px-1 py-0.5 text-sm outline-none focus:border-[#A6292F]"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 4 — INCIDENT LOCATION
        ======================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Incident Location
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Specify when and where the incident occurred.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
            {/* Date */}
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
                name="reportDate"
                id="reportDate"
                required
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
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
                name="building"
                id="building"
                required
                disabled={loadingBuildings}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F] disabled:bg-neutral-100"
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
                name="exactLocation"
                id="exactLocation"
                placeholder="Room, hallway, laboratory..."
                required
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION 5 — INCIDENT DETAILS
        ======================================================= */}
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="text-base font-semibold text-neutral-800">
              Incident Details
            </h2>

            <p className="mt-0.5 text-xs text-neutral-500">
              Describe what happened, any resulting injury, and the actions
              taken.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5">
            {/* Description */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="description"
                className="text-sm font-medium text-neutral-700"
              >
                Description of the Incident
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                name="description"
                id="description"
                rows={4}
                required
                placeholder="Describe what happened, including the events leading up to the incident..."
                className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>

            {/* Injury Details */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="injuryDetails"
                className="text-sm font-medium text-neutral-700"
              >
                Details of Injury
                <span className="ml-1 text-neutral-400">(Optional)</span>
              </label>

              <textarea
                name="injuryDetails"
                id="injuryDetails"
                rows={4}
                placeholder="Describe the injury, affected body part, symptoms, or other resulting harm..."
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
                name="actionTaken"
                id="actionTaken"
                rows={4}
                placeholder="Describe the immediate action taken, first aid, medical assistance, isolation of the area, notification, or other response..."
                className="resize-y rounded-lg border border-neutral-300 px-3 py-2 text-sm transition outline-none focus:border-[#A6292F] focus:ring-1 focus:ring-[#A6292F]"
              />
            </div>
          </div>
        </section>

        {/* =======================================================
            ACTION BUTTONS
        ======================================================= */}
        <div className="flex flex-col-reverse gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="h-10 w-full rounded-lg border border-[#A6292F] px-6 text-sm font-medium text-[#A6292F] transition hover:bg-[#A6292F]/5 sm:w-40"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg bg-[#A6292F] px-6 text-sm font-medium text-white shadow-sm transition hover:bg-[#8f2328] disabled:cursor-not-allowed disabled:opacity-60 sm:w-40"
          >
            {isSubmitting ? "Recording..." : "Record Incident"}
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
              Saving Incident Report
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Please wait while your incident is being recorded.
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
              Incident Recorded
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              The incident report has been successfully submitted.
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

export default AccidentForm;
