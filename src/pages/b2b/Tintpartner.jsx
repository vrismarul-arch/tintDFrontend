import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Card, Modal, List, Spin } from "antd";
import b2b from "./tintd.svg"; 
import "./tintpartner.css";

const { Title, Text } = Typography;

const Tintpartner = () => {
  const [open, setOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/partners") // Replace with your API endpoint
      .then((res) => res.json())
      .then((data) => {
        setPartners(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="b2b-wrapper" style={{ padding: "50px 20px", background: "#fff8f2" }}>
      <Card
        className="b2b-card"
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          padding: "40px",
        }}
      >
        <Row gutter={[32, 32]} align="middle" justify="center">
          {/* Left Section */}
          <Col xs={24} md={12} className="b2b-left">
            <Text className="b2b-subtitle" style={{  fontWeight: 600, fontSize: 16 }}>
              Home Salon Experts • Freelance Stylists • Beauty Professionals
            </Text>
            <Title level={2} className="b2b-title" style={{ marginTop: 12, color: "#333" }}>
              Expand Your Salon Services to Customers’ Doorsteps
            </Title>
            {/*  dddfd*/}
            <Text className="b2b-description" style={{ display: "block", margin: "20px 0", color: "#ffffffff", lineHeight: 1.6 }}>
              Partner with us to offer your beauty and wellness services directly at clients’ homes. 
              Boost your bookings, grow your client base, and enjoy special benefits as part of our trusted network.
            </Text>
<Button
  type="primary"
  size="large"
  className="b2b-button"
  onClick={() => setOpen(true)}
>
  Join Our Partner Network
</Button>



          </Col>

          {/* Right Section */}
          <Col xs={24} md={12} className="b2b-image-col" style={{ textAlign: "center" }}>
            <img
              src={b2b}
              alt="Salon Partnership"
              className="b2b-image"
              style={{ maxWidth: "100%", borderRadius: 12, }}
            />
          </Col>
        </Row>
      </Card>

      {/* Modal: Partner List */}
      <Modal
        title="Our Salon Partners"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={700}
        bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin size="large" tip="Loading our partner list..." />
          </div>
        ) : partners.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={partners}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.name}
                  description={`Services Offered: ${item.type} | Contact: ${item.contact}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Text>No partners have joined yet. Be the first to connect!</Text>
        )}
      </Modal>
    </div>
  );
};

export default Tintpartner;
