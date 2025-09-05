import React, { useState, useEffect, useContext, createContext } from "react";

const PartnerAuthContext = createContext();

export const PartnerAuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);

  // Load partner data from localStorage on mount
  useEffect(() => {
    const savedPartner = localStorage.getItem("partnerData");
    if (savedPartner) {
      const parsed = JSON.parse(savedPartner);
      setPartner(parsed);
      setIsAuthed(true);
    }
  }, []);

  // Login and save partner data + token
  const login = (data) => {
    const partnerData = {
      ...data,
      avatar: data.avatar || null, // ✅ ensure avatar always exists
    };
    localStorage.setItem("partnerData", JSON.stringify(partnerData));
    if (data.token) localStorage.setItem("partnerToken", data.token);
    setPartner(partnerData);
    setIsAuthed(true);
  };

  // Update partner info (e.g. after profile edit)
  const updatePartner = (newData) => {
    const updated = { ...partner, ...newData };
    setPartner(updated);
    localStorage.setItem("partnerData", JSON.stringify(updated));
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("partnerData");
    localStorage.removeItem("partnerToken");
    setPartner(null);
    setIsAuthed(false);
  };

  return (
    <PartnerAuthContext.Provider
      value={{ partner, isAuthed, login, logout, updatePartner }}
    >
      {children}
    </PartnerAuthContext.Provider>
  );
};

// ✅ Custom hook
export const usePartnerAuth = () => useContext(PartnerAuthContext);
