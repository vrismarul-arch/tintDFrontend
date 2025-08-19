import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/sidebar/Topbar";
import BreadcrumbComponent from "./BreadcrumbComponent"; // Import the new component
import "./adminLayout.css";

const { Content } = Layout;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      {/* Layout with Topbar + Content */}
      <Layout className="site-layout">
        <Topbar onToggleSidebar={() => setCollapsed(!collapsed)} />

        <Content className="admin-content" style={{padding:"10px"}}>
          <BreadcrumbComponent style={{padding:"10px"}} /> {/* Use the new Breadcrumb component */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}