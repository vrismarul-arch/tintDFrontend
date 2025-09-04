import { useState } from "react";
import { Layout, Drawer } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./partnerLayout.css";

const { Content } = Layout;

export default function PartnerLayout() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Drawer
        width={280}
        placement="left"
        closable={false} // hides the default close button in the header
        onClose={() => setSidebarVisible(false)}
        open={sidebarVisible}
        bodyStyle={{ padding: 0 }}
        header={null}
      >
        <Sidebar />
      </Drawer>

      <Layout className="site-layout">
        <Topbar
          onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />

        <Content className="partner-content" style={{ padding: "10px 20px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
