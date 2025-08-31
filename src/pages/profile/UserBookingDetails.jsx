import React, { useEffect, useState } from "react";
import { Card, Descriptions, Tag, Spin, message } from "antd";
import { useParams } from "react-router-dom";
import api from "../../../api";

export default function UserBookingDetails() {
  const { id } = useParams(); // _id of booking from URL
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all bookings for the logged-in user
        const res = await api.get("/api/bookings/my", { headers });

        // Find booking by _id
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
    return (
      <Spin
        size="large"
        style={{ display: "block", margin: "2rem auto" }}
      />
    );
  }

  if (!booking) return <p>Booking not found</p>;

  // Format date and time
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

  return (
    <Card title={`Booking Details - ${booking.bookingId || booking._id}`}>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Name">{booking.user?.name || booking.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{booking.user?.email || booking.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{booking.user?.phone || booking.phone}</Descriptions.Item>
        <Descriptions.Item label="Address">{booking.address || "-"}</Descriptions.Item>

        <Descriptions.Item label="Services">
          {booking.services?.map((s) => (
            <Tag key={s.serviceId?._id || s._id}>{s.serviceId?.name || s.name}</Tag>
          ))}
        </Descriptions.Item>

        <Descriptions.Item label="Total Amount">₹{booking.totalAmount}</Descriptions.Item>
        <Descriptions.Item label="Payment Method">{booking.paymentMethod || "-"}</Descriptions.Item>
        <Descriptions.Item label="Date">{selectedDate}</Descriptions.Item>
        <Descriptions.Item label="Time">{selectedTime}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={booking.status === "confirmed" ? "green" : "gold"}>
            {booking.status?.toUpperCase() || "PENDING"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
