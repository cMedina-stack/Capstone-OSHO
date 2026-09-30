import { useState } from "react";
import ADSidebar from "../../admin/components/ADSidebar";
import ADPageHeader from "../../admin/components/ADPageHeader";

import AddUser from "../../admin/features/profile/AddUser";

export default function AddUserPage() {
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
                title={"Create an User accounts"}
                sideBarOpen={sideBarOpen}
                setSideBarOpen={setSideBarOpen}
                description={
                  "Create accounts for OSHO administrators and employees who are authorized to use the system."
                }
              />
              <div className="flex h-full w-full gap-5 overflow-hidden">
                <AddUser />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
