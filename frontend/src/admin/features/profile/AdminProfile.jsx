import OshoLogo from "../../../assets/logo/OSHOLogo.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminProfile = () => {
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
      : user?.full_name || user?.fullName || "Administrator";

  // ============================================================
  // SAFE RESPONSE PARSER
  // ============================================================

  const parseResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      console.error("Invalid server response:", text);

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

      window.dispatchEvent(new Event("userUpdated"));

      setSuccess(data.message || "Profile updated successfully.");

      setTimeout(() => {
        setIsEditOpen(false);
        setSuccess("");
      }, 1000);
    } catch (error) {
      console.error("Admin profile update error:", error);

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
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#651317]">My Profile</h1>

        <p className="mt-1 text-sm font-medium text-[#8A7A6A]">
          Manage your administrator account information and security.
        </p>
      </div>

      {/* ====================================================== */}
      {/* PROFILE CARD */}
      {/* ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-[#E8E1DA] bg-white shadow-sm">
        {/* TOP PROFILE */}
        <div className="relative border-b border-[#EEE7E1] bg-gradient-to-r from-[#651317] to-[#8F2228] p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            {/* Logo */}
            <div className="rounded-2xl bg-white p-2 shadow-lg">
              <img
                src={OshoLogo}
                alt="OSHO Administrator"
                className="size-24 object-contain"
              />
            </div>

            {/* Admin Information */}
            <div className="flex-1 text-center sm:text-left">
              <p className="mb-1 text-xs font-bold tracking-[0.15em] text-[#F4B223] uppercase">
                OSHO Administrator
              </p>

              <h2 className="text-2xl font-bold text-white">{fullName}</h2>

              <p className="mt-1 text-sm text-white/70">
                {user?.email || "No email available"}
              </p>

              <span className="mt-3 inline-flex rounded-full bg-[#F4B223] px-3 py-1 text-xs font-bold text-[#4D0F13]">
                Administrator
              </span>
            </div>

            {/* Edit Button */}
            <button
              type="button"
              onClick={openEditProfile}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#651317] shadow-sm transition hover:bg-[#FFF7E3]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.7}
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 7.125 16.875 4.5"
                />
              </svg>
              Edit Profile
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* ACCOUNT INFORMATION */}
        {/* ==================================================== */}

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#340306]">
              Account Information
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Basic information associated with your administrator account.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Full Name */}
            <div className="rounded-xl border border-[#EEE7E1] bg-[#FAF9F6] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#A6292F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.93 17.93 0 0 1 12 21.75a17.93 17.93 0 0 1-7.5-1.632Z"
                  />
                </svg>

                <span className="text-xs font-bold tracking-wide uppercase">
                  Full Name
                </span>
              </div>

              <p className="font-semibold text-gray-800">{fullName}</p>
            </div>

            {/* Email */}
            <div className="rounded-xl border border-[#EEE7E1] bg-[#FAF9F6] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#A6292F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5A2.25 2.25 0 0 1 19.5 19.5h-15a2.25 2.25 0 0 1-2.25-2.25V6.75M21.75 6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-8.69 5.793a1.875 1.875 0 0 1-2.12 0L2.25 6.75"
                  />
                </svg>

                <span className="text-xs font-bold tracking-wide uppercase">
                  Email Address
                </span>
              </div>

              <p className="font-semibold break-all text-gray-800">
                {user?.email || "No email available"}
              </p>
            </div>

            {/* Role */}
            <div className="rounded-xl border border-[#EEE7E1] bg-[#FAF9F6] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#A6292F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m6-3.75c0 6.75-4.5 12-9 13.5C7.5 18 3 12.75 3 6V4.5L12 2.25l9 2.25V6Z"
                  />
                </svg>

                <span className="text-xs font-bold tracking-wide uppercase">
                  Account Role
                </span>
              </div>

              <p className="font-semibold text-gray-800">Administrator</p>
            </div>

            {/* User ID */}
            <div className="rounded-xl border border-[#EEE7E1] bg-[#FAF9F6] p-4">
              <div className="mb-2 flex items-center gap-2 text-[#A6292F]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 9h9m-9 3h9m-9 3h6m-8.25 6h13.5A2.25 2.25 0 0 0 21 18.75V5.25A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25v13.5A2.25 2.25 0 0 0 5.25 21Z"
                  />
                </svg>

                <span className="text-xs font-bold tracking-wide uppercase">
                  User ID
                </span>
              </div>

              <p className="font-mono text-xs font-medium break-all text-gray-600">
                {user?.user_id || user?.id || "Not available"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECURITY */}
        {/* ==================================================== */}

        <div className="border-t border-[#EEE7E1] p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-[#A6292F]/10 text-[#A6292F]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v6A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75v-6A2.25 2.25 0 0 1 6.75 10.5Z"
                    />
                  </svg>
                </div>

                <h3 className="text-lg font-bold text-[#340306]">
                  Account Security
                </h3>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Manage your administrator password and account access.
              </p>
            </div>

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
                className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0 1 19.5 12.75v6A2.25 2.25 0 0 1 17.25 21H6.75A2.25 2.25 0 0 1 4.5 18.75v-6A2.25 2.25 0 0 1 6.75 10.5Z"
                  />
                </svg>
                Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3H9m0 0 3-3m-3 3 3 3"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================== */}
      {/* EDIT PROFILE MODAL */}
      {/* ====================================================== */}

      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#340306]">
                  Edit Administrator Profile
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your personal account information.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => setIsEditOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProfile}>
              <div className="space-y-4 p-6">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="adminFirstName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    First Name
                  </label>

                  <input
                    id="adminFirstName"
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="adminLastName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Last Name
                  </label>

                  <input
                    id="adminLastName"
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="adminEmail"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="adminEmail"
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        email: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Role
                  </label>

                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-500"
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

              <div className="flex justify-end gap-3 border-t border-gray-200 bg-[#FAF9F6] px-6 py-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F2228] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ====================================================== */}

      {isPasswordOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#340306]">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter your current password before creating a new one.
                </p>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={() => setIsPasswordOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
              <div className="space-y-4 p-6">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="adminCurrentPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Current Password
                  </label>

                  <input
                    id="adminCurrentPassword"
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((previous) => ({
                        ...previous,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="adminNewPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    New Password
                  </label>

                  <input
                    id="adminNewPassword"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Minimum of 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="adminConfirmPassword"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="adminConfirmPassword"
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 transition outline-none focus:border-[#A6292F] focus:ring-2 focus:ring-red-100"
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

              <div className="flex justify-end gap-3 border-t border-gray-200 bg-[#FAF9F6] px-6 py-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsPasswordOpen(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-[#A6292F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8F2228] disabled:cursor-not-allowed disabled:opacity-50"
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

export default AdminProfile;
