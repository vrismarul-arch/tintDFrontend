import { useEffect, useState } from "react";
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
  Modal,
  List,
  Image,
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
  const [selectedDateBookings, setSelectedDateBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthed) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("partnerToken");

        // Fetch profile
        const { data: profileData } = await api.get("/api/partners/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(profileData);

        // Fetch partner bookings
        const { data: bookingData } = await api.get(
          "/api/partners/bookings/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBookings(bookingData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Count cards
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(
    (b) => dayjs(b.selectedDate).isAfter(dayjs()) && b.status !== "completed"
  ).length;
  const completedBookings = bookings.filter((b) => b.status === "completed")
    .length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  // Calendar: render bookings for each day
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
              text={`${b.user?.name || b.name} (${b.services
                .map((s) => s.serviceId?.name)
                .join(", ")})`}
            />
          </li>
        ))}
      </ul>
    );
  };

  // Handle calendar date click
  const onSelectDate = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    const dayBookings = bookings.filter(
      (b) => dayjs(b.selectedDate).format("YYYY-MM-DD") === dateStr
    );
    setSelectedDateBookings(dayBookings);
    setModalVisible(true);
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

      {/* Count Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text strong>Total Bookings</Text>
            <Title level={3}>{totalBookings}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text strong>Upcoming</Text>
            <Title level={3}>{upcomingBookings}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text strong>Completed</Text>
            <Title level={3}>{completedBookings}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Text strong>Pending</Text>
            <Title level={3}>{pendingBookings}</Title>
          </Card>
        </Col>
      </Row>

      {/* Profile Info */}
      <Card title="Profile Information" style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Text strong>Name:</Text> {profile.name}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Email:</Text> {profile.email}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Phone:</Text> {profile.phone}
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Status:</Text>{" "}
            <Tag color={profile.status === "approved" ? "green" : "orange"}>
              {profile.status?.toUpperCase()}
            </Tag>
          </Col>
        </Row>
      </Card>

      {/* Booking Calendar */}
      <Card title="Booking Calendar">
        <Calendar dateCellRender={dateCellRender} onSelect={onSelectDate} />
      </Card>

      {/* Modal to show bookings on selected date */}
      <Modal
        title="Bookings on Selected Date"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedDateBookings.length === 0 ? (
          <Text>No bookings for this date.</Text>
        ) : (
          <List
            itemLayout="vertical"
            dataSource={selectedDateBookings}
            renderItem={(b) => (
              <List.Item key={b._id}>
                <Row gutter={[12, 12]} align="middle">
                  <Col xs={24} sm={6}>
                    <Image
                      src={b.services[0]?.serviceId?.imageUrl}
                      width={80}
                      preview={false}
                    />
                  </Col>
                  <Col xs={24} sm={18}>
                    <Text strong>{b.user?.name || b.name}</Text> <br />
                    <Text type="secondary">
                      Services:{" "}
                      {b.services.map((s) => s.serviceId?.name).join(", ")}
                    </Text>
                    <br />
                    <Text>Total: ₹{b.totalAmount}</Text>
                    <br />
                    <Text>Payment: {b.paymentMethod.toUpperCase()}</Text>
                    <br />
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
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        )}
      </Modal>
    </div>
  );
}
  