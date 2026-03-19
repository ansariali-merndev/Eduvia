import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { UserDataType } from "./type";
import { api } from "../lib/axios";
import { handleAlert } from "../lib/swal";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [showNav, setShowNav] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDataType | null>(null);

  const getUserData = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");

      if (!res.data.success) {
        handleAlert(res.data.message, "info");
        setUserData(null);
        return;
      }

      setUserData(res.data.user);
    } catch {
      setUserData(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  useEffect(() => {
    setShowNav(!!userData);
  }, [userData]);

  const value = {
    userData,
    setUserData,
    loaded,
    setLoaded,
    showNav,
    setShowNav,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
