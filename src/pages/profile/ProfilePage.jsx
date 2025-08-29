import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Avatar,
  Tabs,
  List,
  message,
  Spin,
  Form,
  Input,
  Upload,
  Drawer,
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

  // fetch user + bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [userRes, bookingRes] = await Promise.all([
          api.get("/api/profile", { headers }),
          api.get("/api/profile/bookings", { headers }),
        ]);

        setUser(userRes.data);
        setBookings(bookingRes.data);

        // normalize avatar for Upload
        form.setFieldsValue({
          ...userRes.data,
          avatar: userRes.data.avatar
            ? [
                {
                  uid: "-1",
                  name: "avatar.png",
                  status: "done",
                  url: userRes.data.avatar,
                },
              ]
            : [],
        });
      } catch {
        message.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [form]);

  // save profile update
  const onFinish = async (values) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === "avatar" && values.avatar?.[0]?.originFileObj) {
          formData.append("avatar", values.avatar[0].originFileObj);
        } else if (key === "avatar" && values.avatar?.[0]?.url) {
          // already uploaded avatar, keep url
        } else if (values[key]) {
          formData.append(key, values[key]);
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

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Desktop card */}
      <Card className="hidden md:block profile-card">
        <div className="profile-header">
          <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} />
          <div className="info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <p>{user?.phone}</p>
          </div>
          <div>
            <Button type="primary" onClick={() => setDrawerOpen(true)}>
              Edit
            </Button>
          </div>
        </div>

        {/* Tabs with AntD v5 style */}
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Profile Info",
              children: (
                <>
                  <p><b>Name:</b> {user?.name}</p>
                  <p><b>Email:</b> {user?.email}</p>
                  <p><b>Phone:</b> {user?.phone}</p>
                  <p><b>Address:</b> {user?.address}</p>
                </>
              ),
            },
            {
              key: "2",
              label: "Booking History",
              children: bookings.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <List
                  dataSource={bookings}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar src={item.services[0]?.serviceId?.imageUrl} />}
                        title={`Booking ID: ${item._id}`}
                        description={`Total: ₹${item.totalAmount}`}
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Mobile version */}
      <div className="md:hidden mobile-profile">
        <Avatar size={64} src={user?.avatar} icon={<UserOutlined />} />
        <h3>{user?.name}</h3>
        <p>{user?.email}</p>
        <p>{user?.phone}</p>
        <p>{user?.address}</p>
        <Button type="primary" block onClick={() => setDrawerOpen(true)}>
          Edit
        </Button>
      </div>

      {/* Drawer for editing profile */}
      <Drawer
        title="Edit Profile"
        width={400}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button onClick={() => form.submit()} type="primary" loading={saving}>
            Save
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Full Name">
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="Enter phone" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Enter address" />
          </Form.Item>
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
