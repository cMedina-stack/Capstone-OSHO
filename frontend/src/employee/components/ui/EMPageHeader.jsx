import OshoLogo from "../../../assets/logo/OSHOLogo.png";
import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";

const EMPageHeader = ({ title, description, setSideBarOpen }) => {
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Hazard report under review",
      message:
        'Your report "Exposed Electrical Wire" is now under review by OSHO.',
      time: "5 minutes ago",
      type: "hazard",
      read: false,
    },
    {
      id: 2,
      title: "Assessment completed",
      message: "An assessment has been completed for your hazard report.",
      time: "1 hour ago",
      type: "assessment",
      read: false,
    },
    {
      id: 3,
      title: "Report resolved",
      message: 'Your report "Wet Floor Near Entrance" has been resolved.',
      time: "Yesterday",
      type: "resolved",
      read: true,
    },
  ]);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const handleNotificationClick = (notification) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );

    setIsNotificationOpen(false);

    navigate("/employee/my-reports");
  };

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
      <div className="flex w-full justify-between">
        {/* Left section */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setSideBarOpen((previous) => !previous)}
            className="absolute right-0 xl:static"
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

          <div>
            <h1 className="text-xl font-bold text-[#A6292F]">{title}</h1>

            <p className="text-sm font-semibold text-[#8A7A6A]">
              {description}
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="hidden items-center gap-5 md:flex">
          {/* Notification */}
          <div className="relative">
            <button
              type="button"
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

              {/* Notification count */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
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

                {/* Notification list */}
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
                        {/* Icon */}
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                            notification.type === "resolved"
                              ? "bg-green-100 text-green-600"
                              : notification.type === "assessment"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-red-100 text-[#A6292F]"
                          }`}
                        >
                          {notification.type === "resolved" ? (
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
                          ) : (
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

                        {/* Content */}
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
                        New updates will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsProfileOpen((previous) => !previous);
                setIsNotificationOpen(false);
              }}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100"
            >
              <img
                className="size-12 rounded-full object-cover"
                src={OshoLogo}
                alt="Employee profile"
              />

              <div className="text-left">
                <p className="font-bold text-[#A6292F]">
                  {user?.first_name
                    ? `${user.first_name} ${user?.last_name || ""}`
                    : user?.full_name || "Employee"}
                </p>

                <p className="text-sm font-semibold text-[#8A7A6A] capitalize">
                  {user?.role || "employee"}
                </p>
              </div>

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

            {/* Profile menu */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="font-semibold text-gray-900">
                    {user?.first_name
                      ? `${user.first_name} ${user?.last_name || ""}`
                      : user?.fullName || user?.full_name || "Employee"}
                  </p>

                  <p className="truncate text-sm text-gray-500">
                    {user?.email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/employee/my-profile");
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                >
                  My Profile
                </button>

                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EMPageHeader;
