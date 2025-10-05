import { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../../../api";
import "./auth.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Email/Password login
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", values);

      // Save token and role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      message.success("Login successful");

      // Redirect based on role
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Google login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post("/api/auth/google", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      message.success("Google login successful");

      // Redirect based on role
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      message.error("Google login failed");
    }
  };

  return (
    <div className="auth-container">
      {/* Left side with background image */}
      <div className="auth-left">
        <div className="overlay" />
      </div>

      {/* Right side with form */}
      <div className="auth-right">
        <div className="auth-box">
          <img src="/tintD.png" alt="Logo" className="uc-logo" />
          <h2 className="title text-center">Login to Doorstep</h2>

         

          {/* Form */}
          <Form onFinish={onFinish} className="auth-form">
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                className="auth-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                className="auth-input"
              />
            </Form.Item>

        
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="main-btn"
            >
              Login
            </Button>
          </Form>

          <div className="divider"> Google user login </div>

          <div className="social-btns">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => message.error("Google login failed")}
            />
          </div>

        
        </div>
      </div>
    </div>
  );
}
