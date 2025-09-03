import React from "react";
import { Layout, Dropdown, Avatar, Menu, Tooltip } from "antd";
import { UserOutlined, LoginOutlined, FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./topbar.css";

const { Header } = Layout;

export default function Topbar({ user }) {
  const navigate = useNavigate();

  // Menu for logged-in users
  const userMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/profile")}>Profile</Menu.Item>
      <Menu.Item key="2" onClick={() => navigate("/bookings")}>My Bookings</Menu.Item>
      <Menu.Item key="3" onClick={() => navigate("/logout")} icon={<LoginOutlined />}>Logout</Menu.Item>
    </Menu>
  );

  // Menu for guest users (Login / Join Partner)
  const guestMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/login")} icon={<LoginOutlined />}>Login</Menu.Item>
      <Menu.Item key="2" onClick={() => navigate("/partner/register")} icon={<FormOutlined />}>Join as Partner</Menu.Item>
    </Menu>
  );

  return (
    <Header
      className="partner-topbar"
      style={{
        padding: "0 20px",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo */}
      <div className="topbar-left">
        <img src="/tintD.png" alt="Logo" className="uc-logo" />
      </div>

      {/* Right side */}
      <div className="topbar-right">
        <Dropdown overlay={user ? userMenu : guestMenu} placement="bottomRight" trigger={["click"]}>
          <Tooltip title={user ? user.name || "Profile" : "Account"}>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              src={user?.avatar || null}
              style={{ cursor: "pointer", backgroundColor: "#9a5edf" }}
            >
              {!user?.avatar && user?.name ? user.name.charAt(0).toUpperCase() : null}
            </Avatar>
          </Tooltip>
        </Dropdown>
      </div>
    </Header>
  );
}