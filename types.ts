import React from 'react';

// Data Models
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface VectorItem {
  id: string;
  title: string; // Added title field
  content: string;
  dimensions: number;
  source: string;
  status: 'indexed' | 'pending' | 'error';
  createdAt: string;
}

export interface SystemLog {
  id: string;
  action: string;
  module: string;
  user: string;
  timestamp: string;
  status: 'success' | 'failure';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// UI Models
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string; // Added className for styling flexibility
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Added size prop
}