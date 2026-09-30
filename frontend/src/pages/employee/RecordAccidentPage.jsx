import EMPageHeader from "../../employee/components/ui/EMPageHeader";
import EMSidebar from "../../employee/components/ui/EmSidebar";
import { useState } from "react";
import AccidentForm from "../../employee/features/recording/accident/AccidentForm";

export default function RecordAccidentPage() {
  const [sideBarOpen, setSideBarOpen] = useState(() => window.innerWidth >= 1024);
  return (
    <>
      <div className="relative flex w-full items-center bg-[#8B1E23] md:h-screen xl:h-screen">
        <div className="flex h-full w-full">
          <EMSidebar sideBarOpen={sideBarOpen} />

          <section className="relative mt-5 mb-5 flex w-full flex-col gap-5 rounded-r-3xl bg-[#F8F6F2] p-5">
            <EMPageHeader
              title={"Recording Incident"}
              sideBarOpen={sideBarOpen}
              setSideBarOpen={setSideBarOpen}
              description={"Record Incident across the campus"}
            />
            <div className="flex w-full gap-5 overflow-hidden">
              <AccidentForm />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
