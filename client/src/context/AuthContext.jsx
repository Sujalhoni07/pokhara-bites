import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // On page load, ask the backend who is logged in (the cookie is sent automatically)
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await authApi.getCurrentUser();
        setUser(data.user);
      } catch {
        setUser(null); // not logged in, or the server is not reachable
      } finally {
        setChecking(false);
      }
    }
    checkSession();
  }, []);

  // Both return { user, error }. error is "" when it worked.
  async function login(email, password) {
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      return { user: data.user, error: "" };
    } catch (err) {
      return { user: null, error: err.message };
    }
  }

  async function register(details) {
    try {
      const data = await authApi.register(details);
      setUser(data.user);
      return { user: data.user, error: "" };
    } catch (err) {
      return { user: null, error: err.message };
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // even if the request fails, clear the user locally
    }
    setUser(null);
  }

  const value = {
    user,
    checking,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === "admin",
    isCustomer: user?.role === "customer",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}