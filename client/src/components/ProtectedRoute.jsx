import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("learning_token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
