# Unibuddy — SRMAP Attendance Intelligence Platform

## Overview
Unibuddy is a full-stack attendance tracking and analytics platform for SRMAP students. It scrapes the student portal, calculates bunk estimates, tracks daily schedules, and presents real-time attendance data.

## Architecture

### Web App (`/frontend`)
- **Stack**: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
- **Port**: 5000 (external port 80 — main webview)
- **Routing**: React Router v6
- **API proxy**: Vite proxies `/api/*` → `localhost:3001`

### Backend (`/backend`)
- **Stack**: Express + Bun runtime + TypeScript
- **Port**: 3001 (external port 3001)
- **Database**: SQLite via `bun:sqlite` at `backend/data/attendance.db`
- **Auth**: JWT tokens (login → `accessToken` + `sessionId`)
- **CORS**: `origin: "*"` — allows all origins including mobile app

### Captcha Solver (`/unibuddy-captcha-solver/hybrid`)
- **Stack**: Python FastAPI
- **Port**: 6000 (external port 6000)
- Solves SRMAP portal CAPTCHAs using hybrid ML approach

### Mobile App (`/mobile`)
- **Stack**: Expo SDK 54 + React Native + Expo Router
- **Port**: 8080 (Expo Metro dev server)
- **Navigation**: Expo Router (file-based) with bottom tabs
- **Auth**: `expo-secure-store` for JWT token persistence
- **Local storage**: `@react-native-async-storage/async-storage` for attendance + scraped data
- **API**: Calls to `EXPO_PUBLIC_API_URL/api/*` (defaults to Vite proxy URL for CORS compatibility)

## Mobile App Structure
```
mobile/
  app/
    _layout.tsx         # Root layout — AuthProvider + DataProvider + AuthGuard
    index.tsx           # Login screen (SRM credentials or Guest mode)
    (tabs)/
      _layout.tsx       # Bottom tab bar (Home, Schedule, Subjects, Profile)
      index.tsx         # Dashboard — overall stats, ongoing class, subject overview
      schedule.tsx      # Daily schedule — week picker, class cards, attendance marking
      subjects.tsx      # Subjects — filtered list with bunk calculator detail sheet
      profile.tsx       # Profile — academic info, data status, logout
  components/
    ClassCard.tsx       # Individual class block with Present/Absent buttons
    OngoingBanner.tsx   # Live countdown for ongoing/upcoming class
    SubjectRow.tsx      # Subject stats row with percentage bar
  context/
    AuthContext.tsx     # Login state, JWT token, guest mode
    DataContext.tsx     # Scraped data, attendance marking, subject stats calculation
  lib/
    api.ts              # API functions (loginApi, fetchPortalData)
    academicCalendar.ts # SRM AP Even Semester 2026 holiday/override calendar
    timetableUtils.ts   # Parse portal timetable → ClassBlock[]
    guestData.ts        # Hardcoded demo data for guest mode
  types/index.ts        # TypeScript interfaces
  constants/colors.ts   # Dark indigo theme color constants
```

## Workflows
| Name | Command | Port | Type |
|------|---------|------|------|
| Start application | `cd frontend && npm run dev` | 5000 | webview |
| Backend API | `cd backend && bun run dev` | 3001 | console |
| Captcha Solver | `cd unibuddy-captcha-solver/hybrid && python api.py` | 6000 | console |
| Mobile App | `cd mobile && npx expo start --web --port 8080` | 8080 | console |

## Key Data Flow
1. **Login**: POST `/api/auth/login` → `{accessToken, sessionId}`
2. **Fetch portal**: POST `/api/scrape/fetch` with Bearer token → attendance + timetable + profile
3. **Guest mode**: Uses hardcoded dummy data from `mobile/lib/guestData.ts`
4. **Attendance marking**: Local only (AsyncStorage on mobile, localStorage on web)
5. **Stats engine**: Hybrid total = portal conducted + projected future classes to May 4, 2026

## Academic Calendar
- Semester: Jan 5 – May 4, 2026
- Holidays, cancelled days (INFINITUS, mid-terms), day swaps all encoded in `lib/academicCalendar.ts`
- 75% attendance threshold used for bunk/must-attend calculations

## Mobile App Usage
- **For phone testing**: Open "Mobile App" workflow console → scan the QR code with Expo Go
- **API endpoint**: The app defaults to the Vite dev server URL which proxies to the backend
- **Override API**: Set `EXPO_PUBLIC_API_URL` environment variable to change the backend URL

## User Preferences
- Dark theme throughout (both web and mobile)
- Primary color: indigo (`#6366f1`)
- No emojis in code unless explicitly requested
- Keep attendance calculation logic consistent with portal data as the single source of truth
