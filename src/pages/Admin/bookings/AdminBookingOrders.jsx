import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Popconfirm,
  Spin,
  message,
  Modal,
  Select,
  Drawer,
  Dropdown,
  Menu,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import api from "../../../../api";
import BookingDetails from "./BookingDetails";

const { Option } = Select;

const AdminBookingOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBookings(Array.isArray(res.data) ? res.data : res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    try {
      await api.delete(`/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      message.success("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      message.error("Failed to cancel booking");
    }
  };

  const showUpdateModal = (record) => {
    setCurrentBooking(record);
    setNewStatus(record.status || "pending");
    setUpdateModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!currentBooking) return;
    try {
      await api.put(
        `/api/admin/bookings/${currentBooking._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      message.success("Booking status updated successfully");
      setUpdateModalVisible(false);
      fetchBookings();
    } catch (err) {
      console.error("Failed to update booking:", err);
      message.error("Failed to update booking");
    }
  };

  const showDrawer = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDrawerVisible(true);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return isNaN(d) ? "-" : d.toLocaleDateString("en-GB");
  };

  const formatTime = (time) => {
    if (!time) return "-";
    const t = new Date(time);
    return isNaN(t)
      ? "-"
      : t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const columns = [
    { title: "#", render: (_, __, index) => index + 1, width: 50 },
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      render: (id) => <strong>{id}</strong>,
      responsive: ["sm"],
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => {
        const user = record.user || {};
        return (
          <div>
            <strong>{user.name || record.name || "Unknown"}</strong>
            <br />
            <span>{user.email || record.email || "-"}</span>
            <br />
            <span>{user.phone || record.phone || "-"}</span>
          </div>
        );
      },
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
    {
      title: "Services",
      dataIndex: "services",
      key: "services",
      render: (services) =>
        services?.length > 0 ? (
          services.map((s) => (
            <Tag key={s._id || s.serviceId?._id} color="blue">
              {s.serviceId?.name || s.name} × {s.quantity || 1}
            </Tag>
          ))
        ) : (
          <span>-</span>
        ),
      responsive: ["md", "lg", "xl"],
    },
    {
      title: "Date & Time",
      key: "dateTime",
      render: (_, record) => (
        <div>
          {formatDate(record.selectedDate)}
          <br />
          {formatTime(record.selectedTime)}
        </div>
      ),
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (staff) =>
        staff?.name || <span style={{ color: "#888" }}>Unassigned</span>,
      responsive: ["md", "lg", "xl"],
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
            : "red";
        return <Tag color={color}>{status?.toUpperCase() || "N/A"}</Tag>;
      },
      responsive: ["sm", "md", "lg", "xl"],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item key="view">
              <Button type="text" onClick={() => showDrawer(record._id)}>
                View
              </Button>
            </Menu.Item>
            <Menu.Item key="update">
              <Button type="text" onClick={() => showUpdateModal(record)}>
                Update
              </Button>
            </Menu.Item>
            <Menu.Item key="cancel">
              <Popconfirm
                title="Are you sure you want to cancel this booking?"
                onConfirm={() => handleCancelBooking(record._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger>
                  Cancel
                </Button>
              </Popconfirm>
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button icon={<EllipsisOutlined />} />
          </Dropdown>
        );
      },
      responsive: ["xs", "sm", "md", "lg", "xl"],
    },
  ];

  return (
    <>
      {loading ? (
        <Spin tip="Loading bookings..." />
      ) : (
        <Table
          dataSource={bookings}
          columns={columns}
          rowKey="_id"
          scroll={{ x: "max-content" }}
        />
      )}

      <Modal
        title="Update Booking Status"
        open={updateModalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => setUpdateModalVisible(false)}
        okText="Update"
      >
        <Select
          value={newStatus}
          onChange={setNewStatus}
          style={{ width: "100%" }}
        >
          <Option value="pending">Pending</Option>
          <Option value="confirmed">Confirmed</Option>
          <Option value="cancelled">Cancelled</Option>
        </Select>
      </Modal>

      <Drawer
        title="Booking Details"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={720}
      >
        {selectedBookingId && <BookingDetails bookingId={selectedBookingId} />}
      </Drawer>
    </>
  );
};

export default AdminBookingOrders;
