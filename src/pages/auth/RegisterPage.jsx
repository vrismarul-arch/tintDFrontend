import { useState } from "react";
import { Form, Input, Button, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../api";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await api.post("/api/auth/register", values);
      localStorage.setItem("token", res.data.token);
      message.success("Registration successful");
      navigate("/"); // redirect to homepage or services
    } catch (err) {
      message.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card title="Register" className="w-[400px] shadow-lg rounded-lg">
        <Form name="register" layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input your name!" }]}
          >
            <Input placeholder="Enter your name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input type="email" placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>

          <p className="text-center">
            Already have an account?{" "}
            <a onClick={() => navigate("/login")}>Login</a>
          </p>
        </Form>
      </Card>
    </div>
  );
}
