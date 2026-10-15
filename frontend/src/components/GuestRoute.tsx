import { Navigate, Outlet } from "react-router-dom";

function GuestRoute() {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/posts" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
