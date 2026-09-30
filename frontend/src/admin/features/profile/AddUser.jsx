import { useState } from "react";

const AddUser = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "employee",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ==========================================================
  // RESET
  // ==========================================================

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      role: "employee",
      password: "",
      confirmPassword: "",
    });
  };

  // ==========================================================
  // CREATE ACCOUNT
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      // ------------------------------------------------------
      // Validation
      // ------------------------------------------------------

      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.email.trim() ||
        !form.password ||
        !form.confirmPassword
      ) {
        setError("Please complete all required fields.");

        return;
      }

      if (form.password.length < 8) {
        setError("Password must contain at least 8 characters.");

        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");

        return;
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch("/api/admin/users", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          firstName: form.firstName.trim(),

          lastName: form.lastName.trim(),

          email: form.email.trim().toLowerCase(),

          role: form.role,

          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to create account.",
        );
      }

      setSuccess(data.message || "Account created successfully.");

      resetForm();
    } catch (error) {
      console.error("Create account error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F2] p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="w-full overflow-hidden rounded-2xl border border-[#E8E1DA] bg-white shadow-sm">
          {/* Card Header */}

          <div className="border-b border-[#EEE7E1] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#A6292F]/10 text-[#A6292F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 7.5v3m1.5-1.5h-3M15 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5.25 20.25a6.75 6.75 0 0 1 13.5 0"
                  />
                </svg>
              </div>

              <div>
                <h2 className="font-bold text-[#340306]">Create New Account</h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter the user's account information below.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-6">
              {/* Personal Information */}

              <div>
                <h3 className="mb-4 text-sm font-bold text-[#651317]">
                  Personal Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* First Name */}

                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      First Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Last Name */}

                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Last Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}

              <div className="border-t border-[#EEE7E1] pt-6">
                <h3 className="mb-4 text-sm font-bold text-[#651317]">
                  Account Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email Address
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 disabled:bg-gray-100"
                    />
                  </div>

                  {/* Role */}

                  <div>
                    <label
                      htmlFor="role"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Account Role
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <select
                      id="role"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 disabled:bg-gray-100"
                    >
                      <option value="employee">Employee</option>

                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security */}

              <div className="border-t border-[#EEE7E1] pt-6">
                <h3 className="mb-4 text-sm font-bold text-[#651317]">
                  Account Security
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  {/* Password */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        disabled={loading}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 disabled:bg-gray-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#A6292F]"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      Password must contain at least 8 characters.
                    </p>
                  </div>

                  {/* Confirm */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Confirm Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      disabled={loading}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-[#A6292F]/10 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Error */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  <span>⚠</span>

                  <span>{error}</span>
                </div>
              )}

              {/* Success */}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                  <span>✓</span>

                  <span>{success}</span>
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t border-[#EEE7E1] bg-[#FAF9F6] px-6 py-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-white disabled:opacity-50"
              >
                Clear
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F2228] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </form>
        </div>

        {/* ================================================== */}
        {/* INFORMATION CARD */}
        {/* ================================================== */}

        <aside className="h-fit rounded-2xl border border-[#E8E1DA] bg-white p-5 shadow-sm">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-[#F4B223]/15 text-[#8B6412]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9h.01M11.25 12h.75v4.5h.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>

          <h3 className="font-bold text-[#340306]">Account Access</h3>

          <p className="mt-2 text-sm leading-relaxed text-[#78685C]">
            Only create accounts for authorized personnel who need access to the
            OSHO system.
          </p>

          <div className="mt-5 space-y-4">
            <RoleInfo
              title="Employee"
              description="Can record hazards and incidents, view personal reports, and participate in assessments."
            />

            <RoleInfo
              title="Administrator"
              description="Can manage reports, assessments, campus safety information, and user accounts."
            />
          </div>

          <div className="mt-5 rounded-xl bg-[#F8F6F2] p-4">
            <p className="text-xs font-semibold text-[#651317]">
              Password Requirement
            </p>

            <p className="mt-1 text-xs leading-relaxed text-[#8A7A6A]">
              Accounts must use a password with at least 8 characters.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const RoleInfo = ({ title, description }) => {
  return (
    <div className="border-l-2 border-[#F4B223] pl-3">
      <p className="text-sm font-bold text-[#651317]">{title}</p>

      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        {description}
      </p>
    </div>
  );
};

export default AddUser;
