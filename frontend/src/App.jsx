import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import StudentDashboard from "./pages/student/StudentDashboard";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorMaterials from "./pages/instructor/InstructorMaterials";
import StudentCourseBot from "./pages/student/StudentCourseBot";

// Import your Clerk Publishable Key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <ToastContainer theme="dark" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/role-selection"
              element={
                <>
                  <SignedIn>
                    <RoleSelection />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/student/*"
              element={
                <>
                  <SignedIn>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="course-bot" element={<StudentCourseBot />} />
                    </Routes>
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />

            <Route
              path="/instructor/*"
              element={
                <>
                  <SignedIn>
                    <Routes>
                      <Route path="dashboard" element={<InstructorDashboard />} />
                      <Route path="materials" element={<InstructorMaterials />} />
                    </Routes>
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </ClerkProvider>
  );
}

export default App;
