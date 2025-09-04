  import { Layout, Menu } from "antd";
  import {
    DashboardOutlined,
    AppstoreOutlined,
    UserOutlined,
    FileTextOutlined,
    TeamOutlined,
    PictureOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  } from "@ant-design/icons";
  import { Link, useLocation } from "react-router-dom";
  import { useState } from "react";
  import "../../css/sidebar.css";

  const { Sider } = Layout;

  export default function Sidebar() {
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    // Sidebar menu config
    const menuConfig = [
      {
        key: "dashboard",
        label: "Dashboard",
        icon: <DashboardOutlined />,
        children: [{ key: "/admin/dashboard", label: "Leads Dashboard" }],
      },
     {
  key: "services",
  label: "Application",
  icon: <AppstoreOutlined />,
  children: [
    { key: "/admin/categories", label: "Categories", icon: <FileTextOutlined /> },
    { key: "/admin/services", label: "Services", icon: <TeamOutlined /> },
    { key: "/admin/banners", label: "Banners", icon: <PictureOutlined /> },
    { key: "/admin/bookings", label: "Bookings", icon: <FileTextOutlined /> }, // ✅ NEW
  ],
},
      {
        key: "user-manage",
        label: "User Manage",
        icon: <UserOutlined />,
        children: [
          { key: "/admin/partners", label: "TintdPartner", icon: <UserOutlined /> },
          { key: "/admin/profile", label: "Profile", icon: <UserOutlined /> },
        ],
      },
    ];

    // Recursive renderer
    const renderMenuItems = (items) =>
      items.map((item) =>
        item.children
          ? {
              key: item.key,
              icon: item.icon,
              label: item.label,
              children: renderMenuItems(item.children),
            }
          : {
              key: item.key,
              icon: item.icon,
              label: <Link to={item.key}>{item.label}</Link>,
            }
      );

    return (
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={190}
        theme="light"
        className="shadow-md min-h-screen"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/tintD.png" alt="Logo" className="logo" />
        </div>

        {/* Main Menu Text */}
        {!collapsed && <div className="sidebar-heading">MAIN MENU</div>}

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["dashboard", "services", "user-manage"]}
          items={renderMenuItems(menuConfig)}
        />

        {/* Collapse Button */}
        <div className="sidebar-collapse">
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </div>
      </Sider>
    );
  }
