// Tintdpartners.jsx
import React from 'react';
import { Row, Col, Typography, Card } from 'antd';
import {
  DollarOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import './Tintdpartners.css';

const { Title, Paragraph } = Typography;

const benefits = [
  {
    icon: <DollarOutlined />,
    title: 'Unlimited Earnings',
    description: 'Start earning from day one with no caps or limits.',
    color: '#52c41a',
  },
  {
    icon: <ClockCircleOutlined />,
    title: 'Flexible Hours',
    description: 'Work when you want — total freedom over your schedule.',
    color: '#eb2f96',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '100% Safety First',
    description: '24/7 dedicated safety team always ready to help.',
    color: '#faad14',
  },
  {
    icon: <UnlockOutlined />,
    title: 'No Blocks, Ever',
    description: 'Your profile stays active — we trust our partners.',
    color: '#1890ff',
  },
];

const Tintdpartners = () => {
  return (
    <section className="partners-section">
      <div className="partners-container">
        {/* Header */}
        <div className="partners-header">
          <Title level={2} className="section-title-">
            Why Partners <span className="highlight">Love</span> Working with Tintd
          </Title>
          <Paragraph className="section-subtitle">
            At <strong>Tintd</strong>, we empower beauty professionals with
            freedom, respect, and great earning opportunities.
          </Paragraph>
        </div>

        {/* Benefits Grid */}
        <Row gutter={[24, 32]} justify="center">
          {benefits.map((benefit, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                className="benefit-card"
                bordered={false}
                style={{
                  '--benefit-color': benefit.color,
                }}
              >
                <div className="benefit-icon-wrapper" style={{ backgroundColor: benefit.color + '15' }}>
                  <div className="benefit-icon" style={{ color: benefit.color }}>
                    {benefit.icon}
                  </div>
                </div>
                <Title level={4} className="benefit-title">
                  {benefit.title}
                </Title>
                <Paragraph className="benefit-description">{benefit.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default Tintdpartners;
