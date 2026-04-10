import { Routes, Route, Navigate } from "react-router-dom";
import RedeemPage from "./pages/RedeemPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ListenPage from "./pages/ListenPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/redeem" element={<RedeemPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listen/:slug"
        element={
          <ProtectedRoute>
            <ListenPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/redeem" replace />} />
    </Routes>
  );
}
