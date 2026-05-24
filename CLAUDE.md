# AralSync — Project Memory

## Project Overview

**AralSync** ("Aral" = Filipino word for study/learning) is an offline-first classroom
attendance and academic records PWA for Philippine public school teachers following the
DepEd curriculum framework. Designed primarily for schools with unstable internet.

Tagline: "Teach more. Sync seamlessly."

Monorepo with two workspaces: `frontend/` and `backend/`.

---

## Build & Dev Commands

```bash
# Frontend (React + Vite + TypeScript)
cd frontend
npm run dev          # dev server → http://localhost:5173
npm run build        # production build (PWA output)
npm run preview      # preview production build

# Backend (Node.js + Express + TypeScript)
cd backend
npm run dev          # ts-node-dev with hot reload → http://localhost:5000
npm run build        # tsc → dist/
npm run start        # run compiled dist/index.js
```

---

## Stack

| Layer         | Tech                                                     |
| ------------- | -------------------------------------------------------- |
| Frontend      | React 19, Vite 7, TypeScript 5.8 (strict)                |
| PWA           | vite-plugin-pwa (Workbox) — installable, offline-capable |
| Router        | TanStack Router (file-based)                             |
| State         | Zustand 5                                                |
| Local DB      | Dexie 4 (IndexedDB wrapper)                              |
| Data fetching | TanStack Query 5                                         |
| HTTP client   | Axios (with JWT interceptors via `src/services/http.ts`) |
| WebSocket     | Socket.IO client (LAN sync)                              |
| UI components | shadcn/ui (Radix UI primitives)                          |
| Styling       | Tailwind CSS v4                                          |
| Forms         | React Hook Form + Zod                                    |
| Animation     | Framer Motion                                            |
| Charts        | Recharts                                                 |
| Export        | jsPDF (PDF reports) + SheetJS/xlsx (Excel export)        |
| Deployment    | Cloudflare Pages (@cloudflare/vite-plugin)               |
| Backend       | Node.js, Express.js, TypeScript (strict)                 |
| Database      | MongoDB via Mongoose                                     |
| Validation    | Zod (backend) + React Hook Form + Zod (frontend)         |
| Auth          | JWT access token + refresh token + device ID             |
| WebSocket     | Socket.IO (LAN peer sync)                                |

---

## DepEd Grading System (baked into data model + UI)

Philippine DepEd uses component-weighted quarterly grading.

### Grade Components (configurable per subject, these are defaults)

| Component              | Weight |
| ---------------------- | ------ |
| Written Works (WW)     | 20%    |
| Performance Tasks (PT) | 60%    |
| Quarterly Assessment   | 20%    |

```
Quarterly Grade = (WW_total/WW_max × 0.20)
               + (PT_total/PT_max × 0.60)
               + (QA_score/QA_max × 0.20)
               → transmuted via DepEd table → final quarterly grade
```

Final Grade = average of Q1 + Q2 + Q3 + Q4 quarterly grades.

### Transmutation

Raw percentage → transmuted grade via DepEd transmutation table (stored as a
lookup constant in `frontend/src/shared/constants/transmutation.ts`).

### Thresholds

```ts
const PASSING_GRADE = 75;
const HONOR_THRESHOLDS = {
	withHighestHonors: 98, // ≥ 98
	withHighHonors: 95, // 95–97
	withHonors: 90, // 90–94
};
```

### Official DepEd Forms (referenced in Reports module)

| Form | Name                                | Scope                         |
| ---- | ----------------------------------- | ----------------------------- |
| SF2  | Daily Attendance Record             | Per class, per month          |
| SF9  | Learner's Report Card               | Per student, per quarter      |
| SF10 | Learner's Permanent Academic Record | Per student, full school year |

---

## Data Hierarchy

```
Teacher (User)
  └── School
        └── School Year (e.g. 2026)
              └── Subject (e.g. Science)
                    └── Section (e.g. Grade 7 – Rizal)
                          └── Student
                                ├── LRN (12-digit Learner Reference Number — unique PH identifier)
                                ├── Attendance[]  (per session/day, per subject-section)
                                ├── WrittenWork[] (score, maxScore, quarter)
                                ├── PerformanceTask[] (score, maxScore, quarter)
                                ├── QuarterlyAssessment (score, maxScore, quarter)
                                └── QuarterlyGrade (computed, per subject, per quarter)
```

One teacher can hold multiple class loads:
`Teacher ─< ClassLoad (Subject + Section) ─< Student`

---

## Dexie Schema (IndexedDB — 11 tables)

Defined in `frontend/src/db/schema.ts`.

```ts
// All tables use string UUIDs as primary keys
// syncStatus: 'pending' | 'synced' | 'failed'

db.version(1).stores({
	users: "&id, email, schoolId, role",
	schools: "&id, name, division, district",
	schoolYears: "&id, schoolId, label, isActive",
	subjects: "&id, schoolId, name, gradeLevel",
	sections: "&id, schoolId, gradeLevel, name, adviserId",
	classLoads:
		"&id, teacherId, subjectId, sectionId, schoolYearId, quarter, [subjectId+sectionId]",
	students: "&id, lrn, sectionId, lastName, firstName, [sectionId+lastName]",
	attendanceRecords:
		"&id, classLoadId, studentId, date, session, status, syncStatus, updatedAt",
	gradeEntries:
		"&id, classLoadId, studentId, quarter, component, columnLabel, score, maxScore, syncStatus, updatedAt",
	quarterlyGrades:
		"&id, classLoadId, studentId, quarter, wwWeighted, ptWeighted, qaWeighted, initialGrade, transmutedGrade, syncStatus",
	syncQueue:
		"++id, tableName, recordId, operation, payload, createdAt, retries",
});
```

### Key field notes

- `lrn` — 12-digit string, unique per student nationwide, validated on entry
- `session` — `'AM' | 'PM'`
- `component` — `'WW' | 'PT' | 'QA'`
- `operation` in syncQueue — `'create' | 'update' | 'delete'`
- `syncStatus` — `'pending' | 'synced' | 'failed'`

---

## Architecture Rules

- **Offline first**: every write goes to Dexie first → pushed to `syncQueue` → drained later.
- **Source of truth**: Dexie locally; MongoDB is backup + replication only.
- **Sync modes**:
    - **LAN** — Socket.IO peer-to-peer (same WiFi, no internet required)
    - **Cloud** — Axios REST API (when internet available)
- **Conflict resolution (MVP)**: last `updatedAt` timestamp wins.
- **PWA**: service worker via `vite-plugin-pwa`; app must be fully usable offline.
- **Grade computation**: always computed client-side from raw scores; never trust server-computed grades as source of truth.

---

## Project Structure

```
aralsync/
├── frontend/
│   └── src/
│       ├── app/                    # router config, providers, app shell
│       ├── modules/                # feature modules
│       │   ├── auth/               # login, register, PIN lock
│       │   ├── dashboard/          # dashboard widgets, today's schedule
│       │   ├── classrooms/         # class loads, section management
│       │   ├── students/           # student list, profile, import (CSV)
│       │   ├── attendance/         # attendance form (core feature)
│       │   ├── gradebook/          # WW/PT/QA entry, quarterly grade view
│       │   ├── reports/            # SF2/SF9/SF10 PDF+Excel generation
│       │   ├── schedules/          # weekly schedule calendar
│       │   └── sync/               # sync center, queue management
│       ├── db/
│       │   ├── schema.ts           # Dexie DB instance + all 11 table definitions
│       │   └── index.ts            # exports db singleton
│       ├── offline/
│       │   ├── syncQueue.ts        # enqueue / dequeue / retry logic
│       │   └── backgroundSync.ts   # drain queue on reconnect
│       ├── services/
│       │   ├── http.ts             # Axios instance with JWT interceptors
│       │   └── socket.ts           # Socket.IO client instance
│       ├── shared/
│       │   ├── types/              # global TypeScript interfaces
│       │   ├── constants/
│       │   │   ├── transmutation.ts  # DepEd grade transmutation lookup table
│       │   │   └── grading.ts        # default WW/PT/QA weights, thresholds
│       │   └── utils/
│       │       ├── gradeCompute.ts   # computeQuarterlyGrade(), transmute()
│       │       └── lrn.ts            # validateLRN() — 12-digit format check
│       └── ui/                     # reusable UI components (shadcn/ui based)
└── backend/
    └── src/
        ├── modules/
        │   ├── auth/               # register, login, refresh, device management
        │   ├── schools/            # school CRUD
        │   ├── classLoads/         # subject-section assignments per teacher
        │   ├── students/           # student CRUD + LRN validation
        │   ├── attendance/         # attendance record CRUD + SF2 export
        │   ├── gradeEntries/       # WW/PT/QA score CRUD
        │   ├── quarterlyGrades/    # computed grade storage + SF9/SF10 export
        │   ├── schedules/          # weekly schedule management
        │   └── sync/               # sync queue drain endpoint + Socket.IO handler
        ├── middleware/
        │   ├── auth.middleware.ts  # JWT verify
        │   ├── validate.middleware.ts # Zod request validation
        │   └── error.middleware.ts
        ├── websocket/
        │   └── syncHandler.ts      # Socket.IO LAN sync events
        ├── database/
        │   ├── connection.ts       # MongoDB connect
        │   └── models/             # Mongoose models (mirror Dexie schema)
        └── shared/
            ├── types/
            └── utils/
                └── gradeCompute.ts # server-side grade validation util
```

---

## Attendance Status

```ts
type AttendanceStatus = "present" | "absent" | "late" | "excused";
type Session = "AM" | "PM";
type GradeComponent = "WW" | "PT" | "QA";
type SyncStatus = "pending" | "synced" | "failed";
type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
```

---

## Role Hierarchy

```
super_admin
  └── school_admin
        └── advisory_teacher   (owns the section/classroom)
              └── subject_teacher  (assigned to a class load only)
```

### Role rules

- `subject_teacher` — can only submit attendance within their assigned schedule window (±15 min).
- `advisory_teacher` — owns the classroom; can take attendance for any subject in their advisory section; cannot be overridden by subject teachers.
- `school_admin` — can manage all teachers, classes, and students within their school.
- `super_admin` — cross-school access; manages school onboarding.

---

## Coding Conventions

### General

- TypeScript strict mode — no `any`, no implicit returns.
- Functional components only; no class components.
- Controller → Service pattern (backend); keep controllers thin.
- Zod for all backend validation; React Hook Form + Zod on frontend.
- Named exports only — no default exports except page-level route components.
- Prefer extracting sub-components into separate files over long single-file components.

### Naming

| Type          | Convention                  |
| ------------- | --------------------------- |
| Files         | `kebab-case.ts`             |
| Components    | `PascalCase.tsx`            |
| Hooks         | `useFeatureName.ts`         |
| Services      | `featureName.service.ts`    |
| Controllers   | `featureName.controller.ts` |
| Zod schemas   | `featureName.schema.ts`     |
| Dexie helpers | `featureName.db.ts`         |

### Frontend rules

- All Axios calls go through `src/services/http.ts` — never import Axios directly in components.
- All Dexie reads/writes go through `src/db/` helpers — never access `db` directly in components or hooks.
- Every offline mutation must follow this exact sequence:
    1. Write to Dexie
    2. Push to `syncQueue`
    3. Update Zustand store / invalidate TanStack Query cache
    4. Return optimistic success to UI
- TanStack Query wraps all async data fetching; no raw `useEffect` for data.
- Grade computation always runs via `shared/utils/gradeCompute.ts` — never inline.
- LRN must pass `validateLRN()` before any student write.

### Backend rules

- All routes validated with Zod middleware before reaching controller.
- JWT auth middleware on all protected routes.
- Every controller method wrapped in try/catch; errors forwarded to error middleware.
- MongoDB queries live in service layer only — never in controllers or routes.
- Grade computation on backend is for validation only; client-computed value is accepted if server re-validates it matches.

---

## Grading Utilities (shared logic)

```ts
// frontend/src/shared/utils/gradeCompute.ts

export function computeQuarterlyGrade(
	wwScores: { score: number; max: number }[],
	ptScores: { score: number; max: number }[],
	qa: { score: number; max: number },
	weights = { ww: 0.2, pt: 0.6, qa: 0.2 },
): {
	wwWeighted: number;
	ptWeighted: number;
	qaWeighted: number;
	initialGrade: number;
	transmutedGrade: number;
};

export function transmute(initialGrade: number): number;
// Uses DepEd transmutation table from shared/constants/transmutation.ts
```

---

## Zustand Stores

| Store             | File                                    | Manages                                   |
| ----------------- | --------------------------------------- | ----------------------------------------- |
| `authStore`       | `modules/auth/authStore.ts`             | current user, tokens, device ID           |
| `classroomStore`  | `modules/classrooms/classroomStore.ts`  | active class loads, selected section      |
| `attendanceStore` | `modules/attendance/attendanceStore.ts` | current session state, unsaved status     |
| `gradebookStore`  | `modules/gradebook/gradebookStore.ts`   | active class load, unsaved grade cells    |
| `syncStore`       | `modules/sync/syncStore.ts`             | queue count, connection status, last sync |
| `uiStore`         | `app/uiStore.ts`                        | sidebar open, active modals, toasts       |

---

## Key Files

| File                                             | Purpose                                       |
| ------------------------------------------------ | --------------------------------------------- |
| `frontend/src/db/schema.ts`                      | Dexie DB instance + all 11 table definitions  |
| `frontend/src/services/http.ts`                  | Axios instance with JWT interceptor + refresh |
| `frontend/src/services/socket.ts`                | Socket.IO client, LAN sync events             |
| `frontend/src/offline/syncQueue.ts`              | enqueue, dequeue, retry sync operations       |
| `frontend/src/offline/backgroundSync.ts`         | drain queue on reconnect / on interval        |
| `frontend/src/shared/constants/transmutation.ts` | DepEd grade transmutation lookup table        |
| `frontend/src/shared/utils/gradeCompute.ts`      | computeQuarterlyGrade(), transmute()          |
| `frontend/src/shared/utils/lrn.ts`               | validateLRN() — 12-digit format + check digit |
| `backend/src/index.ts`                           | Express + Socket.IO entry point               |
| `backend/src/database/connection.ts`             | MongoDB connection                            |
| `backend/src/websocket/syncHandler.ts`           | LAN sync Socket.IO event handlers             |

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_VERSION=1.0.0
```

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aralsync
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

---

## Phased Roadmap

### Phase 1 — Core Attendance System (current)

- [ ] Project scaffold (monorepo, Vite, Tailwind v4, shadcn/ui, PWA plugin)
- [ ] Dexie schema — all 11 tables with indexes
- [ ] Zustand stores: `authStore`, `syncStore`, `uiStore`
- [ ] Auth module: register, login, JWT refresh, device fingerprint
- [ ] Class load setup: create section, assign subject, set component weights
- [ ] Student management: add, import via CSV (LRN-validated), list
- [ ] Attendance module: schedule-gated form, AM/PM sessions, bulk mark
- [ ] Offline sync queue: enqueue on write, drain on reconnect
- [ ] LAN sync: Socket.IO peer discovery + record push

### Phase 2 — Gradebook & Academic Records

- [ ] Grade entry UI: WW / PT / QA inline-editable table per class load
- [ ] Grade computation: `computeQuarterlyGrade()` + transmutation
- [ ] Quarterly grade view: per student, per subject, per quarter
- [ ] Gradebook sync: grade entries through same sync queue

### Phase 3 — Reports & Export

- [ ] SF2 export: PDF + Excel (per class, per month)
- [ ] SF9 export: report card PDF per student
- [ ] SF10 export: permanent academic record PDF
- [ ] Class grade summary: Excel export
- [ ] At-risk report: auto-filtered (attendance < 80% or grade < 75)
- [ ] Honor roll: auto-generated from transmuted quarterly grades

### Phase 4 — Multi-device & Cloud Sync

- [ ] Cloud sync endpoint (batch upsert via REST)
- [ ] Conflict resolution UI (show conflicting records, let teacher resolve)
- [ ] Multi-teacher class load (subject teacher invites)
- [ ] School admin dashboard
- [ ] Push notifications (sync reminders, at-risk alerts)

---

## What NOT To Do

- Do not bypass `syncQueue` — every mutation must be queued even if currently online.
- Do not query MongoDB directly from controllers — service layer only.
- Do not use `localStorage` for auth tokens — use a secure in-memory + Dexie strategy.
- Do not hardcode `localhost` URLs — always use `import.meta.env.VITE_*`.
- Do not compute grades inline in components — always use `gradeCompute.ts`.
- Do not accept student records without a valid LRN — always run `validateLRN()` first.
- Do not add `baseUrl`/`paths` to `backend/tsconfig.json` without `"ignoreDeprecations": "6.0"` (TS 6).
- Do not store transmuted grades without also storing the raw component scores — raw scores are the source of truth.

---

## Response Rules

- Minimal prose. Code first.
- Explain only non-obvious decisions.
- Return diffs/changed blocks for large files — never repeat unchanged code.
- End every response with a Conventional Commit message only.

## Code Generation Constraints

- NEVER generate test scripts, unit tests, or mock files unless explicitly requested.
- NEVER simulate terminal output, console logs, or test runs.
- Focus on delivering the requested core solution only.

## Output Format

Deliver responses using this 2-part structure:

1. **[Code Block]** — clean, functional solution
2. **---**
3. **### Verification Steps** — concise manual QA steps

### Verification schema

- **Run:** exact command, cURL, or action
- **Input/Payload:** data to use
- **Expected Success:** status code, output, or behavior
- **Expected Failure:** error message or boundary behavior
