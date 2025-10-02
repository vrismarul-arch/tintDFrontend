import React, { useEffect, useState } from "react";
import { Card, List, Typography, Spin, Button, notification, Divider } from "antd";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth";
import api from "../../../../api";

const { Title, Text } = Typography;

export default function PartnerNotifications() {
  const { partner } = usePartnerAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Fetch pending notifications for this partner
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("partnerToken");
      const { data } = await api.get("/api/partners/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Only pending notifications
      const pendingNotifications = data.filter(
        (n) => n.status === "pending" && (!n.booking.assignedTo || n.booking.assignedTo._id === partner._id)
      );

      setNotifications(pendingNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      notification.error({ message: "Failed to load notifications" });
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Accept booking and update notifications immediately
  const acceptBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("partnerToken");
      await api.put(
        `/api/partners/bookings/${bookingId}/assign`,
        { partnerId: partner._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notification.success({ message: "Booking accepted successfully!" });

      // Remove accepted booking from notifications
      setNotifications((prev) => prev.filter((n) => n.bookingId !== bookingId));
    } catch (err) {
      console.error(err);
      notification.error({ message: "Failed to accept booking" });
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
        <Spin size="large" tip="Loading notifications..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Title level={2}>Notifications</Title>
      <Divider />
      <List
        dataSource={notifications}
        bordered
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card style={{ width: "100%" }}>
              <Text>{item.text}</Text>
              {item.status === "pending" && (
                <Button
                  type="primary"
                  style={{ marginLeft: 12 }}
                  onClick={() => acceptBooking(item.bookingId)}
                >
                  Accept Booking
                </Button>
              )}
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: "No notifications available." }}
      />
    </div>
  );
}
