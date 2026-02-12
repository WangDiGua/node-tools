import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { VectorList } from './pages/VectorList';
import { VectorSearch } from './pages/VectorSearch';
import { KBConfig } from './pages/KBConfig';
import { KBRetrieval } from './pages/KBRetrieval';
import { LLMClean } from './pages/LLMClean';
import { Settings } from './pages/Settings';
import { LogAudit } from './pages/LogAudit';
import { Profile } from './pages/Profile';
import { Forbidden } from './pages/403';
import { NotFound } from './pages/404';
import { ToastProvider } from './components/Toast';
import { StoreProvider } from './store';
import { APP_CONFIG } from './config';

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Vector Configuration */}
              <Route path="vector" element={<VectorList />} />
              <Route path="vector-search" element={<VectorSearch />} />

              {/* Knowledge Base */}
              <Route path="kb/config" element={<KBConfig />} />
              <Route path="kb/retrieval" element={<KBRetrieval />} />

              {/* Node Tools */}
              <Route path="tools/llm-clean" element={<LLMClean />} />

              <Route path="log-audit" element={<LogAudit />} />
              <Route path="settings/*" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              <Route path="403" element={<Forbidden />} />
            </Route>

            {/* Error Routes */}
            <Route path="/403" element={<Forbidden />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
};

export default App;