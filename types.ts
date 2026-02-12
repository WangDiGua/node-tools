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
  // New Fields
  gender?: 'male' | 'female' | 'other';
  age?: number;
  phone?: string; // Added phone field
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

export interface VectorItem {
  id: string;
  title: string;
  content: string; // Used for preview
  dimensions: number;
  source: string; // Display string e.g. "MySQL: orders"
  status: 'indexed' | 'pending' | 'error';
  
  // New Fields
  isMultiTable: boolean;
  joinRules?: string; // JSON string representing the join config
  selectedFields: string; // JSON string or summary of selected fields
  isEnabled: boolean;
  
  // Sync Config
  cronConfig?: {
    enabled: boolean;
    expression: string;
  };
  
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface SystemLog {
  id: string;
  action: string;
  module: string;
  type: 'login' | 'operation' | 'error'; // Added type classification
  user: string;
  ip: string; // Added IP
  details: string; // JSON string or detailed message
  timestamp: string;
  status: 'success' | 'failure';
}

export interface BackgroundTask {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  progress: number;
  startTime: string;
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
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Wizard Data Models
export interface DatabaseItem {
  id: string;
  name: string;
  type: string;
}

export interface TableItem {
  id: string;
  name: string;
  rows: number;
  hasPrimaryKey?: boolean;
}

export interface FieldItem {
  id: string;
  name: string;
  type: string;
}