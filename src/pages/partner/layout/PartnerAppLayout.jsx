import React, { useState } from "react";
import { Layout, Drawer, Button } from "antd";
import { Outlet } from "react-router-dom";
import { MenuOutlined } from "@ant-design/icons";
import PartnerAppTopbar from "../layout/componentslayout/PartnerAppTopbar";
import PartnerAppSidebar from "../layout/componentslayout/PartnerAppSidebar";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth.jsx";

const { Content } = Layout;

export default function PartnerAppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { partner } = usePartnerAuth(); // ✅ get partner from context

  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Drawer Sidebar (Mobile/Tablet) */}
      <Drawer
        placement="left"
        closable={false}
        width={250}
        onClose={toggleDrawer}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
      >
        <PartnerAppSidebar collapsed={collapsed} onToggleSidebar={() => setCollapsed(!collapsed)} user={partner} />
      </Drawer>

      <Layout className="site-layout">
        {/* Topbar */}
        <PartnerAppTopbar
          user={partner}
          extra={
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={toggleDrawer}
              style={{ fontSize: 20 }}
            />
          }
        />

        {/* Page content */}
        <Content
          style={{
            padding: "20px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
