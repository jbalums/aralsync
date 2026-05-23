import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/router';
import { queryClient } from './app/queryClient';
import { configureHttp } from './services/http';
import { useAuthStore } from './modules/auth/authStore';
import { initBackgroundSync } from './offline/backgroundSync';
import './index.css';

function AppRoot() {
  useEffect(() => {
    configureHttp({
      getToken: () => useAuthStore.getState().accessToken,
      getRefreshToken: () => null,
      onRefresh: (t) => useAuthStore.getState().setToken(t),
      onLogout: () => useAuthStore.getState().clearAuth(),
    });
    return initBackgroundSync();
  }, []);

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-surface text-muted text-sm">Loading…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  </React.StrictMode>,
);
