import { createContext, useContext, useState } from "react";
import { loginApi, logoutApi } from "../api/authApi";
import { storage } from "../utils/storage";

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

  const login = async (email, password) => {
    const res  = await loginApi({ email, password });
    const data = res.data;

    if (!data.success) throw new Error(data.message || "Invalid email or password");

    const { token, user: u } = data.data;

    storage.set("token", `Bearer ${token}`);

    const userData = {
      id:        u.id,
      email:     u.email,
      role:      u.role,
      name:      u.name,
      companyId: u.companyId,
    };
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
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
