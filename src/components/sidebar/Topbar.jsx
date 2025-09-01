import { Avatar, Dropdown, Menu } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./topbar.css";

export default function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();

  // Handle menu click
  const handleMenuClick = ({ key }) => {
    if (key === "3") {
      // Logout: remove token & role
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login"); // redirect to login page
    } else if (key === "1") {
      navigate("/admin/profile");
    } else if (key === "2") {
      navigate("/admin/settings");
    }
  };

  const profileMenu = [
    { key: "1", label: "Profile" },
    { key: "2", label: "Settings" },
    { key: "3", label: "Logout" },
  ];

  const menu = (
    <Menu onClick={handleMenuClick}>
      {profileMenu.map(item => (
        <Menu.Item key={item.key}>{item.label}</Menu.Item>
      ))}
    </Menu>
  );

  return (
    <header className="topbar">
      {/* Toggle Sidebar Button */}
      <button className="toggle-btn" onClick={onToggleSidebar}>
        <MenuOutlined />
      </button>

      {/* Title */}
      <h2 className="topbar-title">Admin Dashboard</h2>

      {/* Profile Avatar with Dropdown */}
      <Dropdown overlay={menu} placement="bottomRight">
        <Avatar icon={<UserOutlined />} className="topbar-avatar" />
      </Dropdown>
    </header>
  );
}
