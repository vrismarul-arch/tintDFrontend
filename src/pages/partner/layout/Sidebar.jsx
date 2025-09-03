import { useState } from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  BankOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState(location.pathname);

  const menuItems = [
    {
      key: "/partner/register",
      icon: <UserOutlined />,
      label: <Link to="/partner/register">Partner Registration</Link>,
    },
    {
      key: "/partner/documents",
      icon: <FileTextOutlined />,
      label: <Link to="/partner/documents">Documents</Link>,
    },
    {
      key: "/partner/bank",
      icon: <BankOutlined />,
      label: <Link to="/partner/bank">Bank Info</Link>,
    },
    {
      key: "/partner/approval",
      icon: <IdcardOutlined />,
      label: <Link to="/partner/approval">Approval Status</Link>,
    },
  ];

  return (
    <Sider collapsible collapsed={collapsed} width={220} style={{ background: "#fff" }}>
      <div className="logo" style={{ height: "60px", margin: "16px", fontWeight: "bold", textAlign: "center" }}>
        Partner Portal
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => setSelectedKey(key)}
        items={menuItems}
      />
    </Sider>
  );
}
