import { useState } from "react";
import { Layout, Drawer } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "../../components/sidebar/Topbar";
import BreadcrumbComponent from "./BreadcrumbComponent";
import "./adminLayout.css";

const { Content } = Layout;

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar as Drawer */}
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        bodyStyle={{ padding: 0 }}
        width={280}
      >
        <Sidebar collapsed={false} />
      </Drawer>

      {/* Main layout */}
      <Layout className="site-layout">
        <Topbar onToggleSidebar={toggleSidebar} />

        <Content className="admin-content" style={{ padding: "10px" }}>
          <BreadcrumbComponent style={{ padding: "10px" }} />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
