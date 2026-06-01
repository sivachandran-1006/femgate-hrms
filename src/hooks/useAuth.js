import { useState, useEffect } from "react";
import { storage } from "../utils/storage";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole]     = useState("Admin");
  const [user, setUser]             = useState(null);

  useEffect(() => {
    const token = storage.get("token");
    const role  = storage.get("role");
    const emp   = storage.get("employee");
    if (token) { setIsLoggedIn(true); setUserRole(role || "Admin"); setUser(emp); }
  }, []);

  const login = (role) => {
    storage.set("token", "hrms-token");
    storage.set("role", role);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const logout = () => {
    storage.clear();
    setIsLoggedIn(false);
    setUser(null);
  };

  const hasAccess = (roles) => roles.includes(userRole);

  return { isLoggedIn, userRole, user, login, logout, hasAccess };
};
