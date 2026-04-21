import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
    const authCallbackUrl = import.meta.env.VITE_CLERK_AUTH_CALLBACK_URL || "/auth-callback";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/login"
                forceRedirectUrl={authCallbackUrl}
            />
        </div>
    );
};

export default SignUpPage;
