# 🚀 Code Mentor

> An AI-powered smart IDE and collaborative learning platform designed to make programming education deeply engaging, guided, and effective.

**Code Mentor** combines a fully-featured browser IDE, multi-agent AI code analysis, real-time collaboration, adaptive pedagogical tutoring, and automated workflows to bridge the gap between learning syntax and mastering software engineering.

---

## 📑 Table of Contents

* [✨ Features](#-features)
* [🛠 Tech Stack](#-tech-stack)
* [⚙️ Environment Variables](#️-environment-variables)
* [🚀 Getting Started](#-getting-started)
* [🗺️ Navigation](#️-navigation)
* [📄 License](#-license)

---

## ✨ Features

### 🧠 Smart IDE (`/safe-suggest`)

* **Serverless Execution:** Run JavaScript and Python in the browser via the **JDoodle API** with an integrated `xterm.js` terminal. All failure types (runtime errors, timeouts, infinite loops) are detected using JDoodle's `memory: null` signal.
* **Socratic Heatmap:** Three concurrent AI agents scan code and overlay colour-coded hints in Monaco — 🔴 Security (SQLi, XSS), 🟡 Performance (Big-O, memory leaks), 🟢 Style (DRY, naming). Hint depth adapts across Green / Yellow / Red pedagogy modes.
* **AI Chat Panel:** Persistent in-editor assistant for Socratic tutoring, code explanations, and auto-fix suggestions.

### 📚 AI-Powered Study Guide (n8n Workflow)

When execution fails, a *"Generate Custom Study Guide"* button appears in the terminal. Clicking it:

1. Sends the error and code to **Gemini 2.5 Flash**, which uses a structured tool to build a course blueprint (identified weakness, YouTube queries, article links, 3-step syllabus).
2. POSTs the blueprint to an **n8n webhook**, which automatically creates a **Google Doc**, sends it to the student's **Google Drive**, and delivers a personalised **email**.

### 🎨 Visual Debugger

* Sends code to a **React Flow** canvas where AI generates a hierarchical node graph of the algorithm's logic, with animated edge pulses to simulate execution flow step by step.

### 👥 Real-Time Collaboration

* **Multiplayer Coding:** Conflict-free real-time collaborative editing powered by **Yjs** CRDTs over WebSockets.
* **Live Presence:** Per-user color overlays, live cursors, and an active user list.
* **AI Chat Room:** Integrated room chat with an AI Mentor accessible via the `/ai` slash command.

### 📊 Role-Based Dashboards

* **Students:** Track progress, access AI course bots, and review run histories.
* **Instructors:** Upload and parse PDFs for course materials, and monitor student activity.
* **Admins:** Manage users, track multi-channel inquiries (F1–F3 website, L1–L2 advertisement), and export analytics as PDF.

### 🤖 Resilient AI Architecture

* **Model Cascade:** Uses **Google Gemini** (2.0 Flash → 1.5 Flash → Pro) with a seamless fallback to **Groq (Llama-3.3-70b)** to prevent quota exhaustion.
* **Agentic Execution:** AI agents can autonomously execute code via a `test_code` tool to verify bugs before surfacing hints.
* **Rate-Limit-Aware Fallback:** Returns pattern-matched mock heatmap hints when both AI providers hit quota limits.

---

## 🛠 Tech Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit |
| **Editor & Tools** | Monaco Editor, xterm.js, React Flow, Dagre |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB, Mongoose |
| **Real-Time** | Socket.io, Yjs, y-websocket |
| **AI & Execution** | Google Gemini API, Groq API (Llama-3), JDoodle API |
| **Auth & Security** | Clerk, JWT, Nodemailer |
| **Automation** | **n8n** (Study Guide generation, Google Docs, Email delivery) |

---

## ⚙️ Environment Variables

Create `.env` files in both the `frontend` and `backend` directories before running the application.

**`backend/.env`**

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key

JDOODLE_CLIENT_ID=your_jdoodle_client_id
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret

NODEMAILER_EMAIL=your_smtp_email
NODEMAILER_PASS=your_smtp_password

# n8n — receives the Gemini-generated course blueprint and creates the Google Doc + email
N8N_WEBHOOK_URL=http://localhost:5678/webhook/your_endpoint
```

**`frontend/.env`**

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Getting Started

**1. Clone the repository:**

```bash
git clone https://github.com/S-D-Keerthiga-Devi/Code-Mentor.git
cd Code-Mentor
```

**2. Install dependencies:**

```bash
cd backend && npm install
cd ../frontend && npm install
```

**3. Configure `.env` files** in both `frontend/` and `backend/` using the variables above.

**4. Start the backend server:**

```bash
cd backend
npm run server
```

**5. Start the Yjs collaboration server** (separate terminal):

```bash
cd backend
node yjsServer.js
```

**6. Start n8n for study guide automation** (separate terminal):

```bash
npx n8n
```

> Configure your n8n workflow at [http://localhost:5678](http://localhost:5678) to receive the webhook, create the Google Doc, and send the student email.

**7. Start the frontend dev server:**

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗺️ Navigation

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/safe-suggest` | Smart IDE — code editor, terminal, AI heatmap analysis |
| `/visual-debugger` | Algorithm flow visualiser (React Flow) |
| `/dashboard` | Role-based student / instructor / admin dashboard |
| `/collaboration/:roomId` | Real-time multiplayer collaboration room |

---

## 📄 License

This project is licensed under the ISC License.