import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchMe, login as apiLogin, signup as apiSignup, setAuthToken } from "./api";

const AuthContext = createContext(null);

const applyTheme = (theme) => {
  const root = document.documentElement;
  const body = document.body;
  if (theme === "dark") {
    root.classList.add("dark");
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    root.classList.remove("dark");
    body.classList.remove("dark");
    localStorage.removeItem("theme");
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Apply persisted theme early
    const storedTheme = typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null;
    if (storedTheme) applyTheme(storedTheme);

    const bootstrap = async () => {
      if (typeof localStorage !== "undefined") {
        const existing = localStorage.getItem("authToken");
        if (!existing) {
          setLoading(false);
          return;
        }
      }
      try {
        const me = await fetchMe();
        setUser(me);
        if (me?.settings?.theme) {
          applyTheme(me.settings.theme);
        }
      } catch (_) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (payload) => {
    const res = await apiLogin(payload);
    setAuthToken(res.token);
    setUser(res.user);
    if (res.user?.settings?.theme) applyTheme(res.user.settings.theme);
    return res.user;
  };

  const signup = async (payload) => {
    const res = await apiSignup(payload);
    setAuthToken(res.token);
    setUser(res.user);
    if (res.user?.settings?.theme) applyTheme(res.user.settings.theme);
    return res.user;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    applyTheme("light");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
