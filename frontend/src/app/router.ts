import { createRouter, createRoute, createRootRoute, redirect, type RouteComponent } from '@tanstack/react-router';
import { lazy } from 'react';
import { useAuthStore } from '../modules/auth/authStore';

// Lazy-load page components to keep initial bundle small
const Landing       = lazy(() => import('../pages/Landing'));
const SignIn        = lazy(() => import('../pages/SignIn'));
const Register      = lazy(() => import('../pages/Register'));
const Privacy       = lazy(() => import('../pages/Privacy'));
const Terms         = lazy(() => import('../pages/Terms'));
const DataPolicy    = lazy(() => import('../pages/DataPolicy'));
const AppShell      = lazy(() => import('../AppShell'));
// Prototype pages: still have old routing props — cast until rewritten per phase
const PageDashboard      = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.PageDashboard }))) as unknown as RouteComponent;
const PageClasses        = lazy(() => import('../pages/Classes').then(m => ({ default: m.PageClasses }))) as unknown as RouteComponent;
const PageClassDetail    = lazy(() => import('../pages/Classes').then(m => ({ default: m.PageClassDetail }))) as unknown as RouteComponent;
const PageStudents       = lazy(() => import('../pages/Students').then(m => ({ default: m.PageStudents }))) as unknown as RouteComponent;
const PageStudentProfile = lazy(() => import('../pages/Students').then(m => ({ default: m.PageStudentProfile }))) as unknown as RouteComponent;
const PageAttendance     = lazy(() => import('../pages/Attendance').then(m => ({ default: m.PageAttendance }))) as unknown as RouteComponent;
const PageSchedules      = lazy(() => import('../pages/Schedules').then(m => ({ default: m.PageSchedules })));
const PageGradebook      = lazy(() => import('../pages/Gradebook').then(m => ({ default: m.PageGradebook }))) as unknown as RouteComponent;
const PageReports        = lazy(() => import('../pages/Reports').then(m => ({ default: m.PageReports })));
const PageAdmin          = lazy(() => import('../pages/Admin').then(m => ({ default: m.PageAdmin }))) as unknown as RouteComponent;
const PageOwner          = lazy(() => import('../pages/OwnerDashboard').then(m => ({ default: m.PageOwnerDashboard }))) as unknown as RouteComponent;
const PageOwnerSchool    = lazy(() => import('../pages/OwnerSchool').then(m => ({ default: m.PageOwnerSchool }))) as unknown as RouteComponent;
const PageSync           = lazy(() => import('../pages/Sync').then(m => ({ default: m.PageSync }))) as unknown as RouteComponent;
const PageSettings       = lazy(() => import('../pages/Settings').then(m => ({ default: m.PageSettings })));
const PageSystemDesign   = lazy(() => import('../pages/SystemDesign').then(m => ({ default: m.PageSystemDesign }))) as unknown as RouteComponent;

// ─── Root ─────────────────────────────────────────────────
export const rootRoute = createRootRoute();

// ─── Public routes ────────────────────────────────────────
export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Landing,
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: SignIn,
});

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});

export const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: Privacy,
});

export const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: Terms,
});

export const dataPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/data-policy',
  component: DataPolicy,
});

// Keep /signin alias for backward-compat with existing landing page links
export const signinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  beforeLoad: () => { throw redirect({ to: '/login' }); },
});

// ─── App layout — auth-guarded ────────────────────────────
export const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: AppShell,
  beforeLoad: () => {
    const { accessToken, isHydrated } = useAuthStore.getState();
    if (isHydrated && !accessToken) {
      throw redirect({ to: '/login' });
    }
  },
});

export const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  beforeLoad: () => { throw redirect({ to: '/app/dashboard' }); },
});

export const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: PageDashboard,
});

export const classesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/classes',
  component: PageClasses,
});

export const classDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/classes/$classId',
  component: PageClassDetail,
});

export const studentsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/students',
  component: PageStudents,
});

export const studentProfileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/students/$studentId',
  component: PageStudentProfile,
});

export const attendanceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/attendance',
  component: PageAttendance,
});

export const schedulesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/schedules',
  component: PageSchedules,
});

export const gradebookRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/gradebook',
  component: PageGradebook,
});

export const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/reports',
  component: PageReports,
});

export const adminRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/admin',
  component: PageAdmin,
});

export const ownerRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/owner',
  component: PageOwner,
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'super_admin') {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

export const ownerSchoolRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/owner/schools/$schoolId',
  component: PageOwnerSchool,
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user?.role !== 'super_admin') {
      throw redirect({ to: '/app/dashboard' });
    }
  },
});

export const syncRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/sync',
  component: PageSync,
});

export const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: PageSettings,
});

export const systemDesignRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/system-design',
  component: PageSystemDesign,
});

// ─── Route tree ───────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  privacyRoute,
  termsRoute,
  dataPolicyRoute,
  signinRoute,
  appRoute.addChildren([
    appIndexRoute,
    dashboardRoute,
    classesRoute,
    classDetailRoute,
    studentsRoute,
    studentProfileRoute,
    attendanceRoute,
    schedulesRoute,
    gradebookRoute,
    reportsRoute,
    adminRoute,
    ownerRoute,
    ownerSchoolRoute,
    syncRoute,
    settingsRoute,
    systemDesignRoute,
  ]),
]);

export const router = createRouter({ routeTree });

// Type augmentation for useRouter() hooks
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
