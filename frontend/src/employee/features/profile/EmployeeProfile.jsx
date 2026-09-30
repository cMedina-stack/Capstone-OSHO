import OshoLogo from "../../../assets/logo/OSHOLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeProfile = () => {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
      : user?.full_name || user?.fullName || "Employee";

  // ============================================================
  // SAFE SERVER RESPONSE
  // ============================================================

  const parseResponse = async (response) => {
    const text = await response.text();

    console.log("HTTP Status:", response.status);
    console.log("Server Response:", text);

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(
        "Server returned an invalid response. Check your backend route.",
      );
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // ============================================================
  // OPEN EDIT PROFILE
  // ============================================================

  const openEditProfile = () => {
    setError("");
    setSuccess("");

    setEditForm({
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
    });

    setIsEditOpen(true);
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleEditProfile = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          email: editForm.email.trim().toLowerCase(),
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to update profile.",
        );
      }

      const updatedUser = {
        ...user,
        ...data.user,
      };

      setUser(updatedUser);

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess(data.message || "Profile updated successfully.");

      setTimeout(() => {
        setIsEditOpen(false);
        setSuccess("");
      }, 1000);
    } catch (error) {
      console.error("Profile update error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setError("Please complete all password fields.");
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }

      if (passwordForm.currentPassword === passwordForm.newPassword) {
        setError("New password must be different from your current password.");
        return;
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const response = await fetch("/api/auth/change-password", {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to change password.",
        );
      }

      setSuccess(data.message || "Password changed successfully.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setIsPasswordOpen(false);
        setSuccess("");
      }, 1000);
    } catch (error) {
      console.error("Password error:", error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F6F2] p-6">
      <div className="w-full">
        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#A6292F]">My Profile</h1>

          <p className="mt-1 text-sm font-medium text-[#8A7A6A]">
            View and manage your account information.
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* TOP */}
          <div className="flex flex-col items-center gap-4 border-b border-gray-200 p-6 sm:flex-row">
            <img
              src={OshoLogo}
              alt="Profile"
              className="size-24 rounded-full border-4 border-red-100 object-cover"
            />

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>

              <p className="mt-1 text-sm text-gray-500">{user?.email}</p>

              <span className="mt-3 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#A6292F] capitalize">
                {user?.role || "employee"}
              </span>
            </div>

            <button
              type="button"
              onClick={openEditProfile}
              className="rounded-lg bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8f2228]"
            >
              Edit Profile
            </button>
          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="p-6">
            <h3 className="mb-5 text-lg font-bold text-gray-900">
              Account Information
            </h3>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Full Name
                </p>

                <p className="font-medium text-gray-800">{fullName}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Email Address
                </p>

                <p className="font-medium text-gray-800">
                  {user?.email || "No email available"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Role
                </p>

                <p className="font-medium text-gray-800 capitalize">
                  {user?.role || "Employee"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  User ID
                </p>

                <p className="font-mono text-sm break-all text-gray-600">
                  {user?.user_id || user?.id || "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="mb-1 text-lg font-bold text-gray-900">Security</h3>

            <p className="mb-5 text-sm text-gray-500">
              Manage your password and account access.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccess("");

                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });

                  setIsPasswordOpen(true);
                }}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* EDIT PROFILE MODAL */}
      {/* ===================================================== */}

      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Update your personal information.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProfile}>
              <div className="space-y-4 p-6">
                {/* FIRST NAME */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    First Name
                  </label>

                  <input
                    id="firstName"
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* LAST NAME */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Last Name
                  </label>

                  <input
                    id="lastName"
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        email: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* ROLE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Role
                  </label>

                  <input
                    type="text"
                    value={user?.role || "employee"}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500 capitalize"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {success}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8f2228] disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ===================================================== */}

      {isPasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="text-sm text-gray-500">
                  Enter your current password before setting a new one.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => setIsPasswordOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4 p-6">
                {/* CURRENT PASSWORD */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Minimum of 8 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    {success}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsPasswordOpen(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8f2228] disabled:opacity-50"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
