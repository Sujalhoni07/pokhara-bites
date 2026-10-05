import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const USERS_KEY = "pokhara-bites-users";
const CURRENT_USER_KEY = "pokhara-bites-user";

/* ⚠️ DEMO ONLY
   Real apps never store users or passwords in the browser.
   A backend must hash passwords and return a token.
   This is here only to demonstrate the login flow. */

// The café owner's account, created automatically the first time
const ADMIN = {
  id: 1,
  name: "Café Admin",
  email: "admin@pokharabites.com",
  password: "admin123",
  role: "admin",
};

function readUsers() {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    const users = saved ? JSON.parse(saved) : [];
    // make sure the admin account always exists
    if (!users.some((u) => u.email === ADMIN.email)) {
      users.push(ADMIN);
    }
    return users;
  } catch {
    return [ADMIN];
  }
}

function readCurrentUser() {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(readUsers);
  const [user, setUser] = useState(readCurrentUser);

  // save the users list whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {
      // storage blocked
    }
  }, [users]);

  // save (or remove) the logged-in user
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch {
      // storage blocked
    }
  }, [user]);

  // Create a new account. Returns an error message, or "" if it worked.
  function signup(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email === cleanEmail)) {
      return "An account with this email already exists.";
    }

    const newUser = {
      id: Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password,
      role: "customer",
    };

    setUsers((prev) => [...prev, newUser]);
    setUser(newUser);
    return "";
  }

  // Log in. Returns an error message, or "" if it worked.
  function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(
      (u) => u.email === cleanEmail && u.password === password
    );

    if (!found) {
      return "Wrong email or password.";
    }

    setUser(found);
    return "";
  }

  function logout() {
    setUser(null);
  }

  const value = {
    user,
    isLoggedIn: Boolean(user),
    isAdmin: user?.role === "admin",
    signup,
    login,
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