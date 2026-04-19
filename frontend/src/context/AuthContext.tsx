import { createContext, useContext, useState } from "react";
import { api } from "../api/client";

type AuthData = {
    token: string;
    username: string;
    role: string;
    employee_id: string;
};

type AuthContextType = {
    user: AuthData | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthData | null>(() => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    });

    const login = async (username: string, password: string) => {
        const res = await api.post("/auth/login", { username, password });

        const data = res.data;

        const userData: AuthData = {
            token: data.token,
            username: data.username,
            role: data.role,
            employee_id: data.employee_id,
        };

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("AuthContext not found");
    return ctx;
};