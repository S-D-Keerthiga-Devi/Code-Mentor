import React from "react";
import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/login"
                forceRedirectUrl="/auth-callback"
            />
        </div>
    );
};

export default SignUpPage;
