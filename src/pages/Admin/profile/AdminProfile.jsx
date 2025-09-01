import React, { useEffect, useState } from "react";
import { Card, Descriptions, Tag, Spin, Alert } from "antd";
import api from "../../../../api";

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

  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <Card title="Admin Profile" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Name">{profile?.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{profile?.phone || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color="blue">{profile?.role}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
