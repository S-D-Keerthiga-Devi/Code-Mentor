import React from "react";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
    const authCallbackUrl = import.meta.env.VITE_CLERK_AUTH_CALLBACK_URL || "/auth-callback";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <SignIn
                routing="path"
                path="/login"
                signUpUrl="/sign-up"
                forceRedirectUrl={authCallbackUrl}
            />
        </div>
    );
};

export default Login;