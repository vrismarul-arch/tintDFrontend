import React, { useEffect, useState } from "react";
import { Descriptions, Spin, Tag, message } from "antd";
import api from "../../../../api";

const BookingDetails = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch booking details
  const fetchBookingDetails = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/admin/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBooking(res.data.booking || null);
    } catch (err) {
      console.error("Failed to fetch booking details:", err);
      message.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  if (loading) return <Spin tip="Loading booking details..." />;
  if (!booking) return <p>No details available</p>;

  // Decide customer info
  const customerName = booking.user?.name || booking.name || "Unknown";
  const customerEmail = booking.user?.email || booking.email || "-";
  const customerPhone = booking.user?.phone || booking.phone || "-";

  return (
    <Descriptions
      bordered
      column={1}
      size="middle"
      styles={{ label: { fontWeight: "bold" } }}
    >
      <Descriptions.Item label="Booking ID">
        {booking.bookingId || booking._id}
      </Descriptions.Item>

      <Descriptions.Item label="Customer">
        {customerName} <br />
        {customerEmail} <br />
        {customerPhone}
      </Descriptions.Item>

      <Descriptions.Item label="Address">{booking.address || "-"}</Descriptions.Item>

      <Descriptions.Item label="Services">
        {booking.services?.length > 0 ? (
          booking.services.map((s) => (
            <Tag key={s._id || s.serviceId?._id} color="blue">
              {s.serviceId?.name || "Service"} × {s.quantity || 1}
            </Tag>
          ))
        ) : (
          "-"
        )}
      </Descriptions.Item>

      <Descriptions.Item label="Date & Time">
        {booking.selectedDate
          ? new Date(booking.selectedDate).toLocaleDateString("en-GB")
          : "-"}{" "}
        {booking.selectedTime
          ? new Date(booking.selectedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : ""}
      </Descriptions.Item>

      <Descriptions.Item label="Assigned Staff">
        {booking.assignedTo?.name || "Unassigned"}
      </Descriptions.Item>

      <Descriptions.Item label="Payment Method">
        {booking.paymentMethod || "-"}
      </Descriptions.Item>

      <Descriptions.Item label="Total Amount">
        ₹{booking.totalAmount || 0}
      </Descriptions.Item>

      <Descriptions.Item label="Status">
        <Tag
          color={
            booking.status === "confirmed"
              ? "green"
              : booking.status === "pending"
              ? "gold"
              : "red"
          }
        >
          {booking.status?.toUpperCase()}
        </Tag>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default BookingDetails;
