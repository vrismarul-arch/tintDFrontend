import React, { useState } from "react";
import { Layout, Avatar, Tooltip, Dropdown, Menu, Badge, Drawer, List } from "antd";
import { UserOutlined, LoginOutlined, BellOutlined, MessageOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";
import DutyToggle from "./DutyToggle"; // ✅ Import DutyToggle component

const { Header } = Layout;

export default function PartnerAppTopbar({ extra }) {
  const navigate = useNavigate();
  const { partner, logout } = usePartnerAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);

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

  const notifications = [
    { id: 1, text: "New booking request received" },
    { id: 2, text: "Profile updated successfully" },
  ];
  const messages = [
    { id: 1, from: "Admin", text: "Please update your documents." },
    { id: 2, from: "Support", text: "Welcome to TintD Partner app 🎉" },
  ];

  return (
    <>
      <Header style={{ background: "#fff", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {extra}
          <Link to="/partnerapp/dashboard">
            <img src="/tintD.png" alt="Logo" style={{ height: 40, marginTop: 12 }} />
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* ✅ Use the DutyToggle component here */}
          <DutyToggle />

          <Badge count={notifications.length} size="small">
            <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} onClick={() => setNotifOpen(true)} />
          </Badge>

          <Badge count={messages.length} size="small">
            <MessageOutlined style={{ fontSize: 20, cursor: "pointer" }} onClick={() => setMsgOpen(true)} />
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

      <Drawer title="Notifications" placement="right" onClose={() => setNotifOpen(false)} open={notifOpen} width={320}>
        <List dataSource={notifications} renderItem={(item) => <List.Item key={item.id}>{item.text}</List.Item>} locale={{ emptyText: "No notifications." }} />
      </Drawer>

      <Drawer title="Messages" placement="right" onClose={() => setMsgOpen(false)} open={msgOpen} width={320}>
        <List
          dataSource={messages}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <b>{item.from}: </b> {item.text}
            </List.Item>
          )}
          locale={{ emptyText: "No messages." }}
        />
      </Drawer>
    </>
  );
}
