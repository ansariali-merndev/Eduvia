import { createContext, useContext } from "react";
import type { AuthContextType } from "./type";

const defaultValue = {
  userData: null,
  setUserData: () => {},
  loaded: false,
  setLoaded: () => {},
  showNav: false,
  setShowNav: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

export const useAuthContext = () => useContext(AuthContext);
