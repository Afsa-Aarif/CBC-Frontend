// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const userRole = localStorage.getItem("role")?.toLowerCase() || "customer";

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error("Security Route Error:", error);
    return <Navigate to="/login" replace />;
  }

  return children;
}