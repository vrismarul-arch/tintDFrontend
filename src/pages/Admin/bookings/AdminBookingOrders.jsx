import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Spin,
  Modal,
  Select,
  Drawer,
  Dropdown,
  Menu,
  Tabs,
  Popconfirm,
  Button,
} from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import api from "../../../../api";
import BookingDetails from "./BookingDetails";

const { Option } = Select;
const { TabPane } = Tabs;

const AdminBookingOrders = () => {
  const [bookings, setBookings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch approved partners
  const fetchPartners = async () => {
    try {
      const res = await api.get("/api/admin/partners", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPartners(res.data || []);
    } catch (err) {
      console.error("Failed to fetch partners:", err);
      toast.error("Failed to load partners");
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchPartners();
  }, []);

  // Cancel booking
  const handleCancelBooking = async (id) => {
    try {
      await api.delete(`/api/admin/bookings/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Booking cancelled successfully");
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "cancelled" } : b
        )
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      toast.error("Failed to cancel booking");
    }
  };

  // Show update status modal
  const showUpdateModal = (record) => {
    setCurrentBooking(record);
    setNewStatus(record.status || "pending");
    setUpdateModalVisible(true);
  };

  // Update status
  const handleUpdateStatus = async () => {
    if (!currentBooking) return;
    try {
      const res = await api.put(
        `/api/admin/bookings/${currentBooking._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      toast.success("Booking status updated successfully");
      setUpdateModalVisible(false);

      const updatedBooking = res.data.booking;
      setBookings((prev) =>
        prev.map((b) =>
          b._id === currentBooking._id ? updatedBooking : b
        )
      );
      setCurrentBooking(updatedBooking);
    } catch (err) {
      console.error("Failed to update booking:", err);
      toast.error("Failed to update booking");
    }
  };

  // Show assign staff modal
  const showAssignModal = (record) => {
    setCurrentBooking(record);
    setSelectedPartner(record.assignedTo?._id || null);
    setAssignModalVisible(true);
  };

 // Assign staff to booking without changing status
const handleAssignStaff = async () => {
  if (!currentBooking || !selectedPartner) {
    toast.error("Please select a partner to assign");
    return;
  }
  try {
    const res = await api.put(
      `/api/admin/bookings/${currentBooking._id}/assign`,
      { partnerId: selectedPartner },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    // ✅ Only update assignedTo, keep status as-is
    const updatedBooking = res.data.booking;

    toast.success("Staff assigned successfully");
    setAssignModalVisible(false);

    setBookings((prev) =>
      prev.map((b) =>
        b._id === currentBooking._id ? updatedBooking : b
      )
    );
    setCurrentBooking(updatedBooking);
  } catch (err) {
    console.error("Failed to assign staff:", err);
    toast.error("Failed to assign staff");
  }
};


  // Show booking drawer
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

  const filteredBookings = (status) =>
    bookings.filter((b) => (status === "all" ? true : b.status === status));

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
    },
    {
      title: "Assigned Staff",
      key: "assignedTo",
      render: (_, record) =>
        record.assignedTo?.name || <Tag color="red">Unassigned</Tag>,
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
                Update Status
              </Button>
            </Menu.Item>
            <Menu.Item key="assign">
              <Button type="text" onClick={() => showAssignModal(record)}>
                Assign Staff
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
    },
  ];

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="line"
        style={{ marginBottom: 16 }}
      >
        <TabPane tab={`All (${bookings.length})`} key="all">
          {loading ? (
            <Spin tip="Loading bookings..." />
          ) : (
            <Table
              dataSource={filteredBookings("all")}
              columns={columns}
              rowKey="_id"
              scroll={{ x: "max-content" }}
            />
          )}
        </TabPane>
        <TabPane
          tab={`Pending (${filteredBookings("pending").length})`}
          key="pending"
        >
          {loading ? (
            <Spin tip="Loading bookings..." />
          ) : (
            <Table
              dataSource={filteredBookings("pending")}
              columns={columns}
              rowKey="_id"
              scroll={{ x: "max-content" }}
            />
          )}
        </TabPane>
        <TabPane
          tab={`Confirmed (${filteredBookings("confirmed").length})`}
          key="confirmed"
        >
          {loading ? (
            <Spin tip="Loading bookings..." />
          ) : (
            <Table
              dataSource={filteredBookings("confirmed")}
              columns={columns}
              rowKey="_id"
              scroll={{ x: "max-content" }}
            />
          )}
        </TabPane>
        <TabPane
          tab={`Cancelled (${filteredBookings("cancelled").length})`}
          key="cancelled"
        >
          {loading ? (
            <Spin tip="Loading bookings..." />
          ) : (
            <Table
              dataSource={filteredBookings("cancelled")}
              columns={columns}
              rowKey="_id"
              scroll={{ x: "max-content" }}
            />
          )}
        </TabPane>
      </Tabs>

      {/* Update Status Modal */}
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

      {/* Assign Staff Modal */}
      <Modal
        title="Assign Staff"
        open={assignModalVisible}
        onOk={handleAssignStaff}
        onCancel={() => setAssignModalVisible(false)}
        okText="Assign"
      >
        <Select
          value={selectedPartner}
          onChange={setSelectedPartner}
          style={{ width: "100%" }}
          placeholder="Select a partner"
        >
          {partners.map((p) => (
            <Option key={p._id} value={p._id}>
              {p.name} ({p.email})
            </Option>
          ))}
        </Select>
      </Modal>

      {/* Drawer for Booking Details */}
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
