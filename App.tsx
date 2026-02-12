import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layout/MainLayout';
import { Login } from './pages/Login';
import { Forbidden } from './pages/403';
import { NotFound } from './pages/404';
import { ToastProvider } from './components/Toast';
import { StoreProvider, useStore } from './store';
import { APP_CONFIG } from './config';
import { appRoutes, RouteConfig } from './router';
import { Loader2 } from 'lucide-react';

// Loading Spinner for Lazy Components
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center text-slate-400">
    <Loader2 size={32} className="animate-spin" />
  </div>
);

// Route Guard Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Dynamic Route Renderer
const AppRoutes = () => {
  const { state } = useStore();
  // If user is not in state (e.g. initial load before effect), try to get from localstorage or default to guest role
  // In a real app, we might wait for an "initialized" flag.
  const userRole = state.user?.role || 'viewer'; 

  const renderRoutes = (routes: RouteConfig[]) => {
    return routes.map((route) => {
      // 1. Permission Check
      if (route.roles && !route.roles.includes(userRole)) {
        return null; // Don't render the route at all if unauthorized
      }

      // 2. Render Route
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <Suspense fallback={<PageLoader />}>
              <route.component />
            </Suspense>
          }
        >
          {route.children && renderRoutes(route.children)}
        </Route>
      );
    });
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dynamic Routes Injection */}
        {renderRoutes(appRoutes)}

        <Route path="403" element={<Forbidden />} />
      </Route>

      {/* Error Routes */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </StoreProvider>
  );
};

export default App;