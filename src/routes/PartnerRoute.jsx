import { Navigate, Outlet } from "react-router-dom";

export default function PartnerRoute() {
  const token = localStorage.getItem("partnerToken");
  if (!token) return <Navigate to="/partner/login" replace />;
  return <Outlet />;
}
