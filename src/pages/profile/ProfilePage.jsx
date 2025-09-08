// src/pages/profile/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Avatar,
  message,
  Spin,
  Form,
  Input,
  Upload,
  Drawer,
  Typography,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import api from "../../../api";
import "./ProfilePage.css";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Protect page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      message.warning("Please login first");
      navigate("/login");
    }
  }, [navigate]);

  // Fetch profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const userRes = await api.get("/api/profile", { headers });

      setUser(userRes.data);
      form.setFieldsValue({
        ...userRes.data,
        avatar: userRes.data?.avatar
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
    } catch (err) {
      console.error(err);
      message.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update profile
  const onFinish = async (values) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (key === "avatar") {
          const file = Array.isArray(val) ? val[0] : null;
          if (file?.originFileObj)
            formData.append("avatar", file.originFileObj);
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

  if (loading)
    return (
      <div className="flex-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="profile-wrapper">
      <Card className="profile-card-modern">
        <div className="profile-header-modern">
          <Avatar size={100} src={user?.avatar} icon={<UserOutlined />} />
          <div className="profile-info">
            <Title level={3} className="profile-name">
              {user?.name}
            </Title>
            <Text type="secondary">{user?.email}</Text>
            <p>{user?.phone || "No phone added"}</p>
            <p>{user?.address || "No address added"}</p>
          </div>
        </div>

        <div className="profile-actions">
          <Button
            type="primary"
            block
            shape="round"
            size="large"
            onClick={() => setDrawerOpen(true)}
          >
            Edit Profile
          </Button>
          <Button
            block
            shape="round"
            size="large"
            onClick={() => navigate("/booking-history")}
          >
            View Booking History
          </Button>
        </div>
      </Card>

      {/* Drawer */}
      <Drawer
        title="Edit Profile"
        width={420}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Button
            onClick={() => form.submit()}
            type="primary"
            shape="round"
            loading={saving}
          >
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
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
