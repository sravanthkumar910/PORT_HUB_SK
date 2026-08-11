import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-900 text-base-50/60 font-mono text-sm">
        booting control room...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;
