# Unibuddy - Attendance Intelligence Platform

Unibuddy is a modern, intelligent web application designed for students to automate the tracking of their academic progress. It securely interacts with the student portal (specifically tailored for SRM University AP) to provide real-time updates on attendance, live class statuses, and dynamic schedule analytics.

## 🚀 Project Structure

The project is organized into three specialized directories for independent deployment:

- **`/frontend`**: The React/Vite user interface.
- **`/backend`**: The Node.js/Express API and scraping engine.
- **`/unibuddy-captcha-solver`**: The Python/AI service for captcha recognition.

---

## 🏗️ Architecture & Tech Stack

1. **Frontend (User Interface)**
   - **Tech:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui.
   - **Deployment:** [Vercel](https://vercel.com) (Recommended) or Netlify.
2. **Main Backend (Data & API Layer)**
   - **Tech:** Node.js / Bun, Express, Cheerio, SQLite.
   - **Deployment:** [Render](https://render.com) or Railway.
3. **AI Captcha Solver Service**
   - **Tech:** Python, FastAPI, PyTorch, ONNX Runtime.
   - **Deployment:** [Render](https://render.com) (Web Service) or Koyeb.

---

## 💻 Local Development

To run the full system locally, you must start each service in its own terminal:

### 1. Start the Backend (API Server)
```bash
cd backend
bun install
bun run dev
```

### 2. Start the Frontend (UI Server)
```bash
cd frontend
npm install
npm run dev
```

### 3. Start the AI Captcha Solver
```bash
cd unibuddy-captcha-solver
# Activate your venv if needed
python hybrid/api.py
```

---

## ☁️ Deployment Strategy (Free Tier)

For a university project viva, the following stack is recommended for free hosting:

| Service | Platform | Link |
| :--- | :--- | :--- |
| **Frontend** | Vercel | [vercel.com](https://vercel.com) |
| **Main Backend** | Render | [render.com](https://render.com) |
| **Captcha Solver** | Render | [render.com](https://render.com) |

> [!TIP]
> When deploying the Backend and Captcha Solver on Render, the first request might take ~30 seconds as the free instance "wakes up" from sleep.

---

## 📝 License
MIT

## #SoftwareEngineering