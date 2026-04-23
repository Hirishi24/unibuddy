# Unibuddy - Attendance Intelligence Platform

Unibuddy is a modern, intelligent web application designed for students to automate the tracking of their academic progress. It securely interacts with the student portal (specifically tailored for SRM University AP) to provide real-time updates on attendance, live class statuses, and dynamic schedule analytics.

## 🚀 Core Features

- **Automated Portal Integration**: Eliminates manual data entry by transparently logging into the student portal in the background.
- **AI-Powered Captcha Solving**: Incorporates a microservice with a Convolutional Recurrent Neural Network (CRNN) to seamlessly bypass the student portal's captcha.
- **Attendance Analytics & Bunk Estimator**: Provides deep insights into attendance percentages. Tells you exactly how many classes you can afford to safely miss, or need to attend, to maintain a 75% minimum.
- **Live Class Schedule**: Shows ongoing or next upcoming classes using an interactive "Liquid Glass" gooey UI.
- **Session Management Heartbeat**: Prevents annoying portal timeouts by maintaining an active background connection.

## 🏗️ Architecture & Tech Stack

The application is structured using a hybrid, microservice-inspired architecture:

1. **Frontend (User Interface)**
   - **Tech:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui.
   - **Details:** A responsive, visually excellent UI with modern glassmorphism. It supports dynamic Red/Black dark modes and high-contrast light modes. 
2. **Main Backend (Data & API Layer)**
   - **Tech:** Node.js / Bun, Express, Cheerio, SQLite.
   - **Details:** Orchestrates user authentication, parallel portal data scraping (Attendance, Timetable, Profile), rate-limiting, and intermediate data caching.
3. **AI Captcha Solver Service**
   - **Tech:** Python, PyTorch (Vision), ONNX Runtime.
   - **Details:** Specialized independent service that receives portal captcha images and runs them through a custom-trained AI model to return text predictions.

## 💻 Getting Started (Local Development)

Because Unibuddy relies on multiple services, you must run the components concurrently in separate terminal windows.

### Prerequisites
- Node.js (v18+) and npm
- [Bun](https://bun.sh/) (Recommended for running the API backend)
- Python 3.9+ (For the AI tools)

### Step 1: Start the Backend (API Server)
```bash
cd backend
bun install
bun run dev
```

### Step 2: Start the Frontend (UI Server)
```bash
# In the root project directory
npm install
npm run dev
```
The terminal will display a local URL (e.g., `http://localhost:5173` or `http://localhost:8080`) to view the application in your browser.

### Step 3: Running Python Utilities (Optional)
If you need to interact with the Captcha Solver model or generate Word doc reports (`generate_report.py`):
```bash
# Provide a python virtual environment
python -m venv .venv

# Activate it (Windows)
.venv\Scripts\activate
# Activate it (Mac/Linux)
source .venv/bin/activate

# Install requirements
pip install -r unibuddy-captcha-solver/requirements.txt
```

## 📝 License
MIT


##SoftwareEngineering