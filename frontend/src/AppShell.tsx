import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';

import { ToastProvider } from './components';
import { Sidebar, TopBar, MobileTabBar, MoreSheet } from './layout';
import { AppContext } from './app/AppContext';
import { useSyncStore } from './modules/sync/syncStore';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useAuthStore } from './modules/auth/authStore';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');

  const online = useSyncStore(s => s.isOnline);
  const { canInstall, install } = useInstallPrompt();
  const isHydrated = useAuthStore(s => s.isHydrated);
  const accessToken = useAuthStore(s => s.accessToken);

  const navigate = useNavigate();

  useEffect(() => {
    if (isHydrated && !accessToken) {
      void navigate({ to: '/login', replace: true });
    }
  }, [isHydrated, accessToken, navigate]);

  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const activeSegment = pathname.replace('/app/', '').split('/')[0] ?? 'dashboard';

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface text-muted text-sm">
        Loading…
      </div>
    );
  }

  function handleNavigate(segment: string) {
    setSidebarOpen(false);
    setMoreOpen(false);
    const main = document.getElementById('main-scroll');
    if (main) main.scrollTop = 0;
    void navigate({ to: `/app/${segment}` });
  }

  return (
    <AppContext.Provider value={{ online, selectedClassId, setSelectedClassId }}>
      <ToastProvider>
        <div className="h-screen flex bg-surface">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              route={activeSegment}
              setRoute={handleNavigate}
              online={online}
            />
          </div>

          {/* Mobile slide-over */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-70">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <div className="absolute top-0 left-0 bottom-0 modal-anim">
                <Sidebar
                  route={activeSegment}
                  setRoute={handleNavigate}
                  online={online}
                  onClose={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Main column */}
          <div className="flex-1 flex flex-col min-w-0">
            <TopBar
              route={activeSegment}
              setRoute={handleNavigate}
              online={online}
              onMenu={() => setSidebarOpen(true)}
            />

            {/* Install banner */}
            {canInstall && (
              <div className="bg-teal-700 text-white text-[12.5px] flex items-center justify-between px-4 py-2">
                <span>Install AralSync for offline access and faster loading.</span>
                <button
                  onClick={install}
                  className="ml-4 px-3 py-1 rounded-md bg-white text-teal-800 font-semibold text-[12px] hover:bg-teal-50 transition-colors"
                >
                  Add to Home Screen
                </button>
              </div>
            )}

            <main id="main-scroll" className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8">
              <div className="max-w-screen-2xl mx-auto">
                <Outlet />
              </div>
            </main>
          </div>

          {/* Mobile bottom nav */}
          <MobileTabBar
            route={activeSegment}
            setRoute={handleNavigate}
            openMore={() => setMoreOpen(true)}
          />
          <MoreSheet
            open={moreOpen}
            onClose={() => setMoreOpen(false)}
            setRoute={handleNavigate}
          />
        </div>
      </ToastProvider>
    </AppContext.Provider>
  );
}
