import OshoLogo from "../../assets/logo/OSHOLogo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ADPageHeader = ({ title, description, setSideBarOpen }) => {
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // ============================================================
  // TEMPORARY NOTIFICATIONS
  // Replace this later with notifications from your database
  // ============================================================

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New Hazard Report",
      message:
        'A new hazard report "Exposed Electrical Wire" has been submitted.',
      time: "5 minutes ago",
      type: "hazard",
      read: false,
    },
    {
      id: 2,
      title: "New Incident Report",
      message: "A new workplace incident has been reported.",
      time: "20 minutes ago",
      type: "incident",
      read: false,
    },
    {
      id: 3,
      title: "Assessment Submitted",
      message: "A hazard assessment has been submitted for review.",
      time: "1 hour ago",
      type: "assessment",
      read: false,
    },
    {
      id: 4,
      title: "Report Resolved",
      message: "A previously reviewed hazard report has been resolved.",
      time: "Yesterday",
      type: "resolved",
      read: true,
    },
  ]);

  // ============================================================
  // USER
  // ============================================================

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
      : user?.full_name || user?.fullName || "Admin";

  // ============================================================
  // UNREAD COUNT
  // ============================================================

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // ============================================================
  // NOTIFICATION CLICK
  // ============================================================

  const handleNotificationClick = (notification) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id
          ? {
              ...item,
              read: true,
            }
          : item,
      ),
    );

    setIsNotificationOpen(false);

    // Navigate depending on notification type
    if (notification.type === "assessment") {
      navigate("/admin/assessments");
      return;
    }

    if (notification.type === "hazard") {
      // Change this route if you have a separate hazard reports page
      navigate("/admin/dashboard");
      return;
    }

    if (notification.type === "incident") {
      // Change this route if you have a separate incident reports page
      navigate("/admin/dashboard");
      return;
    }

    navigate("/admin/dashboard");
  };

  // ============================================================
  // MARK ALL AS READ
  // ============================================================

  const markAllAsRead = () => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  return (
    <>
      <header className="flex w-full items-center justify-between">
        {/* ====================================================== */}
        {/* LEFT SECTION */}
        {/* ====================================================== */}

        <div className="flex items-center gap-5">
          {/* Sidebar Button */}
          <button
            type="button"
            onClick={() => {
              setSideBarOpen((prev) => !prev);
            }}
            className="rounded-lg p-1 transition hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold text-[#A6292F]">{title}</h1>

            <p className="text-sm font-semibold text-[#8A7A6A]">
              {description}
            </p>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT SECTION */}
        {/* ====================================================== */}

        <div className="flex items-center gap-4">
          {/* ==================================================== */}
          {/* NOTIFICATION */}
          {/* ==================================================== */}

          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              aria-expanded={isNotificationOpen}
              onClick={() => {
                setIsNotificationOpen((previous) => !previous);
                setIsProfileOpen(false);
              }}
              className="relative rounded-full p-2 transition hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
              </svg>

              {/* Notification Count */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* ================================================== */}
            {/* NOTIFICATION DROPDOWN */}
            {/* ================================================== */}

            {isNotificationOpen && (
              <div className="absolute top-full right-0 z-50 mt-3 w-[380px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Notifications
                    </h2>

                    <p className="text-xs text-gray-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount > 1 ? "s" : ""
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-xs font-semibold text-[#A6292F] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`flex w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 ${
                          !notification.read ? "bg-red-50/50" : "bg-white"
                        }`}
                      >
                        {/* ICON */}
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                            notification.type === "resolved"
                              ? "bg-green-100 text-green-600"
                              : notification.type === "assessment"
                                ? "bg-blue-100 text-blue-600"
                                : notification.type === "incident"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-red-100 text-[#A6292F]"
                          }`}
                        >
                          {notification.type === "resolved" ? (
                            // Resolved
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m4.5 12.75 6 6 9-13.5"
                              />
                            </svg>
                          ) : notification.type === "assessment" ? (
                            // Assessment
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                              />
                            </svg>
                          ) : notification.type === "incident" ? (
                            // Incident
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m0 3.75h.007v.008H12v-.008ZM10.34 3.94 1.82 18.25A1.5 1.5 0 0 0 3.11 20.5h17.78a1.5 1.5 0 0 0 1.29-2.25L13.66 3.94a1.5 1.5 0 0 0-3.32 0Z"
                              />
                            </svg>
                          ) : (
                            // Hazard
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                              stroke="currentColor"
                              className="size-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p
                              className={`text-sm ${
                                !notification.read
                                  ? "font-bold text-gray-900"
                                  : "font-semibold text-gray-700"
                              }`}
                            >
                              {notification.title}
                            </p>

                            {!notification.read && (
                              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#A6292F]" />
                            )}
                          </div>

                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-xs font-medium text-gray-400">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    // No Notifications
                    <div className="px-5 py-12 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022"
                          />
                        </svg>
                      </div>

                      <p className="font-semibold text-gray-700">
                        No notifications
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        New reports and assessments will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* PROFILE */}
          {/* ==================================================== */}

          <div className="relative">
            <button
              type="button"
              aria-label="Account menu"
              aria-expanded={isProfileOpen}
              onClick={() => {
                setIsProfileOpen((previous) => !previous);
                setIsNotificationOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-gray-100"
            >
              {/* Logo */}
              <img
                src={OshoLogo}
                alt="OSHO Admin"
                className="size-12 rounded-full object-cover"
              />

              {/* Admin Information */}
              <div className="hidden text-left lg:block">
                <p className="font-bold text-[#A6292F]">{fullName}</p>

                <p className="text-sm font-semibold text-[#8A7A6A]">
                  Administrator
                </p>
              </div>

              {/* Arrow */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`size-4 transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* ================================================== */}
            {/* PROFILE DROPDOWN */}
            {/* ================================================== */}

            {isProfileOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                {/* User Information */}
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="font-semibold text-gray-900">{fullName}</p>

                  <p className="truncate text-sm text-gray-500">
                    {user?.email || "Administrator"}
                  </p>

                  <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#A6292F]">
                    Administrator
                  </span>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);

                    // Add this route when you create admin profile
                    navigate("/admin/my-profile");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                >
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
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                  My Profile
                </button>

                {/* Assessments */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/admin/assessments");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-100"
                >
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
                      d="M9 12.75 11.25 15 15 9.75m3-3.75H6A2.25 2.25 0 0 0 3.75 8.25v10.5A2.25 2.25 0 0 0 6 21h12a2.25 2.25 0 0 0 2.25-2.25V8.25A2.25 2.25 0 0 0 18 6Z"
                    />
                  </svg>
                  Assessments
                </button>

                {/* Logout */}
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
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
                        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3H9m0 0 3-3m-3 3 3 3"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default ADPageHeader;
