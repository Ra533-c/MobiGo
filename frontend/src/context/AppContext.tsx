import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react"
import { authService } from "../main";
import type { AppContextType, User } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProvideProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProvideProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(false);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [city, setCity] = useState("Fetching location...");

    async function fetchUser() {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const { data } = axios.get(`${authService}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });
                setUser(data.user);
                SetIsAuth(true);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AppContext.Provider value={{ isAuth, user, loading, setIsAuth, setLoading, setUser }}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppData = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
}