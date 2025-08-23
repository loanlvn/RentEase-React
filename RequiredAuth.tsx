// src/features/auth/components/RequireAuth.tsx
import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // spinner
    return <p>Vérification en cours…</p>;
  }
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
