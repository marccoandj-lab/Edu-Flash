import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!user.emailVerified) {
     // Optional: You can force email verification here if desired
     // return <Navigate to="/auth" state={{ from: location, message: 'Please verify your email' }} replace />;
  }

  return <>{children}</>;
};
