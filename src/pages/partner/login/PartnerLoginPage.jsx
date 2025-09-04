// src/pages/partners/PartnerLoginPage.jsx
import { useState } from "react";
import { Form, Input, Button, message, Typography } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth.js";
import './PartnerLoginPage.css';

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
    <div className="partner-login-wrapper">
      {/* Left illustration / background */}
      <div className="partner-login-left">
        <img
          src="https://images.unsplash.com/photo-1588776814546-15a4e7f43b17?auto=format&fit=crop&w=1470&q=80"
          alt="Salon Background"
          className="bg-image"
        />
      </div>

      {/* Right login card */}
      <div className="partner-login-right">
        <div className="partner-login-card">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3062/3062634.png"
            alt="Partner Logo"
            className="logo"
          />
          <Title level={3} style={{ marginBottom: 0, textAlign: 'center' }}>Partner Login</Title>
          <Text type="secondary" className="text-center mb-4">Use Partner ID or Email to login</Text>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item name="partnerId">
              <Input
                prefix={<UserOutlined />}
                placeholder="Partner ID (optional)"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[{ type: "email", message: "Invalid email" }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Email (optional)"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Button type="primary" htmlType="submit" block loading={loading} size="large" className="rounded-lg">
              Login
            </Button>
          </Form>

          <div className="forgot-password">
            <Text type="secondary">
              Forgot password? <a href="/partners/forgot-password">Reset here</a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
