import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import AppLayout from "../components/layout/AppLayout";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";

import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Receipts from "../pages/Receipts";
import Deliveries from "../pages/Deliveries";
import Transfers from "../pages/Transfers";
import Adjustments from "../pages/Adjustments";
import MoveHistory from "../pages/MoveHistory";
import Warehouses from "../pages/Warehouses";
import Profile from "../pages/Profile";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading StockSense...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400">Loading StockSense...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* ================= PROTECTED ROUTES ================= */}

      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedLayout>
            <Products />
          </ProtectedLayout>
        }
      />

      <Route
        path="/receipts"
        element={
          <ProtectedLayout>
            <Receipts />
          </ProtectedLayout>
        }
      />

      <Route
        path="/deliveries"
        element={
          <ProtectedLayout>
            <Deliveries />
          </ProtectedLayout>
        }
      />

      <Route
        path="/transfers"
        element={
          <ProtectedLayout>
            <Transfers />
          </ProtectedLayout>
        }
      />

      <Route
        path="/adjustments"
        element={
          <ProtectedLayout>
            <Adjustments />
          </ProtectedLayout>
        }
      />

      <Route
        path="/move-history"
        element={
          <ProtectedLayout>
            <MoveHistory />
          </ProtectedLayout>
        }
      />

      <Route
        path="/warehouses"
        element={
          <ProtectedLayout>
            <Warehouses />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <Profile />
          </ProtectedLayout>
        }
      />

      {/* ================= DEFAULT ================= */}

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;
