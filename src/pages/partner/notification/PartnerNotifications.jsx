import React, { useEffect, useState } from "react";
import { Card, List, Typography, Spin, Tag } from "antd";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth";

const { Title, Text } = Typography;

export default function PartnerNotifications() {
  const { partner } = usePartnerAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulate fetching notifications
    setTimeout(() => {
      setNotifications([
        { id: 1, text: "New booking request received" },
        { id: 2, text: "Your profile was updated successfully" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <Spin tip="Loading notifications..." style={{ marginTop: 100 }} />;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>Notifications</Title>
      <List
        dataSource={notifications}
        bordered
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: "100%" }}>{item.text}</Card>
          </List.Item>
        )}
        locale={{ emptyText: "No notifications yet." }}
      />
    </div>
  );
}
