import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, Button, Avatar, Tabs, List, message, Spin,
  Form, Input, Upload, Drawer, Modal
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import api from "../../../api";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // -----------------------
  // ✅ Protect page
  // -----------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Please login first");
      navigate("/login");
    }
  }, [navigate]);

  // -----------------------
  // Fetch profile & bookings
  // -----------------------
  const fetchProfileAndBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, bookingRes] = await Promise.all([
        api.get("/api/profile", { headers }),
        api.get("/api/bookings/my", { headers }),
      ]);

      setUser(userRes.data);
      setBookings(Array.isArray(bookingRes.data) ? bookingRes.data : []);

      form.setFieldsValue({
        ...userRes.data,
        avatar: userRes.data?.avatar
          ? [{ uid: "-1", name: "avatar.png", status: "done", url: userRes.data.avatar }]
          : [],
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to load profile or bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndBookings();
  }, []);

  // -----------------------
  // Update profile
  // -----------------------
  const onFinish = async (values) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === "avatar") {
          const file = Array.isArray(val) ? val[0] : null;
          if (file?.originFileObj) formData.append("avatar", file.originFileObj);
        } else if (val) {
          formData.append(key, val);
        }
      });

      const res = await api.put("/api/profile/update", formData, {
        headers: { ...headers, "Content-Type": "multipart/form-data" },
      });

      message.success("Profile updated!");
      setUser(res.data);
      setDrawerOpen(false);
    } catch {
      message.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------
  // Delete booking
  // -----------------------
  const handleDeleteBooking = (bookingId) => {
    Modal.confirm({
      title: "Delete this booking?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          const headers = { Authorization: `Bearer ${token}` };
          await api.delete(`/api/bookings/${bookingId}`, { headers });

          const updated = await api.get("/api/bookings/my", { headers });
          setBookings(Array.isArray(updated.data) ? updated.data : []);
          message.success("Booking deleted");
        } catch {
          message.error("Failed to delete booking");
        }
      },
    });
  };

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="profile-container">
      {/* Desktop Profile */}
      <Card className="hidden md:block profile-card">
        <div className="profile-header">
          <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} />
          <div className="info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p>{user?.phone}</p>
          </div>
          <div>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>Edit</Button>
          </div>
        </div>

        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Profile Info",
              children: (
                <>
                  <p><b>Name:</b> {user?.name || "-"}</p>
                  <p><b>Email:</b> {user?.email || "-"}</p>
                  <p><b>Phone:</b> {user?.phone || "-"}</p>
                  <p><b>Address:</b> {user?.address || "-"}</p>
                </>
              ),
            },
            {
              key: "2",
              label: "Booking History",
              children: !bookings?.length ? (
                <p>No bookings yet.</p>
              ) : (
                <List
                  dataSource={bookings}
                  rowKey={(it) => it._id}
                  renderItem={(item) => {
                    const dateStr = item.selectedDate ? new Date(item.selectedDate).toLocaleDateString() : "-";
                    const timeStr = item.selectedTime ? new Date(item.selectedTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }) : "-";

                    const firstService = item?.services?.[0] || {};
                    const firstServiceName = firstService?.serviceId?.name || firstService?.name || "Service";
                    const firstServiceImage = firstService?.serviceId?.imageUrl || firstService?.imageUrl;

                    return (
                      <List.Item
                        actions={[
                          <Button type="link" key="view" onClick={() => navigate(`/profile/bookings/${item._id}`)}>View</Button>,
                          <Button type="link" danger key="delete" onClick={() => handleDeleteBooking(item._id)}>Delete</Button>
                        ]}
                      >
                        <List.Item.Meta
                          avatar={<Avatar src={firstServiceImage} icon={<UserOutlined />} />}
                          title={`Booking ID: ${item.bookingId || item._id}`}
                          description={
                            <>
                              <div>Service: {firstServiceName}</div>
                              <div>Total: ₹{item.totalAmount}</div>
                              <div>Date: {dateStr}</div>
                              <div>Time: {timeStr}</div>
                              <div>Status: {item.status || "pending"}</div>
                            </>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Mobile Profile */}
      <div className="md:hidden mobile-profile">
        <Avatar size={64} src={user?.avatar} icon={<UserOutlined />} />
        <h3>{user?.name}</h3>
        <p>{user?.email}</p>
        <p>{user?.phone}</p>
        <p>{user?.address}</p>
        <Button type="primary" block onClick={() => setDrawerOpen(true)}>Edit</Button>
      </div>

      {/* Drawer */}
      <Drawer
        title="Edit Profile"
        width={400}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={<Button onClick={() => form.submit()} type="primary" loading={saving}>Save</Button>}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Full Name"><Input placeholder="Enter name" /></Form.Item>
          <Form.Item name="phone" label="Phone Number"><Input placeholder="Enter phone" /></Form.Item>
          <Form.Item name="address" label="Address"><Input placeholder="Enter address" /></Form.Item>
          <Form.Item
            name="avatar"
            label="Profile Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
