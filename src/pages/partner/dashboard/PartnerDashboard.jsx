import { useEffect, useState } from "react";
import { Row, Col, Typography, Tag, Spin, Tabs, Button, Image, Divider } from "antd";
import api from "../../../../api";
import { usePartnerAuth } from "../../../hooks/usePartnerAuth.jsx";
import { useNavigate } from "react-router-dom";
import "./PartnerDashboard.css";

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed]);

  if (loading)
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  if (!profile) return null;

  const handleLogout = () => {
    logout();
    navigate("/partner/login");
  };

  const items = [
    {
      key: "1",
      label: "Profile Info",
      children: (
        <div className="dashboard-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}><Text strong>Name:</Text> {profile.name}</Col>
            <Col xs={24} sm={12}><Text strong>Email:</Text> {profile.email}</Col>
            <Col xs={24} sm={12}><Text strong>Phone:</Text> {profile.phone}</Col>
            <Col xs={24} sm={12}><Text strong>City:</Text> {profile.city || "-"}</Col>
            <Col xs={24} sm={12}><Text strong>Gender:</Text> {profile.gender || "-"}</Col>
            <Col xs={24} sm={12}><Text strong>Profession:</Text> {profile.profession || "-"}</Col>
            <Col xs={24} sm={12}>
              <Text strong>Status:</Text>{" "}
              <Tag color={profile.status === "approved" ? "green" : "orange"}>
                {profile.status?.toUpperCase()}
              </Tag>
            </Col>
            <Col xs={24} sm={12}><Text strong>Partner ID:</Text> {profile.partnerId}</Col>
          </Row>
        </div>
      ),
    },
    {
      key: "2",
      label: "Documents",
      children: (
        <div className="dashboard-card">
          <Row gutter={[24, 24]}>
            {profile.aadhaarFront && <Col xs={24} sm={12}><Text strong>Aadhaar Front:</Text><Image src={profile.aadhaarFront} className="doc-image" /></Col>}
            {profile.aadhaarBack && <Col xs={24} sm={12}><Text strong>Aadhaar Back:</Text><Image src={profile.aadhaarBack} className="doc-image" /></Col>}
            {profile.pan && <Col xs={24} sm={12}><Text strong>PAN Card:</Text><Image src={profile.pan} className="doc-image" /></Col>}
            {profile.professionalCert && <Col xs={24} sm={12}><Text strong>Experience Certificate:</Text><Image src={profile.professionalCert} className="doc-image" /></Col>}
          </Row>
        </div>
      ),
    },
    {
      key: "3",
      label: "Bank & Personal Info",
      children: (
        <div className="dashboard-card">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}><Text strong>Bank Name:</Text> {profile.bankName || "-"}</Col>
            <Col xs={24} sm={12}><Text strong>Account Number:</Text> {profile.accountNumber || "-"}</Col>
            <Col xs={24} sm={12}><Text strong>IFSC:</Text> {profile.ifsc || "-"}</Col>
            <Col xs={24} sm={12}><Text strong>Date of Birth:</Text> {profile.dob || "-"}</Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <Row justify="space-between" align="middle" className="dashboard-header">
        <Col>
          <Title level={3}>Welcome, {profile.name} 👋</Title>
          <Text type="secondary">Here’s your partner dashboard</Text>
        </Col>
        <Col>
          <Button type="primary" danger onClick={handleLogout}>Logout</Button>
        </Col>
      </Row>

      <Divider />

      <Tabs defaultActiveKey="1" items={items} type="card" size="large" />
    </div>
  );
}
  