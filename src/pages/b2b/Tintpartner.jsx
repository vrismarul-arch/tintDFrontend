import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Card, Modal, List, Spin } from "antd";
// IMPORTANT: Ensure this path is correct for your doorstep service image
import serviceImage from "./partner.png"; 
import "./tintpartner.css";

const { Title, Text } = Typography;

const Tintpartner = () => {
  const [open, setOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint for partners list
    fetch("/api/partners") 
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
    <div className="b2b-wrapper">
      <Card
        className="b2b-card"
        bordered={false}
      >
        <Row gutter={0} align="stretch" justify="start" style={{ minHeight: '450px' }}> 
          
          {/* LEFT SECTION (Desktop): Image. On Mobile, this will be the top section (order: 1) */}
          <Col xs={24} md={12} className="b2b-image-col">
            <div 
              className="b2b-image-container" 
              style={{ backgroundImage: `url(${serviceImage})` }} 
            />
          </Col>
          
          {/* RIGHT SECTION (Desktop): Text Content. On Mobile, this will be the bottom section (order: 2) */}
          <Col xs={24} md={12} className="b2b-left">
            <Text className="b2b-subtitle">
              Home Salon Experts • Freelance Stylists • Beauty Professionals
            </Text>
            <Title level={2} className="b2b-title">
              Expand Your Salon Services to Customers’ Doorsteps
            </Title>
            
            <Text className="b2b-description" style={{ display: "block", margin: "20px 0", lineHeight: 1.6 }}>
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