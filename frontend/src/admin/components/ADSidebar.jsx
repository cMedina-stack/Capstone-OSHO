import { NavLink } from "react-router-dom";
import OSHOLogo from "../../assets/logo/OSHOLogo.png";

export default function ADSidebar({ sideBarOpen }) {
  const dashBoardClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg p-1 pb-3 pt-3 transition-colors  ${
      isActive
        ? "bg-[#F4B223] text-[#4D0F13]  pl-3 font-semibold  "
        : "hover:bg-[#651317]"
    }`;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg p-1 pb-3 pt-3 pb-2 pl-3 transition-colors ${
      isActive
        ? "bg-[#651317] text-white font-semibold mb-1 "
        : "hover:bg-[#7a2428]"
    }`;

  return (
    <>
      <div
        className={`relative flex flex-col items-center justify-between overflow-auto bg-[#4D0F13] p-3 pt-5 pb-5 transition-all duration-300 ${sideBarOpen ? "w-auto" : "hidden"}`}
      >
        <div className="mb-10 flex w-full flex-col gap-5 pt-0 text-[#FFFFFF]">
          <div className="flex flex-col gap-10">
            <header className="flex w-full flex-col items-center justify-center gap-2">
              <img className="h-20 w-20" src={OSHOLogo} alt="OSHO Logo" />
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-red-600 uppercase">
                  osho
                </h1>
                <h3 className="text-lg font-semibold text-white uppercase">
                  admin dashboard
                </h3>
                <p className="text-sm text-neutral-500">
                  Occupational Safety and Health Office
                </p>
              </div>
            </header>
          </div>
          <section>
            <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.15em] text-[#BFA99A] uppercase">
              Main
            </p>

            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#F4B223] text-[#4D0F13] shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Dashboard Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.7}
                    stroke="currentColor"
                    className={`size-6 shrink-0 ${
                      isActive
                        ? "text-[#4D0F13]"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 3.75h6v6h-6v-6Zm10.5 0h6v6h-6v-6Zm-10.5 10.5h6v6h-6v-6Zm10.5 0h6v6h-6v-6Z"
                    />
                  </svg>

                  <span>Dashboard</span>
                </>
              )}
            </NavLink>
          </section>
          <section>
            <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.15em] text-[#BFA99A] uppercase">
              Safety Management
            </p>

            <NavLink
              to="/admin/assessments"
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#F4B223] text-[#4D0F13] shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Dashboard Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>

                  <span> Reports &amp; Assessments</span>
                </>
              )}
            </NavLink>
            <section>
              <NavLink
                to="/admin/safety-map"
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#F4B223] text-[#4D0F13] shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Dashboard Icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                      />
                    </svg>

                    <span> Safety Map</span>
                  </>
                )}
              </NavLink>
            </section>
          </section>
          <section>
            <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.15em] text-[#BFA99A] uppercase">
              Administration
            </p>

            <NavLink
              to="/admin/add-users"
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#F4B223] text-[#4D0F13] shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Dashboard Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                    />
                  </svg>

                  <span>Users</span>
                </>
              )}
            </NavLink>
          </section>
        </div>
        <footer className="rounded-lg border-2 border-[#F4B223] p-5 text-white">
          <h1 className="text-lg font-semibold">OSHO Department</h1>
          <span className="text-sn">We ensure a safe and healthy campus</span>
        </footer>
      </div>
    </>
  );
}
