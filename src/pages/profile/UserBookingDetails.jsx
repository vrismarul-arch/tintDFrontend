import React, { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Spin,
  message,
  Button,
  Divider,
  Typography,
  Avatar,
  Steps,
  Row,
  Col,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  StopOutlined,
} from "@ant-design/icons";
import api from "../../../api";
import "./UserBookingDetails.css";

const { Title, Text } = Typography;
const { Step } = Steps;

export default function UserBookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await api.get("/api/bookings/my", { headers });
        const single = res.data.find((b) => b._id === id);

        if (!single) {
          message.error("Booking not found");
          setBooking(null);
          return;
        }
        setBooking(single);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "2rem auto" }} />;
  }

  if (!booking) return <p>Booking not found</p>;

  const selectedDate = booking.selectedDate
    ? new Date(booking.selectedDate).toLocaleDateString("en-GB")
    : "-";
  const selectedTime = booking.selectedTime
    ? new Date(booking.selectedTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "-";

  // Progress tracker mapping
  const statusSteps = ["pending", "confirmed", "in-progress", "completed"];
  const currentStep = statusSteps.indexOf(booking.status?.toLowerCase());

  return (
    <div className="booking-details-wrapper">
      {/* Back Button */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        Back to My Bookings
      </Button>

      {/* Hero Section */}
      <Card className="hero-card" bordered={false}>
        <div className="hero-left">
          <Title level={4}>Booking #{booking.bookingId || booking._id}</Title>
          <Tag
            className="status-tag"
            color={
              booking.status === "completed"
                ? "green"
                : booking.status === "cancelled"
                ? "red"
                : booking.status === "confirmed"
                ? "blue"
                : "gold"
            }
          >
            {booking.status?.toUpperCase() || "PENDING"}
          </Tag>
          <div className="hero-meta">
            <Text>
              <CalendarOutlined /> {selectedDate}
            </Text>
            <Text>
              <ClockCircleOutlined /> {selectedTime}
            </Text>
          </div>
        </div>
        <div className="hero-right">
          <Text className="total-price">₹{booking.totalAmount}</Text>
          <Text type="secondary">{booking.paymentMethod || "—"}</Text>
          <div className="hero-actions">
            <Button icon={<FilePdfOutlined />}>Download Invoice</Button>
            <Button danger icon={<StopOutlined />}>
              Cancel Booking
            </Button>
            <Button type="primary" icon={<ReloadOutlined />}>
              Re-Book
            </Button>
          </div>
        </div>
      </Card>

      {/* Order Progress */}
      <Card className="progress-card" bordered={false}>
        <Steps
          size="small"
          current={currentStep >= 0 ? currentStep : 0}
          responsive
        >
          <Step title="Pending" />
          <Step title="Confirmed" />
          <Step title="In Progress" />
          <Step title="Completed" />
        </Steps>
      </Card>

      <Row gutter={[16, 16]} className="content-row">
        {/* Left: Services */}
        <Col xs={24} md={16}>
          <Card className="section-card" bordered={false}>
            <Divider orientation="left">Services</Divider>
            <div className="services-list">
              {booking.services?.map((s) => {
                const img = s.serviceId?.imageUrl || s.imageUrl;
                const name = s.serviceId?.name || s.name;
                return (
                  <Card key={s._id} className="service-card" bordered>
                    <Avatar
                      shape="square"
                      size={80}
                      src={img}
                      icon={<UserOutlined />}
                    />
                    <div className="service-info">
                      <Text strong>{name}</Text>
                      <Tag color="blue">Service</Tag>
                      <Text type="secondary">Qty: 1</Text>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* Right: Summary */}
        <Col xs={24} md={8}>
          <Card className="section-card" bordered={false}>
            <Divider orientation="left">Customer Info</Divider>
            <Text strong>{booking.user?.name || booking.name}</Text>
            <br />
            <Text>{booking.user?.email || booking.email}</Text>
            <br />
            <Text>{booking.user?.phone || booking.phone}</Text>
            <br />
            <Text>{booking.address || "-"}</Text>
          </Card>

          {booking.assignedTo && (
            <Card className="section-card" bordered={false}>
              <Divider orientation="left">Assigned Partner</Divider>
              <Text strong>{booking.assignedTo.name}</Text>
              <br />
              <Text>{booking.assignedTo.email}</Text>
              <br />
              <Text>{booking.assignedTo.phone}</Text>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
