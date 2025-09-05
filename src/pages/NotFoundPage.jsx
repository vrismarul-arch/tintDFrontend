import React from "react";
import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
     
        textAlign: "center",
      
      }}
    >
      <div
        style={{
          maxWidth: 400,
       
          padding: 30,
          borderRadius: 12,
          
        }}
      >
        {/* 404 Image */}
        <img
          src="/notfound.svg"
          alt="404 Not Found"
          style={{ width: "100%", marginBottom: 24 }}
        />

        {/* Titles & Text */}
        <Title level={3} style={{ marginBottom: 16 }}>
          Page Not Found
        </Title>
        <Text type="secondary" style={{ marginBottom: 24 }}>
          Sorry, the page you are looking for does not exist.
        </Text>

        {/* Go Home Button */}
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/")}
          style={{ width: "100%" }}
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
}
