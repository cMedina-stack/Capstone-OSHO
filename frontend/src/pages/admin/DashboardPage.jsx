import RiskLevelDistribution from "../../admin/features/dashboard/components/RiskLevelDistribution";
import RecordCategories from "../../admin/features/dashboard/components/RecordCategory";
import { useState } from "react";

import ADSidebar from "../../admin/components/ADSidebar";
import ADPageHeader from "../../admin/components/ADPageHeader";
import AdminInteractiveMap from "../../admin/features/map/AdminInteractiveMap";
import QuickReviews from "../../admin/features/dashboard/components/QuickReviews";
import ReportsOverview from "../../admin/features/dashboard/components/ReportOverview";
import ReportsByBuilding from "../../admin/features/dashboard/components/ReportsByBuilding";

export default function DashboardPage() {
  const [sideBarOpen, setSideBarOpen] = useState(
    () => window.innerWidth >= 1024,
  );

  return (
    <>
      <div>
        <div className="relative flex w-full items-center bg-[#8B1E23]">
          <div className="flex h-full w-full">
            <ADSidebar sideBarOpen={sideBarOpen} />
            <section
              className={`relative mt-5 mb-5 flex w-full flex-col gap-5 bg-[#F8F6F2] p-5 ${sideBarOpen ? "rounded-r-3xl" : "rounded-3xl"}`}
            >
              <ADPageHeader
                title={"Dashboard"}
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
                description={
                  "Monitor and manage hazards and accidents across the campus"
                }
              />
              <QuickReviews />
              <div className="flex w-full flex-col gap-5 xl:flex-row">
                <section className="relative flex w-full min-w-0 flex-col gap-5 xl:w-[65%]">
                  <AdminInteractiveMap />
                </section>
                <section className="relative w-full min-w-0 overflow-hidden shadow-lg xl:w-[35%]">
                  <ReportsOverview />
                </section>
              </div>
              <div>
                <ReportsByBuilding />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
