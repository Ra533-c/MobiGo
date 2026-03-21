import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { authService } from "../main";
import type { AppContextType, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProvideProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProvideProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching location...");

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { data } = await axios.get(`${authService}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
        setIsAuth(true);
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

  useEffect(() => {
    if (!navigator.geolocation)
      return alert("Please allow location to continue!");
    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );
        const data = await res.json();
        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "Current Location",
        });
        setCity(
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Your Location",
        );
        setLoadingLocation(false);
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "Current Location",
        });
        setCity("Your Location");
        setLoadingLocation(false);
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        user,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        location,
        setCity,
        setLoadingLocation,
        loadingLocation,
        setLocation,
        city,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }
  return context;
};
