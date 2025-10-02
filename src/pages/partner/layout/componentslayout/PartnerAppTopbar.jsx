import React, { useState, useEffect, useRef } from "react";
import { Layout, Avatar, Tooltip, Dropdown, Menu, Badge } from "antd";
import { UserOutlined, LoginOutlined, BellOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";
import DutyToggle from "./DutyToggle";
import NotificationAlerts from "./NotificationAlerts"; // for displaying alerts
import api from "../../../../../api.js";

const { Header } = Layout;

export default function PartnerAppTopbar({ extra }) {
  const navigate = useNavigate();
  const { partner, logout } = usePartnerAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  const audioRef = useRef(null);
  const notifiedIds = useRef(new Set());

  // Load sound once
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.addEventListener('error', (e) => {
      console.error("Audio load error:", e);
    });
  }, []);

  const playSound = () => {
    audioRef.current?.play().catch(err => {
      console.error("Audio play error:", err);
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/partner/login");
  };

  const menu = (
    <Menu
      items={[
        { key: "profile", label: "Profile", onClick: () => navigate("/partnerapp/profile") },
        { key: "logout", label: "Logout", icon: <LoginOutlined />, onClick: handleLogout },
      ]}
    />
  );

  // ✅ Fetch notifications every 30 sec and play sound when new ones arrive
  const fetchNotifications = async () => {
    if (!partner?.token) return;
    try {
      const res = await api.get("/api/partners/notifications", {
        headers: { Authorization: `Bearer ${partner.token}` },
      });
      const newItems = Array.isArray(res.data) ? res.data : [];
      
      let newCount = 0;
      newItems.forEach(item => {
        const id = item.id || item.bookingId;
        if (!notifiedIds.current.has(id)) {
          notifiedIds.current.add(id);
          newCount++;
        }
      });

      if (newCount > 0) {
        playSound(); // ✅ Play sound immediately on new notification
        setNotifCount(prev => prev + newCount); // ✅ Increase count immediately
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [partner?.token]);

  const handleNotifOpen = () => {
    setNotifOpen(true);
    setNotifCount(0); // reset when user opens the notification drawer
  };

  return (
    <>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {extra}
          <Link to="/partnerapp/dashboard">
            <img src="/tintD.png" alt="Logo" style={{ height: 40, marginTop: 12 }} />
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>

          {/* <Badge count={notifCount} size="small" offset={[0, 0]}>
            <BellOutlined
              style={{ fontSize: 20, cursor: "pointer" }}
              onClick={handleNotifOpen}
            />
          </Badge> */}

         

          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Tooltip title={partner?.name || "Account"}>
              <Avatar
                size="large"
                src={partner?.avatar || partner?.image || "/default-avatar.png"}
                icon={!partner?.avatar && !partner?.image ? <UserOutlined /> : null}
                style={{ backgroundColor: "#9a5edf", cursor: "pointer" }}
              />
            </Tooltip>
          </Dropdown>
        </div>
      </Header>

      {/* Notification drawer */}
      <NotificationAlerts
        open={notifOpen}
        type="notifications"
        onNew={(newCount) => setNotifCount(prev => prev + newCount)}
      />

      {/* Message drawer */}
      <NotificationAlerts open={msgOpen} type="messages" />
    </>
  );
}
  