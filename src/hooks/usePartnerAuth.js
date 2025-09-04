// src/hooks/usePartnerAuth.js
import { useState } from "react";

export const usePartnerAuth = () => {
  const [partner, setPartner] = useState(JSON.parse(localStorage.getItem("partnerData")) || null);
  const [isAuthed, setIsAuthed] = useState(!!partner);

  const login = (data) => {
    localStorage.setItem("partnerData", JSON.stringify(data));
    localStorage.setItem("partnerToken", data.token);
    setPartner(data);
    setIsAuthed(true);
  };

  const logout = () => {
    localStorage.removeItem("partnerData");
    localStorage.removeItem("partnerToken");
    setPartner(null);
    setIsAuthed(false);
  };

  return { partner, isAuthed, login, logout };
};
  