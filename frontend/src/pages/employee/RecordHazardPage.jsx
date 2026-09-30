import EMPageHeader from "../../employee/components/ui/EMPageHeader";
import EMSidebar from "../../employee/components/ui/EmSidebar";
import { useState } from "react";
import HazardForm from "../../employee/features/recording/hazard/HazardForm";

export default function RecordHazardPage() {
  const [sideBarOpen, setSideBarOpen] = useState(() => window.innerWidth >= 1024);
  return (
    <>
      <div className="relative flex h-screen w-full items-center bg-[#8B1E23]">
        <div className="flex h-full w-full">
          <EMSidebar sideBarOpen={sideBarOpen} />

          <section className="relative mt-5 mb-5 flex w-full flex-col gap-5 rounded-r-3xl bg-[#F8F6F2] p-5">
            <EMPageHeader
              title={"Recording Hazard"}
              sideBarOpen={sideBarOpen}
              setSideBarOpen={setSideBarOpen}
              description={"Record hazard across the campus"}
            />
            <div className="flex h-auto w-full gap-5 overflow-auto">
              <HazardForm />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
