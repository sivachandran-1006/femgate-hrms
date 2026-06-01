import { useState, useEffect } from "react";
import { MOCK_USERS } from "../constants/mockUsers";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hrms_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setIsLoggedIn(true);
      }
    } catch {
      localStorage.removeItem("hrms_user");
    }
  }, []);

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!found) throw new Error("Invalid email or password");
    const userData = {
      email: found.email,
      role: found.role,
      name: found.name,
      avatar: found.avatar,
    };
    localStorage.setItem("hrms_user", JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("hrms_user");
    setUser(null);
    setIsLoggedIn(false);
  };

  const hasAccess = (allowedRoles) => user && allowedRoles.includes(user.role);

  return { isLoggedIn, user, userRole: user?.role || null, login, logout, hasAccess };
};
