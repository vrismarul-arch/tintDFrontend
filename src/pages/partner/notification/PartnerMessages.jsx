import React, { useEffect, useState } from "react";
import { Card, List, Typography, Spin } from "antd";
    import { usePartnerAuth } from "../../../hooks/usePartnerAuth";

const { Title } = Typography;

export default function PartnerMessages() {
  const { partner } = usePartnerAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Simulate fetching messages
    setTimeout(() => {
      setMessages([
        { id: 1, from: "Admin", text: "Please update your documents." },
        { id: 2, from: "Support", text: "Welcome to TintD Partner app 🎉" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <Spin tip="Loading messages..." style={{ marginTop: 100 }} />;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>Messages</Title>
      <List
        dataSource={messages}
        bordered
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: "100%" }}>
              <b>{item.from}:</b> {item.text}
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: "No messages yet." }}
      />
    </div>
  );
}
