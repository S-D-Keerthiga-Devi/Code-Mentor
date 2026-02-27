# Code Mentor - Project Progress & Documentation

**Code Mentor** is an advanced web-based platform designed to revolutionize coding education through real-time collaboration, AI assistance, and interactive tools.

## 🚀 Key Features Breakdown

### 1. Authentication & User Management
- **Tech Stack**: Clerk (Frontend), JWT & Node.js (Backend).
- **Functionality**:
  - Secure Sign-up/Login via Clerk.
  - Role-based access control (Student vs. Instructor).
  - Profile management and persistent user sessions.

### 2. Real-Time Collaboration Suite
- **Tech Stack**: Yjs, WebSockets (y-websocket, y-webrtc), Socket.io.
- **Components**:
  - **Collaborative Code Editor**: Powered by **Monaco Editor** and **Yjs**, allowing multiple users to edit code simultaneously with syntax highlighting and conflict resolution.
  - **Live Cursors**: Visual indicators (`LiveCursorOverlay`) showing where other users are typing in real-time.
  - **Whiteboard**: Shared drawing canvas (`react-canvas-draw`) for diagrams and brainstorming, synchronized across all connected clients.
  - **Group Chat**: Integrated chat room (`Collaboration/Chat`) for text communication alongside coding.

### 3. AI-Powered Mentorship & Assistance
- **Tech Stack**: Google Gemini API (`gemini-2.5-flash`), Monaco Editor.
- **Features**:
  - **AI Chat Mentor**: An intelligent assistant capable of answering general coding questions (`/api/ai/chat`).
  - **Code Explanation**: Automated code analysis and explanation to help students understand complex logic (`/api/ai/explain`).
  - **Smart Code Assistant** (`SafeSuggest.jsx` & `CodeSection.jsx`): 
    - A dedicated interface where students can write or paste code in JavaScript or Python to receive AI-powered analysis.
    - **Tech Stack**:
      - **Frontend**: React, Monaco Editor (`@monaco-editor/react`), Axios.
      - **Backend**: Node.js, Express, `GoogleGenerativeAI` (Gemini API).
    - **Frontend Workflow**:
      1. User types code into the `<Editor>` and selects a language.
      2. User selects a `dependencyLevel` (Green, Yellow, Red) mapping to how strict the guidance should be.
      3. Clicking **Analyze (Socratic)** triggers an Axios POST to `/api/ai/socratic-heatmap`.
      4. While waiting, the button shows a loading spinner to prevent duplicate requests.
      5. Upon receiving the JSON response (array of "smells"), `CodeSection.jsx` parses the list.
      6. old decorations are cleared via `editor.deltaDecorations(decorations, [])`.
      7. New CSS wavy underlines (`.smell-security`, `.smell-performance`, `.smell-style`) are applied to the targeted AST lines via `deltaDecorations`.
      8. A Custom `HoverProvider` (`monaco.languages.registerHoverProvider`) surfaces the AI's "Socratic Hints" in clean Markdown popups when hovering over the decorated lines.
    - **Backend Workflow (Agentic AI Controller)**:
      1. The `analyzeCodeForHeatmap` controller receives the code, language, and dependency level.
      2. **Pedagogy Node**: The dependency level is dynamically translated into strict instructions (e.g., Red = "Pure Socratic. Analyze the time complexity...").
      3. **Analysis Node**: A highly structured prompt is sent to `gemini-2.5-flash` demanding analysis of Performance, Security, and Best Practices flaws.
      4. The Gemini Model generates the output, strictly constrained to `application/json` response MIME type.
      5. The backend parses the JSON array and returns a standardized response containing the line number, smell type, severity, and the crafted Socratic hint.
  - **Dependency Penalty Lightbulb** (Heuristic Auto-Fix):
    - When users click on a Socratic Heatmap wavy underline, a Monaco CodeActionProvider (Lightbulb) offers three actions.
    - Two actions display the hint or send it to chat, while the **⚠️ Auto-Fix** action uses the Agentic AI to surgically replace the single node/line containing the code smell.
    - **Dependency Penalty**: Accepting an auto-fix deducts 1 "Independent Developer Point" proactively by creating an `InteractionLog` entry (`actionType: "auto_fix_penalty"`), discouraging mindless code copying.

### 4. Course Material & Smart Study
- **Tech Stack**: MongoDB, Multer, PDF-parse, Gemini AI.
- **Functionality**:
  - **PDF Uploads**: Instructors can upload course materials (PDFs).
  - **Content Extraction**: The system extracts text from uploaded PDFs using `pdf-parse`.
  - **Context-Aware AI**: Students can ask questions, and the AI answers strictly based on the content of the uploaded course materials (Retrieved Augmented Generation - RAG).

### 5. Code Execution Environment
- **Tech Stack**: Node.js `child_process` (Local Execution), `xterm.js` (Frontend Terminal with `@xterm/addon-fit`).
- **Functionality**:
  - Allows users to run JavaScript and Python snippets securely on the local backend engine via `child_process.exec`.
  - Features an integrated `xterm.js` terminal in `CodeSection.jsx` that dynamically outputs `stdout` success logs in green, and `stderr` or compile time execution errors in red.
  - Returns metadata stats like Execution Time and Code Status.

### 6. Dashboard & UI
- **Tech Stack**: React, Tailwind CSS, Framer Motion.
- **Features**:
  - **Responsive Design**: Mobile-friendly layout with collapsible sidebars.
  - **Dashboard**: Central hub for accessing courses, collaboration rooms, and settings.
  - **Toasts & Notifications**: Real-time user feedback using `react-toastify`.

---

## 🛠 Tech Stack Overview

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Real-time**: Socket.io-client, Yjs, Y-websocket
- **Auth**: Clerk React SDK
- **Data Fetching**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io, WS (WebSocket)
- **AI Integration**: Google Generative AI SDK
- **File Handling**: Multer, PDF-parse
- **Security**: BCrypt, JWT, CORS, Rate Limiters

## 📂 Project Structure Highlights
- `frontend/src/components/Collaboration`: Contains the core logic for the room, whiteboard, and chat.
- `backend/controllers/courseMaterialController.js`: Handles PDF parsing and AI context generation.
- `backend/controllers/aiController.js`: Implements the dynamic scaffolding logic for AI assistance.
- `backend/models/InteractionLog.js`: Tracks user interactions to determine AI dependency levels.
- `backend/routes/aiRoutes.js`: Exposes endpoints for generic AI chat and explanation.

## 🧪 Testing & Verification Guide

### 1. Dynamic Scaffolding Fading (AI Dependency)
To test the adaptive AI modes:
1.  **Standard Mode (Green)**:
    -   Open the Chat Sidebar.
    -   Type `/ai How do I center a div?`.
    -   **Expected**: The AI provides a full code solution. The badge shows "Mentor Mode: Active".
2.  **Socratic Mode (Red)**:
    -   Paste code into the **Main Code Editor** (not the chat input) 5+ times quickly (simulate dependency).
    -   Type `/ai Write this code for me` in the Chat Sidebar.
    -   **Expected**: The AI refuses to write code and asks a guiding question. The badge changes to "⛔ Dependency Detected".

### 2. Code Execution (Local child_process & Terminal)
1.  Navigate to `/safe-suggest`, ensure JavaScript or Python is selected.
2.  Paste valid syntax code: `console.log("Hello Output!");`
3.  Click **▶ Run Code**.
4.  **Expected**: The built-in `xterm.js` terminal displays a yellow "Compiling and executing..." message, sends the code to the backend `executionController` for local execution, and eventually prints `Hello Output!` in green.

### 3. Real-Time Collaboration
1.  Open the same Room URL in two different browser tabs (e.g., Incognito).
2.  Type in one editor.
3.  **Expected**: The code updates instantly in the second tab, and you see a colored cursor for the other user.

### 4. Socratic Heatmap & Dependency Penalty
1.  Navigate to the Smart Code Assistant (`/safe-suggest`).
2.  Paste poorly optimized code (e.g., a nested loop).
3.  Select a Dependency Level (Green/Yellow/Red) and click **Analyze (Socratic)**.
4.  **Expected**: The AI agent responds with JSON, applying colored wavy underlines (`.smell-performance`, `.smell-security`, `.smell-style`) to problematic lines. Hovering over the line reveals the Socratic Hint tailored to your selected dependency level.
5.  **Bonus**: Click a wavy line. Click the Monaco Lightbulb 💡. Click **⚠️ Auto-Fix**. A toast will confirm a "-1 Point" deduction, and the line will be replaced with corrected code.

## 📊 Feature Verification Status (Latest)

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Authentication** | ✅ Working | Clerk integration is stable. |
| **Real-time Collab** | ✅ Working | Yjs syncing code and cursors. |
| **Dynamic Scaffolding** | ✅ Working | Backend tracks dependency. **Note**: If API quota acts up, "Mock AI" responds to prove logic works. |
| **Code Execution** | ✅ Working | Switched to **Local Execution via child_process**. Streams stdout/stderr directly into frontend `xterm.js` terminal window. |
| **AI Chat** | ⚠️ Limited | Google Gemini Free Tier hits rate limits (429) quickly. Added graceful error handling & mock fallback. |
| **Interaction Logs** | ✅ Working | Tracks `code_paste` events and deducts "Independent Developer Points" via `auto_fix_penalty` entries. |
| **Socratic Heatmap** | ✅ Working | Agentic backend perfectly translates code smells to Socratic hints via Monaco deltaDecorations and HoverProviders. Supports Auto-Fix code actions. |


