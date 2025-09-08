import React, { useEffect, useState, useRef } from "react";
import { Alert, Button, Space } from "antd";
import api from "../../../../../api.js";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";

export default function NotificationAlerts({ open, type, onNew }) {
  const { partner } = usePartnerAuth();
  const [items, setItems] = useState([]);
  const audioRef = useRef(null);
  const lastSoundTimeRef = useRef(0);
  const notifiedIds = useRef(new Set());

  // Load sound
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const playSound = () => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 5000) { // 5 sec cooldown
      audioRef.current?.play().catch(() => {});
      lastSoundTimeRef.current = now;
    }
  };

  const fetchItems = async () => {
    if (!partner?.token) return;
    try {
      const endpoint = type === "notifications"
        ? "/api/partners/notifications"
        : "/api/partners/messages";

      const res = await api.get(endpoint, {
        headers: { Authorization: `Bearer ${partner.token}` },
      });

      const newItems = res.data || [];
      let newCount = 0;

      newItems.forEach(item => {
        const id = item.id || item.bookingId;
        if (!notifiedIds.current.has(id)) {
          playSound();
          notifiedIds.current.add(id);
          newCount++;
        }
      });

      setItems(newItems);

      if (onNew && newCount > 0) onNew(newCount);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!open) return;

    fetchItems();
    const interval = setInterval(fetchItems, 30000); // poll every 30 sec
    return () => clearInterval(interval);
  }, [open, type, partner?.token]);

  const handleBookingAction = async (bookingId, action) => {
    if (!partner?.token) return;
    try {
      await api.put(`/api/partners/bookings/${bookingId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${partner.token}` }
      });
      setItems(prev => prev.filter(i => i.bookingId !== bookingId));
      notifiedIds.current.delete(bookingId);
    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 64, right: 20, width: 350, zIndex: 9999 }}>
      {items.map(item => (
        <Alert
          key={item.id || item.bookingId}
          message={item.booking ? `Booking from ${item.booking.name}` : item.text || "Message"}
          description={item.booking ? (
            <div>
              <p>Email: {item.booking.email}</p>
              <p>Phone: {item.booking.phone}</p>
              <p>Address: {item.booking.address}</p>
              <p>Date: {new Date(item.booking.selectedDate).toLocaleString()}</p>
              <p>Time: {new Date(item.booking.selectedTime).toLocaleTimeString()}</p>
              <p>Status: {item.booking.status}</p>
            </div>
          ) : null}
          type={type === "notifications" ? "info" : "success"}
          showIcon
          closable
          action={item.booking ? (
            <Space direction="vertical">
              <Button size="small" type="primary" onClick={() => handleBookingAction(item.bookingId, "confirm")}>Approve</Button>
              <Button size="small" danger ghost onClick={() => handleBookingAction(item.bookingId, "reject")}>Reject</Button>
            </Space>
          ) : null}
          style={{ marginBottom: 8, backgroundColor: "#fff" }}
        />
      ))}
    </div>
  );
}
