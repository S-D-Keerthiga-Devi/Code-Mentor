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
      3. **Analysis Node (Multi-Agent Architecture)**: The backend fans out three highly specialized prompts (AppSec Lead, Performance Architect, Tech Lead) to concurrent subagents using `Promise.all()`.
      4. **Robust Fallbacks**: Each subagent attempts to use Gemini primary modeling, but falls back gracefully to Groq (`llama-3.3-70b-versatile`) on rate limits or failures using an `executeSubAgent` helper, safely returning `[]` to prevent crashes if all models fail.
      5. **Aggregation & Deduplication**: The system aggregates the JSON arrays from all three subagents, standardizes them (parsing out Markdown schemas cleanly), and effectively deduplicates overlapping suggestions (same line and hint) before sending a clean payload to the client.
  - **Dependency Penalty Lightbulb** (Heuristic Auto-Fix):
    - When users click on a Socratic Heatmap wavy underline, a Monaco CodeActionProvider (Lightbulb) offers three actions.
    - Two actions display the hint or send it to chat, while the **⚠️ Auto-Fix** action uses the Agentic AI to surgically replace the single node/line containing the code smell.
    - **Dependency Penalty**: Accepting an auto-fix deducts 1 "Independent Developer Point" proactively by creating an `InteractionLog` entry (`actionType: "auto_fix_penalty"`), discouraging mindless code copying.

### 4. Visual Debugger (Algorithmic Pulse)
- **Tech Stack**: React Flow (`@xyflow/react`), Dagre Layout, Monaco Editor, React, Tailwind CSS.
- **Backend Architecture**: Express controllers, Gemini/Groq AI graph compiler (`generateVisualFlow`).
- **Functionality**:
  - A dynamic, interactive 2D/3D-style map of code execution using **React Flow**, visualizing logic flow as connected nodes (Complexity Nodes).
  - **Auto-Layout (Dagre)**: Utilizes `dagre` to calculate hierarchical layouts and x/y coordinates for nodes, preventing overlapping. Supports Top-Bottom (default) or Left-Right layouts with hardcoded dimensions (`nodeWidth: 250`, `nodeHeight: 150`) for consistency.
  - **Viewport Management (Large Algorithms)**:
    - **Min/Max Zoom**: Configured to `0.05` for massive graphs and up to `2.0` for close-up inspections.
    - **Auto-Fit**: Programmatically calls `fitView` post-generation and pre-simulation to ensure the entire graph is centered and visible.
  - **Intelligent Nodes**: Node colors (`indigo`, `orange`, `red`) and drop shadows scale dynamically based on the Big-O Time Complexity score determined by the AI server.
  - **Pulse Simulation**: Visualizes data flow by animating edges in sequence using a `setInterval` loop. The active step flashes indigo (`#4f46e5`) with a width of 3 to track progress.
  - **Interactive Integration**: Clicking any node automatically scrolls and highlights the corresponding line of code in the adjacent Monaco Editor.
  - **Dual Display Modes**: Segmented local state allowing users to easily pivot between a 50/50 "Split View" (Code + Graph) and a pristine "Full Canvas" mode strictly for massive algorithm viewing.
  - **Scroll Isolation**: Custom configuration ensuring both the React Flow canvas (`panOnScroll={false}`) and Monaco editor (`handleMouseWheel: false`) smoothly pass wheel events to the global window.
- **Integration with AI**:
  - `generateVisualFlowAPI`: Calls the backend to generate nodes and edges from raw code.
  - `optimizeNodeCodeAPI`: Allows users to optimize a specific logical block (node) directly from the canvas.

### 5. Course Material & Smart Study
- **Tech Stack**: MongoDB, Multer, PDF-parse, Gemini AI.
- **Functionality**:
  - **PDF Uploads**: Instructors can upload course materials (PDFs).
  - **Content Extraction**: The system extracts text from uploaded PDFs using `pdf-parse`.
  - **Context-Aware AI**: Students can ask questions, and the AI answers strictly based on the content of the uploaded course materials (Retrieved Augmented Generation - RAG).
  - **n8n Study Guide Generation (AI + Webhook Automation)**:
    - Generates a personalized remediation study guide when code execution fails and the learner needs targeted guidance.
    - **End-to-End Process**:
      1. Frontend calls `generateCourseAPI(...)` in `frontend/src/services/api.js`.
      2. This sends `POST /api/ai/generate-course` with `studentName`, `email`, `code`, `jdoodleError`, and `experienceLevel`.
      3. Route mapping in `backend/routes/aiRoutes.js` forwards the request to `triggerCourseGeneration` in `backend/controllers/aiController.js`.
      4. `triggerCourseGeneration` uses Gemini (`gemini-2.5-flash`) with function calling (`provision_ephemeral_bootcamp`) to generate a structured blueprint:
         - `identified_weakness`
         - `google_doc_title`
         - `Youtube_queries`
         - `article_search_queries`
         - `syllabus_outline`
      5. Backend posts this blueprint to `process.env.N8N_WEBHOOK_URL` via Axios.
      6. n8n receives the payload (`studentName`, `email`, `blueprint`) and continues the automation flow (e.g., generating and delivering the study guide document/resources).
    - **Files Involved**:
      - `frontend/src/services/api.js`
      - `backend/routes/aiRoutes.js`
      - `backend/controllers/aiController.js`
      - `backend/controllers/bootCampController.js` (alternate/legacy variant of the same n8n bootcamp blueprint concept)

### 6. Code Execution Environment
- **Tech Stack**: Node.js `child_process` (Local Execution), `xterm.js` (Frontend Terminal with `@xterm/addon-fit`).
- **Functionality**:
  - Allows users to run JavaScript and Python snippets securely on the local backend engine via `child_process.exec`.
  - Features an integrated `xterm.js` terminal in `CodeSection.jsx` that dynamically outputs `stdout` success logs in green, and `stderr` or compile time execution errors in red.
  - Returns metadata stats like Execution Time and Code Status.

### 7. Dashboard & UI
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
- **Graph Visualization**: React Flow (`@xyflow/react`), Dagre
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

### 5. Visual Debugger (Algorithmic Pulse)
1.  Navigate to the Visual Debugger (`/visual-debugger`) either from the Home page or internal linking.
2.  The Monaco editor on the left will pre-populate with the session code. Click **▶ Generate Pulse**.
3.  **Expected**: The graph perfectly scales inside the right-hand canvas. Nodes are automatically arranged via `dagre` top-to-bottom.
4.  **Interaction**: Click any node on the graph. The corresponding line of code in the Monaco Editor will aggressively highlight in Indigo. Click the node again to dismiss the highlight.
5.  **Layout**: Toggle between **Split View** (50/50 Code/Graph) and **Full Canvas** (100% Graph view). Scroll natively down to the website footer regardless of mouse hover state.

### 6. n8n Study Guide Generation
1.  Trigger the course flow from the frontend action that calls `generateCourseAPI(...)`.
2.  Use input where `code` and `jdoodleError` are both populated (required by backend).
3.  **Expected**: `POST /api/ai/generate-course` returns success with a generated `blueprint`.
4.  **Expected**: Backend posts the payload to `N8N_WEBHOOK_URL` (check n8n webhook run history).
5.  **Expected**: n8n workflow creates/sends the study guide artifacts based on `blueprint` fields and learner metadata.

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
| **Visual Debugger** | ✅ Working | AI fully parses AST logic and time complexity. Client successfully auto-layouts React Flow graph via `dagre`. Clean UI integration. |


