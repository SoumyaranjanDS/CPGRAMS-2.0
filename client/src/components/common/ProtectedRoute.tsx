import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
        </div>
        <span className="text-sm font-bold text-slate-800">
          Verifying session credentials...
        </span>
        <span className="text-xs text-slate-500">
          Connecting to CPGRAMS Security Engine
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve requested target url with query parameters in redirect
    const targetUrl = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/login?redirect=${targetUrl}`} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-3 font-sans">
        <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
