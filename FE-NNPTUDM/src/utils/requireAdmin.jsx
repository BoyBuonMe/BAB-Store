import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

export default function RequireAdmin() {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  const isAdmin = user?.role === "ADMIN";

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
