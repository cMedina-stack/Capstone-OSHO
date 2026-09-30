import { lazy, Suspense } from "react";
import ProtectedRoute from "./shared/ProtectedRoute";
const AdminReportDetailsPage = lazy(
  () => import("./pages/admin/AdminReportDetailsPage"),
);
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import EmployeeProfilePage from "./pages/employee/EmployeeProfilePage";
import AdminAssessmentFilePage from "./pages/admin/AdminAssessmentFilePage";
import AdminProfilePage from "./pages/admin/AdminProfile";
import AdminMapPagee from "./pages/admin/AdminMapPagee";
import AddUserPage from "./pages/admin/AddUserPage";

const LoginPage = lazy(() => import("./pages/LoginPage"));

const RecordHazardPage = lazy(
  () => import("./pages/employee/RecordHazardPage"),
);
const EMDashboardPage = lazy(() => import("./pages/employee/EMDashboardPage"));
const RecordAccidentPage = lazy(
  () => import("./pages/employee/RecordAccidentPage"),
);
const MyReportsPage = lazy(() => import("./pages/employee/MyReportsPage"));

const HazardReportDetailsPage = lazy(
  () => import("./pages/employee/HazardReportDetailsPage"),
);
const IncidentReportDetailsPage = lazy(
  () => import("./pages/employee/IncidentReportDetailsPage"),
);
const DashboardPage = lazy(() => import("./pages/admin/DashboardPage"));
const AdminAssessmentPage = lazy(
  () => import("./pages/admin/AdminAssessmentPage"),
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div
            className="min-h-screen bg-[#F8F6F2] p-8 text-[#651317]"
            role="status"
          >
            Loading...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute role="admin" />}>
            <Route
              path="/admin/hazard-reports/:reportId"
              element={<AdminReportDetailsPage type="hazard" />}
            />
            <Route
              path="/admin/incident-reports/:reportId"
              element={<AdminReportDetailsPage type="incident" />}
            />
            <Route
              path="/admin/assessments/incident/:reportId"
              element={<AdminReportDetailsPage type="incident" />}
            />
            <Route path="/admin/dashboard" element={<DashboardPage />} />

            <Route
              path="/admin/assessments"
              element={<AdminAssessmentPage />}
            />

            <Route
              path="/admin/assessments-file"
              element={<AdminAssessmentFilePage />}
            />

            <Route path="/admin/my-profile" element={<AdminProfilePage />} />

            <Route path="/admin/safety-map" element={<AdminMapPagee />} />

            <Route path="/admin/add-users" element={<AddUserPage />} />
          </Route>
          <Route element={<ProtectedRoute role="employee" />}>
            <Route path="/employee/dashboard" element={<EMDashboardPage />} />

            <Route
              path="/employee/record-hazard"
              element={<RecordHazardPage />}
            />

            <Route
              path="/employee/record-incident"
              element={<RecordAccidentPage />}
            />

            <Route path="/employee/my-reports" element={<MyReportsPage />} />

            <Route
              path="/employee/reports/hazard/:reportId"
              element={<HazardReportDetailsPage />}
            />

            <Route
              path="/employee/reports/incident/:reportId"
              element={<IncidentReportDetailsPage />}
            />
            <Route
              path="/employee/my-profile"
              element={<EmployeeProfilePage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
