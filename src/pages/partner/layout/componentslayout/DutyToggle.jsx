import React, { useState, useEffect } from "react";
import { Switch, message } from "antd";
import api from "../../../../../api.js"; // Adjust path as needed
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";

export default function DutyToggle() {
  const { partner, updatePartner } = usePartnerAuth(); // ✅ use updatePartner from context
  const [duty, setDuty] = useState(partner?.dutyStatus || false);

  useEffect(() => {
    setDuty(partner?.dutyStatus || false);
  }, [partner]);

const handleDutyChange = async (checked) => {
  try {
    setDuty(checked); // Optimistic UI update

    // Get token from localStorage or context
    const token = localStorage.getItem("partnerToken"); // Or from your auth context
    if (!token) throw new Error("No token found");

    const res = await api.put(
      "/api/partners/duty",
      { dutyStatus: checked },
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Send token
        },
      }
    );

    updatePartner(res.data); // Update context
    message.success(`Duty status set to ${checked ? "OFF" : "ON"}`);
  } catch (error) {
    message.error("Failed to update duty status.");
    setDuty(!checked); // rollback
    console.error("Duty toggle error:", error);
  }
};


  return (
    <Switch
      checked={duty}
      onChange={handleDutyChange}
      checkedChildren="ON DUTY"
      unCheckedChildren="OFF DUTY"
    />
  );
}
