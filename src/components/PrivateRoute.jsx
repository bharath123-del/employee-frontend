import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Layout from "./Layout.jsx";

export default function PrivateRoute({ adminOnly }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Layout />;
}
