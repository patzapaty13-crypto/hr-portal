// src/AuthContext.js
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
  } from "react";
  
  const AuthContext = createContext(null);
  
  export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const stored = localStorage.getItem("auth");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed.user);
          setToken(parsed.token);
        } catch (e) {
          console.error("Failed to parse auth from storage", e);
        }
      }
      setLoading(false);
    }, []);
  
    function login(newUser, newToken) {
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: newUser, token: newToken })
      );
    }
  
    function logout() {
      setUser(null);
      setToken(null);
      localStorage.removeItem("auth");
    }
  
    return (
      <AuthContext.Provider value={{ user, token, loading, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }
  
  export function useAuth() {
    return useContext(AuthContext);
  }
  