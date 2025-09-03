// PartnerLayout.jsx
import { useState } from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
// import Sidebar from "../../components/sidebar/Sidebar";
import Topbar from "./Topbar";
// import BreadcrumbComponent from "./BreadcrumbComponent";
import "./partnerLayout.css";

const { Content } = Layout;

export default function PartnerLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      {/* <Sidebar collapsed={collapsed} /> */}

      {/* Main layout */}
      <Layout className="site-layout">
        {/* Topbar */}
        <Topbar
          collapsed={collapsed}
          onToggleSidebar={() => setCollapsed(!collapsed)}
        />

        {/* Breadcrumb */}
        {/* <div className="partner-breadcrumb" style={{ padding: "10px 20px" }}>
          <BreadcrumbComponent />
        </div> */}

        {/* Content area for nested Partner pages */}
        <Content className="partner-content" style={{ padding: "10px 20px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
