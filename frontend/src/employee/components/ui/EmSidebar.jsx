import OSHOLogo from ",,/../../src/assets/logo/OSHOLogo.png";
import { NavLink } from "react-router-dom";

export default function EMSidebar({ sideBarOpen }) {
  const style = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg p-1 pb-3 pt-3 transition-colors font-medium pl-3   ${
      isActive
        ? "bg-[#F4B223] text-[#4D0F13]  pl-3 font-semibold  "
        : "hover:bg-[#651317]"
    }`;

  return (
    <>
      <section
        className={`z-100 flex flex-col items-center justify-between overflow-auto bg-[#4D0F13] p-3 pt-5 pb-5 transition-all duration-300 ${sideBarOpen ? "absolute w-auto xl:static" : "hidden"}`}
      >
        <div className="mb-10 flex w-full flex-col gap-5 pt-0 text-[#FFFFFF]">
          <div className="flex flex-col gap-10">
            <header className="flex w-full flex-col items-center justify-center gap-2">
              <img className="h-20 w-20" src={OSHOLogo} alt="OSHO Logo" />
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-red-600 uppercase">
                  osho
                </h1>
                <p className="font-semibold text-white">
                  Occupational Safety and Health Office
                </p>
              </div>
            </header>
          </div>
          <div className="flex flex-col gap-4">
            <section>
              <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.15em] text-[#BFA99A] uppercase">
                Main
              </p>

              <NavLink
                to="/employee/dashboard"
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
                Recording
              </p>

              <div className="space-y-1.5">
                {/* Record Hazard */}
                <NavLink
                  to="/employee/record-hazard"
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
                      {/* Hazard Icon */}
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
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>

                      <span>Record Hazard</span>
                    </>
                  )}
                </NavLink>

                {/* Record Incident */}
                <NavLink
                  to="/employee/record-incident"
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
                      {/* Incident Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.7}
                        stroke="currentColor"
                        className={`size-6 shrink-0 ${
                          isActive
                            ? "text-[#4D0F13]"
                            : "text-red-300 group-hover:text-red-200"
                        }`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6m0 4.5h.008v.008H12V16.5Zm8.25-4.5A8.25 8.25 0 1 1 3.75 12a8.25 8.25 0 0 1 16.5 0Z"
                        />
                      </svg>

                      <span>Record Incident</span>
                    </>
                  )}
                </NavLink>
              </div>
            </section>
            <section>
              <p className="mb-2 px-3 text-[11px] font-bold tracking-[0.15em] text-[#BFA99A] uppercase">
                Campus Safety
              </p>

              <div className="space-y-1.5">
                {/* My Reports */}
                <NavLink
                  to="/employee/my-reports"
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
                      {/* Reports Icon */}
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
                          d="M9 12.75 11.25 15 15 9.75M6.75 3.75h10.5A2.25 2.25 0 0 1 19.5 6v12A2.25 2.25 0 0 1 17.25 20.25H6.75A2.25 2.25 0 0 1 4.5 18V6a2.25 2.25 0 0 1 2.25-2.25Z"
                        />
                      </svg>

                      <span>My Reports</span>
                    </>
                  )}
                </NavLink>

                {/* My Profile */}
                <NavLink
                  to="/employee/my-profile"
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
                      {/* Profile Icon */}
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
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0A17.93 17.93 0 0 1 12 21.75a17.93 17.93 0 0 1-7.5-1.632Z"
                        />
                      </svg>

                      <span>My Profile</span>
                    </>
                  )}
                </NavLink>
              </div>
            </section>
          </div>
        </div>
        <footer className="rounded-lg border-2 border-[#F4B223] p-5 text-white">
          <h1 className="text-lg font-semibold">OSHO Department</h1>
          <span className="text-sn">We ensure a safe and healthy campus</span>
        </footer>
      </section>
    </>
  );
}
