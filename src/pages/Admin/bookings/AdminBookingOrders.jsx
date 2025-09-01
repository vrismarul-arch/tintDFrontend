import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Card, Spin, message, Modal, Select, Popconfirm } from "antd";
import axios from "axios";
import "./AdminBookingOrders.css";

const { Option } = Select;

export default function AdminBookingOrders() {
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);

  useEffect(() => {
    fetchBookingsAndEmployees();
  }, []);

  const fetchBookingsAndEmployees = async () => {
    try {
      // 🟢 Assuming a '/api/employees' endpoint exists to get the list of employees
      const [bookingsRes, employeesRes] = await Promise.all([
        axios.get("/api/bookings/admin", { withCredentials: true }),
        axios.get("/api/employees", { withCredentials: true }),
      ]);
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data?.bookings || []);
      setEmployees(employeesRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
      message.error("Failed to load bookings or employees");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    try {
      await axios.put(`/api/bookings/${currentBooking._id}`, values, { withCredentials: true });
      message.success("Booking updated successfully!");
      setIsModalVisible(false);
      fetchBookingsAndEmployees(); // Refresh the list
    } catch (err) {
      message.error("Failed to update booking.");
      console.error(err);
    }
  };

  const showUpdateModal = (booking) => {
    setCurrentBooking(booking);
    setIsModalVisible(true);
  };
  
  const handleCancelBooking = async (id) => {
    try {
      await axios.put(`/api/bookings/${id}`, { status: 'cancelled' }, { withCredentials: true });
      message.success("Booking cancelled successfully.");
      fetchBookingsAndEmployees();
    } catch (err) {
      message.error("Failed to cancel booking.");
      console.error(err);
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
      title: "Date & Time",
      key: "dateTime",
      render: (_, record) => (
        <div>
          {record.selectedDate ? new Date(record.selectedDate).toLocaleDateString("en-GB") : "-"}
          <br />
          {record.selectedTime ? new Date(record.selectedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
        </div>
      )
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
        const color = status === "confirmed" ? "green" : status === "pending" ? "gold" : "red";
        return <Tag color={color}>{status?.toUpperCase() || "N/A"}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button type="default" size="small" onClick={() => showUpdateModal(record)}>
            Update
          </Button>
          <Popconfirm
            title="Are you sure you want to cancel this booking?"
            onConfirm={() => handleCancelBooking(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger size="small">Cancel</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

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
      {currentBooking && (
        <Modal
          title={`Update Booking ${currentBooking.bookingId}`}
          visible={isModalVisible}
          onOk={() => {
            const statusValue = document.getElementById("status-select").value;
            const assignedToValue = document.getElementById("employee-select").value;
            handleUpdate({
              status: statusValue,
              assignedTo: assignedToValue === "" ? null : assignedToValue,
            });
          }}
          onCancel={() => setIsModalVisible(false)}
        >
          <p>Update Status:</p>
          <Select
            id="status-select"
            defaultValue={currentBooking.status}
            style={{ width: "100%", marginBottom: "1rem" }}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
          
          <p>Assign Employee:</p>
          <Select
            id="employee-select"
            defaultValue={currentBooking.assignedTo?._id || ""}
            style={{ width: "100%" }}
            placeholder="Select an employee"
          >
            <Option value="">Unassigned</Option>
            {employees.map((emp) => (
              <Option key={emp._id} value={emp._id}>
                {emp.fullName}
              </Option>
            ))}
          </Select>
        </Modal>
      )}
    </Card>
  );
}