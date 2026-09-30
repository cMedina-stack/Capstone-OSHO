import { useState } from "react";
import ADSidebar from "../../admin/components/ADSidebar";
import ADPageHeader from "../../admin/components/ADPageHeader";

import AdminAssessments from "../../admin/features/assessment/AdminAssessment";

export default function AdminAssessmentFilePage() {
  const [sideBarOpen, setSideBarOpen] = useState(
    () => window.innerWidth >= 1024,
  );

  return (
    <>
      <div>
        <div className="relative flex h-screen w-full items-center overflow-hidden bg-[#8B1E23]">
          <div className="flex h-full w-full">
            <ADSidebar sideBarOpen={sideBarOpen} />
            <section
              className={`relative mt-5 mb-5 flex w-full flex-col gap-5 bg-[#F8F6F2] p-5 ${sideBarOpen ? "rounded-r-3xl" : "rounded-3xl"}`}
            >
              <ADPageHeader
                title={"Reports & Assessments"}
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
                description={
                  "Monitor and manage hazards and accidents across the campus"
                }
              />
              <div className="flex h-full w-full gap-5 overflow-hidden">
                <AdminAssessments />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
