import { useState } from "react";
import ADSidebar from "../../admin/components/ADSidebar";
import ADPageHeader from "../../admin/components/ADPageHeader";
import AdminMapPage from "../../admin/features/map/AdminMapPage";

export default function AdminMapPagee() {
  const [sideBarOpen, setSideBarOpen] = useState(
    () => window.innerWidth >= 1024,
  );

  return (
    <>
      <div>
        <div className="relative flex w-full items-center overflow-hidden bg-[#8B1E23]">
          <div className="flex h-full w-full">
            <ADSidebar sideBarOpen={sideBarOpen} />
            <section
              className={`relative mt-5 mb-5 flex w-full flex-col gap-5 bg-[#F8F6F2] p-5 ${sideBarOpen ? "rounded-r-3xl" : "rounded-3xl"}`}
            >
              <ADPageHeader
                title={"Campus Safety Map"}
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
                description={
                  "Monitor reported hazards, incidents, assessments, and risk levels across campus."
                }
              />
              <div className="flex h-full w-full gap-5">
                <AdminMapPage />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
