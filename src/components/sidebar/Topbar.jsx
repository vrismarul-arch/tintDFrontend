import { Avatar, Dropdown, Menu } from "antd";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import "./topbar.css";

export default function Topbar({ onToggleSidebar }) {
  // Define menu items as a JSON object
  const profileMenu = [
    { key: "1", label: "Profile", path: "/admin/profile" },
    { key: "2", label: "Settings", path: "/admin/settings" },
    { key: "3", label: "Logout", path: "/logout" },
  ];

  // Map the JSON data to Ant Design's Menu component
  const menu = (
    <Menu>
      {profileMenu.map(item => (
        <Menu.Item key={item.key}>
          <a href={item.path}>{item.label}</a>
        </Menu.Item>
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