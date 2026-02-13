# Code Mentor

**Code Mentor** is a web-based platform designed to enhance the coding learning experience by providing an interactive and guided environment for developers. It combines the power of AI-assisted learning, project management tools, and gamification to make coding education more effective and engaging.



## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Installation](#installation)  
- [Usage](#usage)  
- [Contributing](#contributing)  
- [License](#license)  


## Features

- **Authentication**: Secure sign-up and login system for users via Clerk & Firebase.
- **Real-time Collaboration**:
    -   **Code Editor**: Collaborative coding with syntax highlighting (Monaco Editor) and live cursor tracking (Yjs).
    -   **Whiteboard**: Shared drawing canvas for brainstorming ideas.
    -   **Chat**: Integrated room chat with slash commands.
- **AI Assistance**:
    -   **AI Chat**: Built-in AI Mentor accessible via `/ai [question]` command in chat.
    -   **Smart Suggestions**: AI-powered code improvements and explanations.
- **Code Execution**: Run JavaScript, Python, and C++ code directly in the browser (powered by Piston API).
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices with collapsible drawers and overlays.
- **Gamification**: Tracks progress and motivates users through badges and points.
- **Admin Dashboard**: Manage users, monitor progress, and set coding challenges.


## Tech Stack

- **Frontend**: React, Tailwind CSS, Monaco Editor
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MongoDB
- **Collaboration**: Yjs, y-websocket, y-indexeddb
- **AI & Execution**: Gemini API, Piston API
- **Authentication**: Clerk, Firebase
- **State Management**: Redux Toolkit


## Project Structure

```

Code-Mentor/
│
├── frontend/             # React frontend application
│   ├── public/
│   └── src/
│
├── backend/              # Express backend server
│   ├── controllers/
│   ├── models/
│   └── routes/
│
├── .gitignore            # Git ignore file
└── README.md

````

> **Note:** `.env` files in both `frontend` and `backend` are ignored for security.



## Installation

1. Clone the repository:

```bash
git clone https://github.com/S-D-Keerthiga-Devi/Code-Mentor.git
cd Code-Mentor
````

2. Install dependencies for backend:

```bash
cd backend
npm install
```

3. Install dependencies for frontend:

```bash
cd ../frontend
npm install
```

4. Create `.env` files in both `frontend` and `backend` with your environment variables.



## Usage

* **Start Backend Server:**

```bash
cd backend
npm run server
```

* **Start Frontend Server:**

```bash
cd frontend
npm run dev
```

```
* Open [http://localhost:5173](http://localhost:5173) in your browser to view the frontend.

```

