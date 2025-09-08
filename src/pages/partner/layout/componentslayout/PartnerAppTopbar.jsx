import React, { useState, useEffect } from "react";
import { Layout, Avatar, Tooltip, Dropdown, Menu, Badge } from "antd";
import { UserOutlined, LoginOutlined, BellOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";
import DutyToggle from "./DutyToggle";
import NotificationAlerts from "./NotificationAlerts"; // alert popup
import api from "../../../../../api.js";

const { Header } = Layout;

export default function PartnerAppTopbar({ extra }) {
  const navigate = useNavigate();
  const { partner, logout } = usePartnerAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0); // unread count

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

  // Fetch initial notification count
  const fetchNotificationCount = async () => {
    if (!partner?.token) return;
    try {
      const res = await api.get("/api/partners/notifications", {
        headers: { Authorization: `Bearer ${partner.token}` },
      });
      const newItems = res.data || [];
      setNotifCount(newItems.length);
    } catch (err) {
      console.error(err);
    }
  };

  // Poll count every 30 seconds
  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [partner?.token]);

  // Open notifications drawer and reset count
  const handleNotifOpen = () => {
    setNotifOpen(true);
    setNotifCount(0);
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
          <DutyToggle />

          {/* Bell with unread count */}
          <Badge count={notifCount} size="small" offset={[0, 0]}>
            <BellOutlined
              style={{ fontSize: 20, cursor: "pointer" }}
              onClick={handleNotifOpen}
            />
          </Badge>

          <Badge size="small">
            <MessageOutlined
              style={{ fontSize: 20, cursor: "pointer" }}
              onClick={() => setMsgOpen(!msgOpen)}
            />
          </Badge>

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

      {/* Alerts for notifications/messages */}
      <NotificationAlerts
        open={notifOpen}
        type="notifications"
        onNew={(newCount) => setNotifCount(prev => prev + newCount)}
      />
      <NotificationAlerts open={msgOpen} type="messages" />
    </>
  );
}
