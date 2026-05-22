# AralSync (Vite + React)

> Teach more. Sync seamlessly.
> Offline-first classroom attendance and academic record system for Philippine DepEd public school teachers.

Single-page React application built with **Vite**, **Tailwind CSS**, **React Router**, and **lucide-react**. All data is hardcoded fixtures — no backend.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Build for production:

```bash
npm run build
npm run preview
```

## Routes

| Path           | Component                          | Description                               |
| -------------- | ---------------------------------- | ----------------------------------------- |
| `/`            | `pages/Landing.jsx`                | Marketing landing page                    |
| `/signin`      | `pages/SignIn.jsx`                 | Sign in / 3-step register                 |
| `/app/*`       | `AppShell.jsx`                     | The application (internal nav by state)   |

Inside `/app/*` the navigation is handled by internal `route` state (so the address bar stays on `/app`). Pages: Dashboard, My Classes (+ detail), Students (+ profile), Attendance, Schedules, Gradebook, Reports, Admin Console, Sync Center, Settings.

## File layout

```
aralsync-vite/
├── index.html              · Vite HTML entry
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            · React DOM render
    ├── App.jsx             · React Router definition
    ├── AppShell.jsx        · App layout, internal routing, Tweaks panel
    ├── index.css           · Tailwind layers + design tokens + animations
    ├── data/
    │   └── mockData.js     · All hardcoded fixtures (teacher, classes, students…)
    ├── components/
    │   └── index.jsx       · Reusable UI primitives (Card, Modal, Btn, Avatar, etc.)
    ├── layout/
    │   └── index.jsx       · Sidebar, TopBar, MobileTabBar, MoreSheet
    ├── lib/
    │   └── tweaks.jsx      · Tweak host protocol + form controls
    └── pages/
        ├── Landing.jsx
        ├── SignIn.jsx
        ├── Dashboard.jsx
        ├── Classes.jsx     · Class list + Class Detail with 5 tabs
        ├── Students.jsx    · Student list + Student Profile with 4 tabs
        ├── Attendance.jsx  · The priority page — keyboard-first roll call
        ├── Schedules.jsx   · Weekly time-block builder
        ├── Gradebook.jsx   · WW / PT / QA inline editor
        ├── Reports.jsx     · SF2 / SF9 / SF10 + summary reports
        ├── Admin.jsx       · School-wide admin console
        ├── Sync.jsx        · Offline / LAN / Cloud sync center
        └── Settings.jsx    · Profile, school, grading, sync, devices
```

## Design system

| Token            | Value      |
| ---------------- | ---------- |
| Primary          | `#0F766E`  |
| Primary light    | `#CCFBF1`  |
| Primary dark     | `#0D5E57`  |
| Accent           | `#10B981`  |
| Navy             | `#0F172A`  |
| Surface          | `#F8FAFC`  |
| Border           | `#E2E8F0`  |
| Muted            | `#64748B`  |
| Danger / Warning / Success | `#EF4444` / `#F59E0B` / `#10B981` |

Attendance status colours:

- Present  `#10B981` / `#065F46`
- Late     `#F59E0B` / `#78350F`
- Absent   `#EF4444` / `#7F1D1D`
- Excused  `#8B5CF6` / `#4C1D95`

Typography: **Inter** (400/500/600/700/800) + **JetBrains Mono** for tabular numerals.

## DepEd context

The app bakes in DepEd Order 8, s. 2015 grading:

- Component weights per subject (defaults WW 20% / PT 60% / QA 20%, configurable).
- Quarterly grade = `(WW × ww%) + (PT × pt%) + (QA × qa%)` then transmuted to a passing scale.
- Honor tiers: With Highest Honors ≥ 98 · High Honors 95–97 · With Honors 90–94.
- Official forms surfaced in Reports: **SF2** (daily attendance), **SF9** (report card), **SF10** (permanent record).

## Tweaks panel

The Tweaks panel (bottom-right) exposes:

- Accent colour
- Layout density
- Online / offline toggle (simulated connection)
- Pending sync record count
- Dashboard shortcut tip

It uses the host's `__edit_mode_*` protocol so values persist between the markers in `AppShell.jsx`.

## Notes on architecture

- **Single-file pages** — each page is a self-contained module. They share state with `AppShell` via props, not context, to keep the data flow obvious.
- **lucide-react** is loaded as a normal dependency. The `<Icon name="kebab-case"/>` wrapper maps kebab-case strings to PascalCase Lucide components so the prototype's call sites carry over verbatim.
- **Landing / SignIn** are React components that mount their original HTML through `dangerouslySetInnerHTML` and reattach the page-level scripts in a `useEffect`. The Lucide UMD bundle is loaded on demand for these two routes only.

## License

MIT — built for Philippine public school teachers.
