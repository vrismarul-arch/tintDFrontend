import React from "react";
import { Layout, Avatar, Typography, Menu, Divider, Button } from "antd";
import { WalletOutlined, GiftOutlined, AppstoreOutlined, BarChartOutlined, QuestionCircleOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";
import "./PartnerAppSidebar.css";

const { Sider } = Layout;
const { Text } = Typography;

const menuConfig = [
  { key: "/partnerapp/order-history", icon: <WalletOutlined />, title: "Booking", subtitle: "bookings & History" },
  { key: "/partnerapp/incentives", icon: <BarChartOutlined />, title: "Incentives", subtitle: "How you get paid" },
  { key: "/partnerapp/rewards", icon: <GiftOutlined />, title: "Rewards", subtitle: "Insurance & Discounts" },
  { key: "/partnerapp/services", icon: <AppstoreOutlined />, title: "Services", subtitle: "Food Delivery & more" },
  { key: "/partnerapp/demand", icon: <BarChartOutlined />, title: "Demand Planner", subtitle: "High Demand Areas" },
  { key: "/partnerapp/help", icon: <QuestionCircleOutlined />, title: "Help", subtitle: "Support & Insurance" },
];

export default function PartnerAppSidebar({ collapsed }) {
  const location = useLocation();
  const { partner, logout } = usePartnerAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/partner/login";
  };

  return (
    <Sider collapsible collapsed={collapsed} trigger={null} width={250} className="partner-sidebar">
      <div className="partner-sidebar-inner">
        <div className="partner-sidebar-profile">
          <Avatar
            size={48}
            src={partner?.avatar || partner?.image || "/default-avatar.png"}
            icon={!partner?.avatar && !partner?.image ? <UserOutlined /> : null}
          />
          {!collapsed && (
            <div className="partner-sidebar-profile-info">
              <Text strong>{partner?.name || "My Profile"}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {partner?.email || ""}
              </Text>
            </div>
          )}
        </div>

        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: "none", flex: 1 }}
          items={menuConfig.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: (
              <div>
                <Link to={item.key}>{item.title}</Link>
                {!collapsed && <div style={{ fontSize: 11, color: "#888" }}>{item.subtitle}</div>}
              </div>
            ),
          }))}
        />

        <Divider style={{ margin: "8px 0" }} />

        {!collapsed && (
          <div className="partner-sidebar-bottom">
            <Button block danger icon={<LogoutOutlined />} onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </Sider>
  );
}
