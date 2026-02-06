# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Planr** is a work planning application ("werkplanning") for Moeyersons, a Belgian company specializing in vehicle modifications and custom builds (trucks, trailers, mobile workshops, medical vans, TV broadcast vans, military/police vehicles). The UI is in Dutch.

Deployed on Vercel.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:8080
npm run build      # Production build (Vite)
npm run build:dev  # Development mode build
npm run lint       # ESLint
npm run preview    # Preview production build
```

Both npm and Bun are available (bun.lockb present).

## Tech Stack

- **React 18** + **TypeScript** + **Vite** (SWC plugin for fast refresh)
- **Tailwind CSS 3** with CSS variables for theming (light/dark mode via `next-themes`)
- **shadcn/ui** (50+ Radix UI components in `src/components/ui/`)
- **TanStack React Query** for async state
- **react-router-dom** for routing
- **react-hook-form** + **Zod** for forms/validation
- **date-fns** for date operations
- **recharts** for charts
- **sonner** for toast notifications
- **lucide-react** for icons

## Architecture

### Routing (`src/App.tsx`)

Three routes wrapped in QueryClientProvider + TooltipProvider:
- `/` — Main page with tabbed interface (Dashboard, Planning, Projecten, Medewerkers, Admin)
- `/project/:id` — Project detail view
- `/admin` — Admin management (also available as a tab on the main page)

### Component Structure

```
src/components/
├── ui/              # shadcn/ui primitives — do not edit directly, use `npx shadcn-ui@latest add <component>`
├── Admin/           # AdminView, ProjectTypesManager, TasksManager
├── Calendar/        # CalendarView, CalendarControls, CalendarDayCell
├── Employees/       # EmployeesView
├── Gantt/           # GanttView, GanttProjectRow, GanttHeader
├── Projects/        # ProjectsView, ProjectDetail, ProjectTaskList
├── Dashboard.tsx    # Statistics and project overview
├── DragDropScheduler.tsx  # Drag-and-drop task scheduling
├── Navbar.tsx       # Top nav with project creation dialog
└── ProjectCard.tsx
```

### Data Layer (`src/data/dummyData.ts`)

Currently uses in-memory dummy data — no backend. Core types:

- **Project** — has `type` (one of 8 project types), `status` ("nieuw"|"lopend"|"afgerond"), contains `tasks[]`
- **Task** — has `status` ("nieuw"|"gepland"|"bezig"|"afgerond"), `duration`, linked to a project
- **User** — employees with roles and skills

`getDefaultTasksForProjectType(type)` generates type-specific task templates (e.g., "kastbouw" gets 7 tasks from measurements through quality control).

### Project Types

Eight vehicle project categories, each with a distinct color defined in `tailwind.config.ts` and task templates in `dummyData.ts`:

| Key | Label | Color |
|-----|-------|-------|
| kastbouw | Kastopbouw | Blue |
| herstelling | Herstelling | Red |
| spuiterij | Spuiterij | Amber |
| maatwerk | Maatwerk | Emerald |
| mobiel | Mobiele werkplaats | Purple |
| medisch | Medische wagen | Pink |
| tv | TV-wagen | Indigo |
| leger | Leger & Politie | Dark green |

### Path Aliases

`@/*` maps to `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`). All imports use this alias.

## TypeScript Configuration

Lenient settings — `strictNullChecks: false`, `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false`. The ESLint config also has `@typescript-eslint/no-unused-vars: "off"`.

## Styling Conventions

- Colors use CSS variables via HSL (defined in `src/index.css`), referenced as `hsl(var(--primary))` in Tailwind config
- Project type colors are direct hex values in `tailwind.config.ts`
- Font: Inter
- Custom animation: `task-highlight` (pulsing blue glow for task emphasis)
- Additional calendar/Gantt styles in `src/styles.css`
