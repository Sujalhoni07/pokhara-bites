import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  // On page load, ask the backend who is logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await authApi.getCurrentAdmin();
        setAdmin(data.admin);
      } catch {
        setAdmin(null); // not logged in, or server not reachable
      } finally {
        setChecking(false);
      }
    }
    checkSession();
  }, []);

  // Returns an error message, or "" if it worked
  async function login(email, password) {
    try {
      const data = await authApi.login(email, password);
      setAdmin(data.admin);
      return "";
    } catch (err) {
      return err.message;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // even if the request fails, clear the admin locally
    }
    setAdmin(null);
  }

  const value = { admin, isAdmin: Boolean(admin), checking, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}