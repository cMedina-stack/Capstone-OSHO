import { useState } from "react";
import ADSidebar from "../../admin/components/ADSidebar";
import ADPageHeader from "../../admin/components/ADPageHeader";
import HazardReportDetails from "../../employee/features/reports/HazardReportDetails";
import IncidentReportDetails from "../../employee/features/reports/IncidentReportDetails";
export default function AdminReportDetailsPage({ type }) {
  const [sideBarOpen, setSideBarOpen] = useState(() => window.innerWidth >= 1024);
  return (
    <div className="flex min-h-screen bg-[#8B1E23]">
      <ADSidebar sideBarOpen={sideBarOpen} />
      <main className="m-5 min-w-0 flex-1 rounded-3xl bg-[#F8F6F2] p-5">
        <ADPageHeader
          title="Report details"
          description="Review campus reports and corrective actions"
          setSideBarOpen={setSideBarOpen}
        />
        {type === "hazard" ? (
          <HazardReportDetails admin />
        ) : (
          <IncidentReportDetails admin />
        )}
      </main>
    </div>
  );
}
