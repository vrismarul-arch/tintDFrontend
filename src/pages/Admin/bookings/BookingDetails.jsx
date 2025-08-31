import React, { useEffect, useState } from "react";
import { Card, Spin, Tag, Descriptions, message } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../../api";

export default function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/api/admin/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        message.error("Failed to load booking details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;

  if (!booking) return <p>No booking found</p>;

  return (
    <Card title="Booking Details">
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Customer Name">{booking.user?.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{booking.user?.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{booking.phone}</Descriptions.Item>
        <Descriptions.Item label="Address">{booking.address}</Descriptions.Item>
        <Descriptions.Item label="Services">
          {booking.services.map((s) => (
            <Tag key={s._id}>
              {s.name} x{s.quantity} (${s.price})
            </Tag>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">${booking.totalAmount}</Descriptions.Item>
        <Descriptions.Item label="Assigned Employee">
          {booking.assignedTo?.name || "Unassigned"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">{booking.status.toUpperCase()}</Descriptions.Item>
        <Descriptions.Item label="Date">{new Date(booking.date).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="Time">{new Date(booking.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
