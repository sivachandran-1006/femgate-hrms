import { createContext, useContext, useState } from "react";
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

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!found) throw new Error("Invalid email or password");
    const userData = {
      email:  found.email,
      role:   found.role,
      name:   found.name,
      avatar: found.avatar,
    };
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
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
