import React, { useEffect, useState } from "react";
import { Card, Descriptions, Tag, Spin, Alert, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import api from "../../../../api";
import "./AdminProfile.css"; // import CSS

const { Title, Text } = Typography;

export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/api/admin/profile");
        setProfile(data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );

  if (error)
    return (
      <Alert
        message={error}
        type="error"
        style={{ maxWidth: 700, margin: "2rem auto" }}
      />
    );

  return (
    <Card className="admin-card">
      <div className="admin-header">
        <Avatar
          size={80}
          icon={<UserOutlined />}
          src={profile?.avatar || null}
          className="admin-avatar"
        />
        <div>
          <Title level={3} className="admin-name">
            {profile?.name}
          </Title>
          <Text className="admin-email">{profile?.email}</Text>
        </div>
      </div>

      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Role">
          <Tag color="blue" className="admin-tag">
            {profile?.role}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {profile?.phone || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Joined On">
          {profile?.createdAt
            ? new Date(profile.createdAt).toLocaleDateString()
            : "N/A"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
