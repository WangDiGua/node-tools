import React from 'react';
import { LayoutDashboard, Database, Search, Book, Eraser, List, Users, Shield, Lock, FileText, User, Settings as SettingsIcon } from 'lucide-react';

// Lazy load components to optimize initial load
const Dashboard = React.lazy(() => import('../pages/Dashboard').then(module => ({ default: module.Dashboard })));
const VectorList = React.lazy(() => import('../pages/VectorList').then(module => ({ default: module.VectorList })));
const VectorSearch = React.lazy(() => import('../pages/VectorSearch').then(module => ({ default: module.VectorSearch })));
const KBConfig = React.lazy(() => import('../pages/KBConfig').then(module => ({ default: module.KBConfig })));
const KBRetrieval = React.lazy(() => import('../pages/KBRetrieval').then(module => ({ default: module.KBRetrieval })));
const LLMClean = React.lazy(() => import('../pages/LLMClean').then(module => ({ default: module.LLMClean })));
const Settings = React.lazy(() => import('../pages/Settings').then(module => ({ default: module.Settings })));
const LogAudit = React.lazy(() => import('../pages/LogAudit').then(module => ({ default: module.LogAudit })));
const Profile = React.lazy(() => import('../pages/Profile').then(module => ({ default: module.Profile })));

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  roles?: string[]; // Allowed roles. If undefined, all authenticated users can access.
  children?: RouteConfig[];
  meta?: {
    title: string;
    icon?: React.ReactNode;
  };
}

export const appRoutes: RouteConfig[] = [
  {
    path: 'dashboard',
    component: Dashboard,
    meta: { title: '仪表盘', icon: <LayoutDashboard size={18} /> }
  },
  {
    path: 'vector',
    component: VectorList,
    roles: ['admin', 'editor'],
    meta: { title: '向量管理', icon: <Database size={18} /> }
  },
  {
    path: 'vector-search',
    component: VectorSearch,
    meta: { title: '向量搜索', icon: <Search size={18} /> }
  },
  {
    path: 'kb/config',
    component: KBConfig,
    roles: ['admin', 'editor'],
    meta: { title: '知识库配置', icon: <Book size={18} /> }
  },
  {
    path: 'kb/retrieval',
    component: KBRetrieval,
    meta: { title: '知识库检索', icon: <Search size={18} /> }
  },
  {
    path: 'tools/llm-clean',
    component: LLMClean,
    roles: ['admin', 'editor'],
    meta: { title: '大模型输出清洁', icon: <Eraser size={18} /> }
  },
  {
    path: 'log-audit',
    component: LogAudit,
    roles: ['admin'],
    meta: { title: '日志审计', icon: <FileText size={18} /> }
  },
  {
    path: 'settings/*',
    component: Settings,
    roles: ['admin'], // Only admin can access settings layout
    meta: { title: '系统设置', icon: <SettingsIcon size={18} /> }
  },
  {
    path: 'profile',
    component: Profile,
    meta: { title: '个人中心', icon: <User size={18} /> }
  }
];