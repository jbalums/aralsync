import React, { useEffect, useState } from 'react';

import {
  ToastProvider,
} from './components';
import {
  Sidebar,
  TopBar,
  MobileTabBar,
  MoreSheet,
} from './layout';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakColor,
  TweakRadio,
  TweakToggle,
  TweakSlider,
} from './lib/tweaks.jsx';

import { PageDashboard }       from './pages/Dashboard.jsx';
import { PageClasses,
         PageClassDetail }     from './pages/Classes.jsx';
import { PageStudents,
         PageStudentProfile }  from './pages/Students.jsx';
import { PageAttendance }      from './pages/Attendance.jsx';
import { PageSchedules }       from './pages/Schedules.jsx';
import { PageGradebook }       from './pages/Gradebook.jsx';
import { PageReports }         from './pages/Reports.jsx';
import { PageAdmin }           from './pages/Admin.jsx';
import { PageSync }            from './pages/Sync.jsx';
import { PageSettings }        from './pages/Settings.jsx';

// ─── Tweak defaults ────────────────────────────────────
// The host writes back updates between these markers when the user changes
// a tweak. They need to be valid JSON.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0F766E",
  "density": "regular",
  "showShortcutsTip": true,
  "headerCopy": "Teach more. Sync seamlessly."
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#0F766E', // deep teal (default)
  '#0D5E57',
  '#1D4ED8',
  '#7C3AED',
  '#EA580C',
];

const SCREEN_LABELS = {
  dashboard:        '01 Dashboard',
  classes:          '02 My Classes',
  'class-detail':   '03 Class Detail',
  students:         '04 Students',
  'student-profile':'05 Student Profile',
  attendance:       '06 Attendance',
  schedules:        '07 Schedules',
  gradebook:        '08 Gradebook',
  reports:          '09 Reports',
  admin:            '10 Admin Console',
  sync:             '11 Sync Center',
  settings:         '12 Settings',
};

export default function AppShell() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [route, setRoute] = useState('dashboard');
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState('g7r-sci');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Apply theme accent into CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', t.accent);
  }, [t.accent]);

  // Density flag for downstream styling
  useEffect(() => {
    document.documentElement.dataset.density = t.density;
  }, [t.density]);

  // Reset selected student when leaving profile
  useEffect(() => {
    if (route !== 'student-profile') setSelectedStudent(null);
  }, [route]);

  function handleSetRoute(r) {
    setRoute(r);
    setSidebarOpen(false);
    setMoreOpen(false);
    const main = document.getElementById('main-scroll');
    if (main) main.scrollTop = 0;
  }

  function openAttendance() {
    handleSetRoute('attendance');
  }

  const screenLabel = SCREEN_LABELS[route] || route;

  return (
    <ToastProvider>
      <div className="h-screen flex bg-surface" data-screen-label={screenLabel}>
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            route={route}
            setRoute={handleSetRoute}
            online={online}
            pending={pending}
          />
        </div>

        {/* Mobile slide-over */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-[70]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)}></div>
            <div className="absolute top-0 left-0 bottom-0 modal-anim">
              <Sidebar
                route={route}
                setRoute={handleSetRoute}
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
            route={route}
            setRoute={handleSetRoute}
            online={online}
            setOnline={setOnline}
            onMenu={() => setSidebarOpen(true)}
          />

          <main id="main-scroll" className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-8">
            <div className="max-w-screen-2xl mx-auto">
              {route === 'dashboard' && (
                <PageDashboard
                  online={online}
                  pending={pending}
                  setRoute={handleSetRoute}
                  setSelectedClass={setSelectedClass}
                  openAttendance={openAttendance}
                />
              )}
              {route === 'classes' && (
                <PageClasses setRoute={handleSetRoute} setSelectedClass={setSelectedClass} />
              )}
              {route === 'class-detail' && (
                <PageClassDetail classId={selectedClass} setRoute={handleSetRoute} />
              )}
              {route === 'students' && (
                <PageStudents setRoute={handleSetRoute} setSelectedStudent={setSelectedStudent} />
              )}
              {route === 'student-profile' && (
                <PageStudentProfile student={selectedStudent} setRoute={handleSetRoute} />
              )}
              {route === 'attendance' && (
                <PageAttendance
                  online={online}
                  pending={pending}
                  setPending={setPending}
                  selectedClassId={selectedClass}
                  setSelectedClass={setSelectedClass}
                />
              )}
              {route === 'schedules' && <PageSchedules />}
              {route === 'gradebook' && <PageGradebook initialClassId={selectedClass} />}
              {route === 'reports' && <PageReports />}
              {route === 'admin' && <PageAdmin setRoute={handleSetRoute} />}
              {route === 'sync' && (
                <PageSync
                  online={online}
                  setOnline={setOnline}
                  pending={pending}
                  setPending={setPending}
                />
              )}
              {route === 'settings' && <PageSettings />}
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileTabBar
          route={route}
          setRoute={handleSetRoute}
          openMore={() => setMoreOpen(true)}
        />
        <MoreSheet
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          setRoute={handleSetRoute}
        />

        {/* Tweaks panel */}
        <TweaksPanel title="Tweaks">
          <TweakSection label="Theme" />
          <TweakColor
            label="Accent color"
            value={t.accent}
            options={ACCENT_OPTIONS}
            onChange={(v) => setTweak('accent', v)}
          />
          <TweakSection label="Layout" />
          <TweakRadio
            label="Density"
            value={t.density}
            options={['compact', 'regular', 'comfy']}
            onChange={(v) => setTweak('density', v)}
          />
          <TweakSection label="Demo controls" />
          <TweakToggle label="Online" value={online} onChange={setOnline} />
          <div className="px-3 pb-2 text-[11px] text-slate-500">
            Toggles the connectivity pill, offline banners, and sync UI throughout the app.
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
            onChange={(v) => setTweak('showShortcutsTip', v)}
          />
        </TweaksPanel>
      </div>
    </ToastProvider>
  );
}
