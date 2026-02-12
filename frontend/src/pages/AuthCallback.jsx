import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const AuthCallback = () => {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkRole = async () => {
            if (isLoaded && user) {
                localStorage.removeItem("userRole"); // Clear stale role

                // Check if there's a redirect URL from login state
                const redirectTo = location.state?.redirectTo || sessionStorage.getItem('redirectAfterLogin');

                // Clear the session storage
                if (sessionStorage.getItem('redirectAfterLogin')) {
                    sessionStorage.removeItem('redirectAfterLogin');
                }

                // If user came from Smart Code Assistant, redirect back there
                if (redirectTo === '/safe-suggest') {
                    navigate('/safe-suggest');
                    return;
                }

                try {
                    const response = await axios.get(`http://localhost:5000/api/user-role/role/${user.id}`);
                    const role = response.data.role;

                    localStorage.setItem("userRole", role);

                    if (role === "student") {
                        navigate("/student/dashboard");
                    } else if (role === "instructor") {
                        navigate("/instructor/dashboard");
                    } else {
                        navigate("/role-selection");
                    }
                } catch (error) {
                    // Role not found, redirect to selection
                    navigate("/role-selection");
                }
            }
        };

        checkRole();
    }, [isLoaded, user, navigate, location]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Verifying your account...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
