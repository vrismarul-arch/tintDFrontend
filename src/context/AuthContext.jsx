import { createContext, useContext, useEffect, useState } from "react";
import api from "../../api"; // ✅ adjust path to your api.js

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Fetch profile from backend if token exists
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("partnerToken") || localStorage.getItem("userToken");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data } = await api.get("/api/partners/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data);
    } catch (err) {
      console.error("❌ Auth profile fetch failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Run once on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // 📥 Called after successful login
  const login = (data, token) => {
    localStorage.setItem("partnerToken", token);
    setUser(data);
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("partnerToken");
    localStorage.removeItem("userToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
