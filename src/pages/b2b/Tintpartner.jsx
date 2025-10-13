import React, { useState, useEffect } from "react";
import { Row, Col, Typography, Button, Card, Modal, List, Spin } from "antd";
// Import the navigation hook from react-router-dom (or your specific router)
import { useNavigate } from "react-router-dom"; 
// IMPORTANT: Ensure this path is correct for your doorstep service image
import serviceImage from "./partner.png"; 
import "./tintpartner.css";

const { Title, Text } = Typography;

const Tintpartner = () => {
  // Use 'navigate' instead of 'history' for React Router v6+
  const navigate = useNavigate(); 
  
  const [open, setOpen] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The API fetch for the *list* remains here, as it's used by the Modal.
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

  // NEW HANDLER: Function to navigate to the registration page
  const handleJoinPartner = () => {
    // Navigate to the path you specified: /partner/register
    navigate("/partner/register"); 
  };


  // NOTE: The Modal will now be opened by a different button, 
  // or you might choose to remove the Modal entirely if the button's purpose changed.
  // For now, I'll add a new button to trigger the modal, and keep the main button for navigation.
  
  return (
    <div className="b2b-wrapper">
      <Card
        className="b2b-card"
        bordered={false}
      >
        <Row gutter={0} align="stretch" justify="start" style={{ minHeight: '450px' }}> 
          
          <Col xs={24} md={12} className="b2b-image-col">
            <div 
              className="b2b-image-container" 
              style={{ backgroundImage: `url(${serviceImage})` }} 
            />
          </Col>
          
          <Col xs={24} md={12} className="b2b-left">
            <Text className="b2b-subtitle">
              Home Salon Experts • Freelance Stylists • Beauty Professionals
            </Text>
            <Title level={2} className="b2b-title">
              Expand Your Salon Services to Customers’ Doorsteps
            </Title>
            
            {/* THE PRIMARY ACTION BUTTON IS NOW FOR NAVIGATION */}
            <Button
              type="primary"
              size="large"
              className="b2b-button"
              onClick={() => navigate("/partner/register")} // Calls the navigation function
            >
              Join Our Partner Network
            </Button>

            
          </Col>
        </Row>
      </Card>

      {/* Modal: Partner List (Kept for viewing existing partners) */}
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