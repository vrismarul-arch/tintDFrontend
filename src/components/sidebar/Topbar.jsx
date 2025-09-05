import { Avatar, Dropdown, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./topbar.css";

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();

  const profileMenu = [
    { key: "1", label: "Profile" },
    { key: "2", label: "Settings" },
    { key: "3", label: "Logout" },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "3") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    } else if (key === "1") {
      navigate("/admin/profile");
    } else if (key === "2") {
      navigate("/admin/settings");
    }
  };

  const menu = <Menu onClick={handleMenuClick} items={profileMenu} />;

  return (
    <header className="topbar">
      {/* Clickable Logo */}
      <div
        className="sidebar-logo"
        style={{ cursor: "pointer" }}
        onClick={onToggleSidebar}
      >
        <img src="/tintD.png" alt="Logo"  className="uc-logo-mobile"/>
      </div>

      <h2 className="topbar-title"></h2>

      <Dropdown overlay={menu} placement="bottomRight">
        <Avatar icon={<UserOutlined />} className="topbar-avatar" />
      </Dropdown>
    </header>
  );
}
