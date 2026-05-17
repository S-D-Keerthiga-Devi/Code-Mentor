# Code Mentor

**Code Mentor** is an AI-powered web platform that transforms the coding learning experience through an intelligent, guided environment. It combines a full-featured Smart IDE, multi-agent AI code analysis, real-time collaboration, and adaptive tutoring to make learning to code deeply engaging and effective.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)


## Features

### 🧠 Smart IDE (`/safe-suggest`)
A VS Code-style code editor with built-in intelligence:
- **Monaco Editor** with syntax highlighting for **JavaScript** and **Python**
- **Serverless Code Execution** — Run code directly in the browser, powered by the **JDoodle API**
  - Detects all failure types (runtime errors, timeouts, infinite loops, crashes) using JDoodle's `memory: null` signal
  - Integrated **xterm.js** terminal with formatted output
  - On execution failure, surfaces an **AI Study Guide** CTA to generate a personalised learning path
- **Socratic Heatmap Analysis** — Multi-agent AI scans code for security, performance, and style issues, overlaying colour-coded hints directly in the editor
  - 🔴 **Security** (AppSec Lead Agent) — Detects SQLi, XSS, exposed secrets
  - 🟡 **Performance** (Systems Architect Agent) — Big-O complexity, memory leaks, inefficient structures
  - 🟢 **Style** (Tech Lead Agent) — DRY violations, bad naming, clean code principles
  - Three pedagogy modes: **Green** (direct hints), **Yellow** (conceptual), **Red** (pure Socratic)
- **Quick Action Floating Menu** — Hover-expand lightbulb menu on flagged lines: Explain in Chat, Auto-Fix, Read Hint
- **Visual Debugger** — Sends code to a React Flow canvas for algorithm flow visualisation with animated edge pulses
- **AI Chat Panel** — Persistent in-editor AI assistant for Socratic tutoring and code explanations
- **File Explorer** — Multi-file workspace with per-file language and content tracking

### 👥 Collaboration Room
- Real-time collaborative code editing powered by **Yjs** + **y-websocket** (CRDTs)
- **Live cursor tracking** with per-user colour overlays
- **Active Users List** with avatar indicators
- **Integrated Room Chat** with AI Mentor via `/ai [question]` slash command

### 📊 Dashboards
- **Student Dashboard** — Progress tracking, AI course bot (`StudentCourseBot`), run history, knowledge packs
- **Instructor Dashboard** — Upload and manage course materials (PDF parsing via `pdf-parse`), view student activity
- **Admin Panel** — Full user management, inquiry tracking (F1–F3 website, L1–L2 advertisement), analytics, PDF export for tutor inquiries

### 🔐 Authentication
- **Clerk** — Primary auth (sign-up, sign-in, OAuth callbacks, role-based routing)
- **JWT** — Stateless token auth for API routes
- **Email Verification** & **Password Reset** flows via Nodemailer

### 🤖 AI & Agent Orchestration
- **Gemini API** (primary) with model cascade: `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-pro-latest`
- **Groq API** (Llama-3.3-70b) as fallback when Gemini quota is exhausted
- Agentic loop with `test_code` tool — AI agents can execute code themselves to verify bugs before issuing hints
- **Rate-limit-aware mock heatmap** — Returns pattern-matched hints when both providers hit quota limits


## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Terminal** | xterm.js (`@xterm/xterm`, `@xterm/addon-fit`) |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB, Mongoose |
| **Real-time** | Socket.io, Yjs, y-websocket |
| **Code Execution** | JDoodle API (Node.js 17, Python 3.9, C++ 17, Java 17) |
| **AI Providers** | Google Gemini API, Groq API (Llama-3) |
| **Visual Debugger** | React Flow, Dagre (hierarchical layout) |
| **Authentication** | Clerk, JWT, Nodemailer |
| **State Management** | Redux Toolkit |
| **Deployment** | Vercel (frontend), backend hosted separately |


```
Code-Mentor/
│
├── frontend/                        # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── SmartEditor/         # Core IDE components
│       │   │   ├── SmartIDE.jsx        # IDE layout shell
│       │   │   ├── EditorWorkspace.jsx # Monaco editor + Socratic heatmap + toolbar
│       │   │   ├── TerminalPanel.jsx   # xterm.js terminal + execution output + AI study guide CTA
│       │   │   ├── SidebarExplorer.jsx # File explorer panel
│       │   │   └── AIChatPanel.jsx     # In-editor AI chat assistant
│       │   ├── VisualDebugger/      # React Flow algorithm visualiser
│       │   ├── Collaboration/       # Real-time collaboration room + chat
│       │   └── dashboard/           # Shared dashboard widgets
│       ├── pages/
│       │   ├── SafeSuggest.jsx      # Smart IDE entry page (/safe-suggest)
│       │   ├── student/             # StudentDashboard, StudentCourseBot
│       │   ├── instructor/          # InstructorDashboard, InstructorMaterials
│       │   └── Dashboard.jsx        # Role-router dashboard
│       ├── services/
│       │   └── api.js               # Axios API service layer
│       ├── context/
│       │   └── IDEContext.jsx       # IDE-wide state (files, chat, terminal)
│       └── store/
│           └── ideSlice.js          # Redux slice for visualiser state
│
├── backend/                         # Node.js + Express.js API server
│   ├── controllers/
│   │   ├── executionController.js      # JDoodle code execution + isError flag
│   │   ├── agenticAnalysisController.js # Multi-agent Socratic heatmap (Gemini + Groq)
│   │   ├── aiController.js             # AI chat, course generation, auto-fix
│   │   ├── authController.js           # JWT auth, email verify, password reset
│   │   ├── bootCampController.js       # JDoodle bootcamp execution
│   │   ├── courseMaterialController.js # Instructor material upload (PDF parsing)
│   │   ├── userRoleController.js       # Role management (student/teacher/admin)
│   │   ├── visualDebuggerController.js # React Flow node/edge generation via AI
│   │   └── userController.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── UserRole.js
│   │   ├── CourseMaterial.js
│   │   ├── InteractionLog.js
│   │   └── SuggestionLog.js
│   ├── routes/
│   │   ├── safeSuggest.js           # /execute, /analyze, /visualDebugger
│   │   ├── aiRoutes.js              # /chat, /course, /autofix
│   │   ├── authRoutes.js
│   │   ├── collaborationRoutes.js
│   │   ├── courseMaterialRoutes.js
│   │   └── userRoleRoutes.js
│   ├── socket/                      # Socket.io real-time event handlers
│   ├── utils/
│   │   └── executeCodeTool.js       # Internal tool used by AI agents to run code
│   ├── server.js                    # Express app entry point
│   └── yjsServer.js                 # y-websocket server for CRDT collaboration
│
├── vercel.json                      # Vercel deployment config
└── README.md
```

> **Note:** `.env` files in both `frontend/` and `backend/` are git-ignored. See [Environment Variables](#environment-variables) below.


## Environment Variables

### `backend/.env`
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret

NODEMAILER_EMAIL=your_smtp_email
NODEMAILER_PASS=your_smtp_password
```

### `frontend/.env`
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```


## Installation

1. **Clone the repository:**
```bash
git clone https://github.com/S-D-Keerthiga-Devi/Code-Mentor.git
cd Code-Mentor
```

2. **Install backend dependencies:**
```bash
cd backend
npm install
```

3. **Install frontend dependencies:**
```bash
cd ../frontend
npm install
```

4. **Create `.env` files** in both `frontend/` and `backend/` using the variables listed above.


## Usage

**Start the backend server:**
```bash
cd backend
npm run server
```

**Start the Yjs collaboration server** (in a separate terminal):
```bash
cd backend
node yjsServer.js
```

**Start the frontend dev server:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

| Route | Description |
|---|---|
| `/` | Landing page |
| `/safe-suggest` | Smart IDE (code editor + terminal + AI analysis) |
| `/visual-debugger` | Algorithm flow visualiser |
| `/dashboard` | Role-based student/instructor/admin dashboard |
| `/collaboration/:roomId` | Real-time collaboration room |


## License

This project is licensed under the ISC License.