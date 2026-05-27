import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './app/router';
import { queryClient } from './app/queryClient';
import { ToastProvider } from './components';
import { configureHttp } from './services/http';
import { useAuthStore } from './modules/auth/authStore';
import { authService } from './modules/auth/auth.service';
import { initBackgroundSync } from './offline/backgroundSync';
import { connectSocket, disconnectSocket } from './services/socket';
import { db } from './db';
import { validateEnv } from './shared/utils/env';
import './index.css';

validateEnv();

function AppRoot() {
  useEffect(() => {
    const { setAuth, setToken, clearAuth, setHydrated } = useAuthStore.getState();

    configureHttp({
      getToken:        () => useAuthStore.getState().accessToken,
      getRefreshToken: () => useAuthStore.getState().user?.refreshToken ?? null,
      onRefresh:       (t) => setToken(t),
      onLogout:        () => { void clearAuth(); },
    });

    // Session rehydration: find stored user with a refresh token in Dexie
    const hydrate = async () => {
      try {
        const stored = await db.users.filter((u) => Boolean(u.refreshToken)).first();
        if (stored?.refreshToken) {
          const tokens = await authService.refresh(stored.refreshToken);
          setToken(tokens.accessToken);
          const user = await authService.me();
          await setAuth(user, tokens.accessToken, tokens.refreshToken);
        }
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 403) {
          await clearAuth();
        }
        // Network/server errors: leave stored token intact; retry on next reload
      } finally {
        setHydrated();
      }
    };

    void hydrate();
    const cleanupSync = initBackgroundSync();

    // Mount/unmount socket as auth changes
    const unsubAuth = useAuthStore.subscribe((state, prev) => {
      const wasAuthed = Boolean(prev.user?.schoolId);
      const isAuthed  = Boolean(state.user?.schoolId);
      const u = state.user;
      if (isAuthed && u?.schoolId && (!wasAuthed || prev.user?.id !== u.id)) {
        connectSocket({
          schoolId:   u.schoolId,
          userId:     u.id,
          deviceId:   u.deviceId,
          deviceName: u.name || 'Device',
          role:       u.role,
        });
      } else if (!isAuthed && wasAuthed) {
        disconnectSocket();
      }
    });

    return () => {
      cleanupSync();
      unsubAuth();
      disconnectSocket();
    };
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
      <ToastProvider>
        <AppRoot />
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
