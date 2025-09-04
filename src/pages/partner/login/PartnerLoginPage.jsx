// src/pages/partners/PartnerLoginPage.jsx
import { useState } from "react";
import { Form, Input, Button, message, Card, Typography } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth.js";

const { Title, Text } = Typography;

export default function PartnerLoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = usePartnerAuth();

  const onFinish = async (values) => {
    const { partnerId, email, password } = values;
    if ((!partnerId && !email) || !password) {
      message.error("Enter Partner ID or Email, and Password");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/partners/login", { partnerId, email, password });

      // Save partner data & token
      login(data);

      message.success("Login successful!");
      navigate("/partner/dashboard");
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card style={{ width: 400, borderRadius: 16, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
        <div className="text-center mb-6">
          <Title level={3} style={{ marginBottom: 0 }}>Partner Login</Title>
          <Text type="secondary">Use your Partner ID or Email</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="partnerId">
            <Input prefix={<UserOutlined />} placeholder="Partner ID (optional)" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ type: "email", message: "Invalid email" }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email (optional)" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
