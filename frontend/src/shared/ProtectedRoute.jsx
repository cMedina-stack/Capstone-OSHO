import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // No login information
  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Check role
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
