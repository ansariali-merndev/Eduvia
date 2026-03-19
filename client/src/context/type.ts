import type React from "react";

export type AuthContextType = {
  userData: UserDataType | null;
  setUserData: React.Dispatch<React.SetStateAction<UserDataType | null>>;
  loaded: boolean;
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  showNav: boolean;
  setShowNav: React.Dispatch<React.SetStateAction<boolean>>;
};

export type UserDataType = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_img: string;
  is_verified: boolean;
  last_login: string | null;
  created_at: string;
};
