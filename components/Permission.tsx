import React from 'react';
import { useStore } from '../store';

interface PermissionProps {
  roles: string[]; // Allowed roles, e.g., ['admin', 'editor']
  children: React.ReactNode;
  fallback?: React.ReactNode; // UI to show if permission denied
}

export const Permission: React.FC<PermissionProps> = ({ roles, children, fallback = null }) => {
  const { state } = useStore();
  const currentUser = state.user;

  // If no user is logged in, assume denied (or handle as needed)
  if (!currentUser) return <>{fallback}</>;

  if (roles.includes(currentUser.role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};