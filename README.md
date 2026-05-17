# 🚀 Code Mentor

> An AI-powered smart IDE and collaborative learning platform designed to make programming education deeply engaging, guided, and effective.

**Code Mentor** combines a fully-featured browser IDE, multi-agent AI code analysis, real-time collaboration, and adaptive pedagogical tutoring to bridge the gap between learning syntax and mastering software engineering.

---

## 📑 Table of Contents
- [✨ Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started](#-getting-started)
- [🗺️ Navigation](#️-navigation)
- [📄 License](#-license)

---

## ✨ Features

### 🧠 Smart IDE (`/safe-suggest`)
* **Serverless Execution:** Run JavaScript and Python natively in the browser via the **JDoodle API** with an integrated `xterm.js` terminal.
* **Socratic Heatmap:** Multi-agent AI scans code and overlays color-coded hints in the Monaco editor:
  * 🔴 **Security:** Detects vulnerabilities (SQLi, XSS).
  * 🟡 **Performance:** Highlights Big-O inefficiencies and memory leaks.
  * 🟢 **Style:** Enforces clean code principles (DRY, naming conventions).
* **Adaptive Tutoring:** AI scales from direct hints to pure Socratic questioning based on the student's dependency level.
* **Visual Debugger:** Sends algorithms to a **React Flow** canvas for dynamic, animated flow visualization.

### 👥 Real-Time Collaboration
* **Multiplayer Coding:** Conflict-free, real-time collaborative editing powered by **Yjs** and WebSockets.
* **Live Presence:** Per-user color overlays, live cursors, and an active user list.
* **AI Chat Room:** Integrated room chat featuring an AI Mentor accessible via the `/ai` command.

### 📊 Role-Based Dashboards
* **Students:** Track progress, access AI course bots, and review run histories.
* **Instructors:** Upload and parse PDFs for course materials, and monitor student activity.
* **Admins:** Manage users, track inquiries, and export analytics.

### 🤖 Resilient AI Architecture
* **Model Cascade:** Uses **Google Gemini** (2.0 Flash → 1.5 Flash → Pro) with a seamless fallback to **Groq (Llama-3)** to prevent quota exhaustion.
* **Agentic Execution:** AI agents can autonomously execute code to verify bugs before surfacing hints.

---

## 🛠 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit |
| **Editor & Tools** | Monaco Editor, xterm.js, React Flow, Dagre |
| **Backend** | Node.js, Express.js v5 |
| **Database** | MongoDB, Mongoose |
| **Real-Time** | Socket.io, Yjs, y-websocket |
| **AI & Execution**| Google Gemini API, Groq API, JDoodle API |
| **Auth & Security** | Clerk, JWT, Nodemailer |

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