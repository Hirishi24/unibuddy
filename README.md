# Unibuddy - Attendance Intelligence Platform

Unibuddy is a modern, intelligent platform designed for SRMAP students to automate tracking of academic progress. It securely interacts with the SRM University AP student portal to provide real-time attendance updates, live class statuses, dynamic schedule analytics — available as both a web app and a native mobile app.

## Project Structure

The project is organized into four specialized directories for independent deployment:

- **`/frontend`** — React/Vite web interface
- **`/backend`** — Node.js/Express API and scraping engine
- **`/mobile`** — Expo React Native mobile app (iOS & Android)
- **`/unibuddy-captcha-solver`** — Python/AI service for captcha recognition

---

## Architecture & Tech Stack

1. **Frontend (Web UI)**
   - Tech: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
   - Deployment: [Vercel](https://vercel.com) or Netlify

2. **Main Backend (Data & API Layer)**
   - Tech: Node.js / Bun, Express, Cheerio, SQLite
   - Deployment: [Render](https://render.com) or Railway

3. **Mobile App (iOS & Android)**
   - Tech: Expo, React Native, TypeScript
   - Features:
     - Dynamic Island-style notification banner with animated reveal
     - Attendance tracking with bunk calculator
     - Live class schedule with mark present/absent
     - Subject-wise stats with 75% compliance alerts
     - Guest/demo mode (no login required to explore)
     - Works offline with locally cached portal data
   - Deployment: Expo Go (development) / EAS Build (production APK/IPA)

4. **AI Captcha Solver Service**
   - Tech: Python, FastAPI, PyTorch, ONNX Runtime
   - Deployment: [Render](https://render.com) or Koyeb

---

## Local Development

Start each service in its own terminal:

### 1. Backend (API Server)
```bash
cd backend
bun install
bun run dev
# Runs on port 3001
```

### 2. Frontend (Web UI)
```bash
cd frontend
npm install
npm run dev
# Runs on port 5000
```

### 3. Mobile App
```bash
cd mobile
npm install
npx expo start
# Press 'w' for web (port 8080)
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code with Expo Go on your phone
```

### 4. AI Captcha Solver
```bash
cd unibuddy-captcha-solver
python hybrid/api.py
# Runs on port 6000
```

---

## Mobile App — Quick Start

The mobile app connects to the backend at startup. Set the API URL before running:

```bash
# In mobile/.env (create if it doesn't exist)
EXPO_PUBLIC_API_URL=http://localhost:3001
```

For a production backend URL, replace `localhost:3001` with your deployed backend address.

**Guest Mode** — tap "Explore as Guest" on the login screen to browse with demo data, no credentials needed.

---

## Deployment Strategy (Free Tier)

| Service | Platform | Link |
| :--- | :--- | :--- |
| **Frontend** | Vercel | [vercel.com](https://vercel.com) |
| **Backend** | Render | [render.com](https://render.com) |
| **Captcha Solver** | Render | [render.com](https://render.com) |
| **Mobile (Android APK)** | EAS Build | [expo.dev](https://expo.dev) |

> When deploying the Backend and Captcha Solver on Render, the first request may take ~30 seconds as the free instance wakes from sleep.

---

## License
MIT

## #SoftwareEngineering
