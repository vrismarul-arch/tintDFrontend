import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  Divider,
  Card,
  Button,
  Calendar,
  Badge,
  List,
  Image,
  notification,
  Modal,
} from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth.jsx";
import "./PartnerDashboard.css";

const { Title, Text } = Typography;

export default function PartnerDashboard() {
  const { partner, isAuthed, logout } = usePartnerAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notificationsData, setNotificationsData] = useState([]);
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch partner data
  const fetchData = async () => {
    if (!isAuthed) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("partnerToken");

      const { data: profileData } = await api.get("/api/partners/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(profileData);

      const { data: bookingData } = await api.get(
        "/api/partners/bookings/history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(bookingData);

      const { data: notificationsRes } = await api.get(
        "/api/partners/notifications",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const pendingNotifs = notificationsRes.filter((n) => n.status === "pending");

      pendingNotifs.forEach((n) => {
        notification.info({
          message: "New Booking Assigned",
          description: n.text,
          placement: "topRight",
          duration: 5,
        });
      });

      setNotificationsData(pendingNotifs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [isAuthed]);

  if (loading)
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );

  if (!profile) return null;

  const handleLogout = () => {
    logout();
    navigate("/partner/login");
  };

  // Booking stats
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(
    (b) => dayjs(b.selectedDate).isAfter(dayjs()) && b.status !== "completed"
  ).length;
  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const dateCellRender = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayBookings = bookings.filter(
      (b) => dayjs(b.selectedDate).format("YYYY-MM-DD") === dateStr
    );
    return (
      <ul className="events">
        {dayBookings.map((b) => (
          <li key={b._id}>
            <Badge
              status={
                b.status === "pending"
                  ? "warning"
                  : b.status === "picked"
                    ? "processing"
                    : b.status === "confirmed"
                      ? "success"
                      : b.status === "completed"
                        ? "default"
                        : "error"
              }
              text={`${b.user?.name || b.name}`}
            />
          </li>
        ))}
      </ul>
    );
  };

  const onSelectDate = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayBookings = bookings.filter(
      (b) => dayjs(b.selectedDate).format("YYYY-MM-DD") === dateStr
    );
    setSelectedDateBookings(dayBookings);
    setModalVisible(true);
  };

  // Action buttons
  const startService = (bookingId) => {
    console.log("Start service:", bookingId);
  };

  const contactCustomer = (phone) => {
    if (!phone) return;
    window.open(`tel:${phone}`, "_self");
  };

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <Row justify="space-between" align="middle" className="dashboard-header">
        <Col>
          <Title level={3}>Welcome, {profile.name} 👋</Title>
          <Text type="secondary">Here’s your partner dashboard</Text>
        </Col>
        <Col>
          <Button type="primary" danger onClick={handleLogout}>
            Logout
          </Button>
        </Col>
      </Row>

      <Divider />

      {/* Booking Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: "Total Bookings", value: totalBookings },
          { label: "Upcoming", value: upcomingBookings },
          { label: "Completed", value: completedBookings },
          { label: "Pending", value: pendingBookings },
        ].map((card, i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card className="stat-card">
              <Text strong>{card.label}</Text>
              <Title level={3}>{card.value}</Title>
            </Card>
          </Col>
        ))}
      </Row>


      {/* Calendar */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={24}>
          <Card title="Booking Calendar">
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={onSelectDate}
              fullscreen={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal for selected date bookings */}
      <Modal
        title="Bookings on Selected Date"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={Math.min(window.innerWidth * 0.95, 800)}
      >
        {selectedDateBookings.length === 0 ? (
          <Text>No bookings for this date.</Text>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={selectedDateBookings}
            renderItem={(b) => (
              <List.Item key={b._id}>
                <Card className="booking-card" bordered>
                  {/* Row 1: Service Image */} 
<Row gutter={[24, 24]}>
  <Col xs={24} sm={24} md={8} lg={6}>
  <div style={{ 
    height: "200px",
    overflow: "hidden",
    borderRadius: 8,
    margin: "8px",      // space around image
    background: "#fafafa" 
  }}>
    <Image
      className="booking-img"
      src={b.services[0]?.serviceId?.imageUrl}
      preview={false}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
</Col>


  {/* Map or fallback image */}
 <Col xs={24} sm={24} md={8} lg={6}>
  {b.location?.lat && b.location?.lng ? (
    <iframe
      title="Booking Location"
      className="booking-map"
      src={`https://www.google.com/maps?q=${b.location.lat},${b.location.lng}&z=15&output=embed`}
      style={{
        width: "100%",
        height: "200px",
        border: 0,
        borderRadius: "8px",
      }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  ) : b.address ? (
    <iframe
      title="Booking Address Location"
      className="booking-map"
      src={`https://www.google.com/maps?q=${encodeURIComponent(
        b.address
      )}&output=embed`}
      style={{
        width: "100%",
        height: "200px",
        border: 0,
        borderRadius: "8px",
      }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  ) : (
    <div style={{ height: "200px", overflow: "hidden", borderRadius: 8 }}>
      <Image
        className="booking-img"
        src={b.services[0]?.serviceId?.imageUrl}
        preview={false}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  )}
</Col>

</Row>



               {/* Row 2: Booking Details + Action Buttons */}
<Row gutter={[16, 12]} style={{ marginTop: 12 }}>
  {/* Left Column */}
  <Col xs={24} md={12}>
    <Text strong>Booking ID:</Text> {b.bookingId || b._id} <br />
    <Text strong>Customer:</Text> {b.user?.name || b.name} <br />
    <Text type="secondary">{b.user?.email}</Text> <br />
    <Text type="secondary">{b.user?.phone || b.phone}</Text> <br />
    {b.address && (
      <>
        <Text strong>Address:</Text> {b.address} <br />
      </>
    )}
    <Text strong>Services:</Text>{" "}
    {b.services
      .map((s) => `${s.serviceId?.name} × ${s.quantity || 1}`)
      .join(", ")}{" "}
    <br />
  </Col>

  {/* Right Column */}
  <Col xs={24} md={12}>
    <Text strong>Date & Time:</Text> {dayjs(b.selectedDate).format("DD/MM/YYYY HH:mm")} <br />
    <Text strong>Payment Method:</Text> {b.paymentMethod?.toUpperCase()} <br />
    <Text strong>Total Amount:</Text> ₹{b.totalAmount} <br />
    <Text strong>Status:</Text>{" "}
    <Tag
      color={
        b.status === "pending"
          ? "orange"
          : b.status === "picked"
          ? "blue"
          : b.status === "confirmed"
          ? "green"
          : "default"
      }
    >
      {b.status.toUpperCase()}
    </Tag>
    <br />

    {/* Action Buttons */}
    <div style={{ marginTop: 12 }}>
      <Button
        type="primary"
        style={{ marginRight: 8 }}
        onClick={() => startService(b._id)}
      >
        Comleted Service
      </Button>
      <Button onClick={() => contactCustomer(b.user?.phone)}>
        Contact Customer
      </Button>
    </div>
  </Col>
</Row>

                </Card>
              </List.Item>
            )}
          />
        )}
      </Modal>

    </div>
  );
}
