import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Card, Spin, message } from "antd";
import axios from "axios";
import "./AdminBookingOrders.css";

export default function AdminBookingOrders() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/bookings/admin", { withCredentials: true });
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.bookings || [];
      setBookings(data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      render: (id) => <strong>{id}</strong>,
    },
    {
      title: "Customer",
      dataIndex: "user",
      key: "user",
      render: (_, record) => (
        <div>
          <strong>{record.name || record.user?.name || "Unknown"}</strong>
          <br />
          <span>{record.email || record.user?.email || "-"}</span>
          <br />
          <span>{record.phone || record.user?.phone || "-"}</span>
        </div>
      ),
    },
    {
      title: "Services",
      dataIndex: "services",
      key: "services",
      render: (services) =>
        services?.length > 0 ? (
          services.map((s) => (
            <Tag key={s._id || s.serviceId?._id} color="blue">
              {s.serviceId?.name || s.name} x {s.quantity || 1}
            </Tag>
          ))
        ) : (
          <span>-</span>
        ),
    },
    {
      title: "Date",
      dataIndex: "selectedDate",
      key: "date",
      render: (date) => (date ? new Date(date).toLocaleDateString("en-GB") : "-"),
    },
    {
      title: "Time",
      dataIndex: "selectedTime",
      key: "time",
      render: (time) =>
        time
          ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-",
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (staff) => staff?.fullName || <span style={{ color: "#888" }}>Unassigned</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "confirmed" ? "green" : status === "pending" ? "gold" : "red";
        return <Tag color={color}>{status?.toUpperCase() || "N/A"}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => viewBooking(record._id)}>
          View
        </Button>
      ),
    },
  ];

  const viewBooking = (id) => {
    // Navigate to booking details page, e.g., using react-router
    window.location.href = `/admin/bookings/${id}`;
  };

  return (
    <Card title="📋 Booking Orders" className="booking-orders-card">
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={bookings}
          pagination={{ pageSize: 8 }}
          bordered
        />
      )}
    </Card>
  );
}
