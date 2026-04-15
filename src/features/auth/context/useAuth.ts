import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

export const AuthContext = createContext<Session | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
