// frontend/src/hooks/useCollaboration.js
import { useContext } from "react";
import { CollaborationContext } from "../context/CollaborationContext";

export const useCollaboration = () => {
    const context = useContext(CollaborationContext);
    if (!context) {
        throw new Error("useCollaboration must be used within a CollaborationProvider");
    }
    return context;
};
