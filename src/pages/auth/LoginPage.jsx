import { useState } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import "./auth.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", values);
      localStorage.setItem("token", res.data.token);
      message.success("Login successful");
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
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
          <h2 className="title">Login to Doorstep</h2>

          {/* Toggle buttons */}
          <div className="toggle-btns">
            <button className="active">Login</button>
            <button onClick={() => navigate("/register")}>Sign Up</button>
          </div>

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

            <div className="form-options">
              <Checkbox>Remember me</Checkbox>
              <a href="#">Forgot Password?</a>
            </div>

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

          <div className="divider">Or login with</div>

          <div className="social-btns">
            <Button block className="google-btn">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="icon"
              />
              Google
            </Button>
            
          </div>

          <p className="bottom-link">
            Don’t have an account?{" "}
            <a onClick={() => navigate("/register")}>Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
