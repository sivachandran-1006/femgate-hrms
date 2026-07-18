import { createContext, useContext, useState } from "react";
import { storage } from "../utils/storage";
import { MOCK_USERS } from "../constants/mockUsers";

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("hrms_user");
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem("hrms_user");
  }
  return null;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());

  // main_v1: UI-only demo branch — authenticate against MOCK_USERS, no backend call ever made.
  const login = async (email, password) => {
    const match = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === String(email).toLowerCase() && u.password === password
    );
    if (!match) throw new Error("Invalid email or password");

    storage.set("token", "Bearer mock-token");

    const userData = {
      id:        match.email,
      email:     match.email,
      role:      match.role,
      name:      match.name,
      companyId: "mock-company-1",
    };
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    storage.clear();
    localStorage.removeItem("hrms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: user !== null,
      userRole:   user?.role || null,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
