import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';

import { ToastProvider } from './components';
import { Sidebar, TopBar, MobileTabBar, MoreSheet } from './layout';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakRadio,
  TweakToggle,
  TweakSlider,
} from './lib/tweaks';
import { AppContext } from './app/AppContext';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0F766E",
  "density": "regular",
  "showShortcutsTip": true,
  "headerCopy": "Teach more. Sync seamlessly."
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#0F766E',
  '#0D5E57',
  '#1D4ED8',
  '#7C3AED',
  '#EA580C',
];

export default function AppShell() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('g7r-sci');

  const navigate = useNavigate();
  const routerState = useRouterState();
  // Derive the active segment from the current pathname e.g. /app/dashboard → 'dashboard'
  const pathname = routerState.location.pathname;
  const activeSegment = pathname.replace('/app/', '').split('/')[0] ?? 'dashboard';

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', t.accent);
  }, [t.accent]);

  useEffect(() => {
    document.documentElement.dataset.density = t.density;
  }, [t.density]);

  function handleNavigate(segment: string) {
    setSidebarOpen(false);
    setMoreOpen(false);
    const main = document.getElementById('main-scroll');
    if (main) main.scrollTop = 0;
    void navigate({ to: `/app/${segment}` });
  }

  return (
    <AppContext.Provider value={{ online, setOnline, pending, setPending, selectedClassId, setSelectedClassId }}>
      <ToastProvider>
        <div className="h-screen flex bg-surface">
          {/* Desktop sidebar */}
          <div className="hidden lg:block">
            <Sidebar
              route={activeSegment}
              setRoute={handleNavigate}
              online={online}
              pending={pending}
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
                  pending={pending}
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
              setOnline={setOnline}
              onMenu={() => setSidebarOpen(true)}
            />

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

          {/* Tweaks panel */}
          <TweaksPanel title="Tweaks">
            <TweakSection label="Theme" />
            <TweakColor
              label="Accent color"
              value={t.accent}
              options={ACCENT_OPTIONS}
              onChange={(v: string) => setTweak('accent', v)}
            />
            <TweakSection label="Layout" />
            <TweakRadio
              label="Density"
              value={t.density}
              options={['compact', 'regular', 'comfy']}
              onChange={(v: string) => setTweak('density', v)}
            />
            <TweakSection label="Demo controls" />
            <TweakToggle label="Online" value={online} onChange={setOnline} />
            <div className="px-3 pb-2 text-[11px] text-slate-500">
              Toggles the connectivity pill, offline banners, and sync UI.
            </div>
            <TweakSlider
              label="Pending records"
              value={pending}
              min={0}
              max={20}
              step={1}
              onChange={setPending}
            />
            <TweakSection label="Copy" />
            <TweakToggle
              label="Show shortcut tip on dashboard"
              value={t.showShortcutsTip}
              onChange={(v: boolean) => setTweak('showShortcutsTip', v)}
            />
          </TweaksPanel>
        </div>
      </ToastProvider>
    </AppContext.Provider>
  );
}
