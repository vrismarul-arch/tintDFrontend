// src/pages/partners/PartnerDashboard.jsx
import { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Tag, Spin, message, Tabs, Button, Image } from "antd";
import api from "../../../../api";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth.js";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function PartnerDashboard() {
  const { partner, isAuthed, logout } = usePartnerAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthed) return;

    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("partnerToken");
        const { data } = await api.get("/api/partners/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
      } catch (err) {
        message.error(err.response?.data?.error || "Profile fetch error");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  if (!profile) return null;

  const handleLogout = () => {
    logout();
    navigate("/partner/login");
    message.success("Logged out successfully");
  };

  const items = [
    {
      key: "1",
      label: "Profile Info",
      children: (
        <Card bordered>
          <Row gutter={[16, 16]}>
            <Col span={12}><Text strong>Name:</Text> {profile.name}</Col>
            <Col span={12}><Text strong>Email:</Text> {profile.email}</Col>
            <Col span={12}><Text strong>Phone:</Text> {profile.phone}</Col>
            <Col span={12}><Text strong>City:</Text> {profile.city || "-"}</Col>
            <Col span={12}><Text strong>Gender:</Text> {profile.gender || "-"}</Col>
            <Col span={12}><Text strong>Profession:</Text> {profile.profession || "-"}</Col>
            <Col span={12}>
              <Text strong>Status:</Text>{" "}
              <Tag color={profile.status === "approved" ? "green" : "orange"}>
                {profile.status?.toUpperCase()}
              </Tag>
            </Col>
            <Col span={12}><Text strong>Partner ID:</Text> {profile.partnerId}</Col>
          </Row>
        </Card>
      ),
    },
    {
      key: "2",
      label: "Documents",
      children: (
        <Card bordered>
          <Row gutter={[16, 16]}>
            {profile.aadhaarFront && <Col span={12}><Text strong>Aadhaar Front:</Text><Image src={profile.aadhaarFront} width={200} /></Col>}
            {profile.aadhaarBack && <Col span={12}><Text strong>Aadhaar Back:</Text><Image src={profile.aadhaarBack} width={200} /></Col>}
            {profile.pan && <Col span={12}><Text strong>PAN Card:</Text><Image src={profile.pan} width={200} /></Col>}
            {profile.professionalCert && <Col span={12}><Text strong>Experience Certificate:</Text><Image src={profile.professionalCert} width={200} /></Col>}
          </Row>
        </Card>
      ),
    },
    {
      key: "3",
      label: "Bank & Personal Info",
      children: (
        <Card bordered>
          <Row gutter={[16, 16]}>
            <Col span={12}><Text strong>Bank Name:</Text> {profile.bankName || "-"}</Col>
            <Col span={12}><Text strong>Account Number:</Text> {profile.accountNumber || "-"}</Col>
            <Col span={12}><Text strong>IFSC:</Text> {profile.ifsc || "-"}</Col>
            <Col span={12}><Text strong>Father's Name:</Text> {profile.fathersName || "-"}</Col>
            <Col span={12}><Text strong>Mother's Name:</Text> {profile.mothersName || "-"}</Col>
            <Col span={12}><Text strong>Date of Birth:</Text> {profile.dob || "-"}</Col>
          </Row>
        </Card>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card style={{ borderRadius: 16, boxShadow: "0 6px 16px rgba(0,0,0,0.1)", marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3}>Welcome, {profile.name} 👋</Title>
            <Text type="secondary">Here’s your partner dashboard</Text>
          </Col>
          <Col>
            <Button type="primary" danger onClick={handleLogout}>
              Logout
            </Button>
          </Col>
        </Row>
      </Card>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}
