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

- **Authentication**: Secure sign-up and login system for users.  
- **Interactive Learning**: Provides coding exercises with AI-assisted hints.  
- **Real-time Feedback**: Validates code submissions and provides instant feedback.  
- **Gamification**: Tracks progress and motivates users through badges and points.  
- **Admin Dashboard**: Manage users, monitor progress, and set coding challenges.  
- **Notifications**: Custom notifications for achievements and deadlines.  


## Tech Stack

- **Frontend**: React, React Native  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **Authentication**: Firebase Authentication  
- **Maps & Geolocation**: Mapbox, Leaflet, Google Maps  
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

