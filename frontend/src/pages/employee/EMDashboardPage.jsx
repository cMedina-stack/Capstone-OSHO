import EMPageHeader from "../../employee/components/ui/EMPageHeader";
import EMSidebar from "../../employee/components/ui/EmSidebar";
import { useState } from "react";
import CampusSafetyAlert from "../../employee/features/dashboard/CampusSafetyAlert";
import EmployeeMap from "../../employee/features/map/Map";
import RecentReport from "../../employee/features/dashboard/RecentReports";
import SafetyReminder from "../../employee/features/dashboard/SafetyReminder";

export default function EMDashboardPage() {
  const [sideBarOpen, setSideBarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  return (
    <>
      <div>
        <div className="relative flex h-full w-full items-center bg-[#8B1E23]">
          <div className="flex h-full w-full">
            <EMSidebar sideBarOpen={sideBarOpen} />
            <section
              className={`relative mt-5 mb-5 flex w-full flex-col gap-5 bg-[#F8F6F2] p-5 ${sideBarOpen ? "rounded-r-3xl" : "rounded-3xl"}`}
            >
              <EMPageHeader
                title={"Dashboard"}
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
                description={
                  "Monitor and manage hazards and accidents across the campus"
                }
              />
              {/* <ReportSummaryCards9 /> */}
              <div className="flex w-full flex-col gap-5 xl:flex-row">
                <section className="relative flex w-full min-w-0 flex-col gap-5 xl:w-[65%]">
                  <EmployeeMap />
                  <RecentReport />
                </section>
                <section className="flex w-full min-w-0 flex-col gap-5 xl:w-[35%]">
                  <CampusSafetyAlert />
                  <SafetyReminder />
                </section>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
