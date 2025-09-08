import React, { useEffect, useState } from "react";
import { Table, Tag, Spin, message } from "antd";
import api from "../../../../../api";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth";

export default function PartnerOrderHistory() {
  const { partner } = usePartnerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!partner?.token) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/partners/bookings/history", {
          headers: { Authorization: `Bearer ${partner.token}` },
        });
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [partner?.token]);

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
    {
      title: "Customer",
      dataIndex: "user",
      key: "user",
      render: (user, record) => user?.name || record.name,
    },
    {
      title: "Phone",
      dataIndex: "user",
      key: "phone",
      render: (user, record) => user?.phone || record.phone,
    },
    {
      title: "Services",
      dataIndex: "services",
      key: "services",
      render: (services) =>
        services.map((s) => (
          <Tag key={s._id}>{s.serviceId?.name || s.name}</Tag>
        )),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Date",
      dataIndex: "selectedDate",
      key: "selectedDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      title: "Time",
      dataIndex: "selectedTime",
      key: "selectedTime",
      render: (time) =>
        time
          ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "confirmed"
            ? "green"
            : status === "pending"
            ? "gold"
            : status === "completed"
            ? "blue"
            : "red";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Payment",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
  ];

  if (loading) return <Spin size="large" style={{ display: "block", margin: "2rem auto" }} />;

  return (
    <div>
      <h2>My Order History</h2>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
