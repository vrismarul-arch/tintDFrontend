import React, { useMemo } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Space,
  Avatar,
} from "antd";
import {
  ScheduleOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

// ===== Dummy Stats Data =====
const sampleStats = {
  totalBookings: 268,
  bookingsChange: 12, // % change vs yesterday
  activeBeauticians: 23,
  beauticiansChange: 5,
  revenueToday: 15480.5,
  revenueChange: -3.4,
  leadsFollowUp: 18,
  leadsChange: 9.5,
};

// ===== Dummy Table Data =====
const sampleRows = [
  {
    key: "1",
    name: "Riya Sharma",
    service: "Bridal Makeup",
    beautician: "Anita",
    date: "2025-10-09 11:30",
    status: "Booked",
    contact: "+91 98765 43210",
    amount: 4500,
  },
  {
    key: "2",
    name: "Priya Kumar",
    service: "Haircut",
    beautician: "Sangeeta",
    date: "2025-10-09 10:00",
    status: "Follow-up",
    contact: "+91 91234 56789",
    amount: 700,
  },
  {
    key: "3",
    name: "Asha R",
    service: "Facial",
    beautician: "Meera",
    date: "2025-10-08 16:00",
    status: "Completed",
    contact: "+91 99887 66554",
    amount: 1200,
  },
];

// ===== Dummy Chart Data =====
const bookingTrend = [
  { day: "Mon", value: 180 },
  { day: "Tue", value: 200 },
  { day: "Wed", value: 220 },
  { day: "Thu", value: 250 },
  { day: "Fri", value: 268 },
];

export default function AdminDashboard({ stats = sampleStats, rows = sampleRows }) {
  // === Table Columns ===
  const columns = useMemo(() => [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Space>
          <Avatar>{text?.charAt(0)}</Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: 12, color: "var(--gray-6)" }}>{record.contact}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
    },
    {
      title: "Beautician",
      dataIndex: "beautician",
      key: "beautician",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (v) => `₹ ${Number(v).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        let color = "default";
        if (s === "Booked") color = "blue";
        if (s === "Follow-up") color = "orange";
        if (s === "Completed") color = "green";
        return <Tag color={color}>{s}</Tag>;
      },
    },
  ], []);

  // === Helper: Trend Text ===
  const TrendText = ({ change }) => {
    const isPositive = change >= 0;
    return (
      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          color: isPositive ? "#3f8600" : "#cf1322",
        }}
      >
        <span style={{ marginRight: 6 }}>
          {isPositive ? "▲" : "▼"} {Math.abs(change)}%
        </span>
        <span style={{ color: "rgba(0,0,0,0.45)" }}>vs yesterday</span>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* ==== STATS CARDS ==== */}
      <Row gutter={[16, 16]}>
        {/* Total Bookings */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title={<span><ScheduleOutlined /> Total Bookings</span>}
              value={stats.totalBookings}
              valueStyle={{ color: "#3f8600", fontWeight: 600 }}
            />
            <TrendText change={stats.bookingsChange} />
          </Card>
        </Col>

        {/* Active Beauticians */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title={<span><UsergroupAddOutlined /> Active Beauticians</span>}
              value={stats.activeBeauticians}
              valueStyle={{ color: "#1890ff", fontWeight: 600 }}
            />
            <TrendText change={stats.beauticiansChange} />
          </Card>
        </Col>

        {/* Revenue Today */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title={<span><DollarCircleOutlined /> Revenue Today</span>}
              value={Number(stats.revenueToday || 0).toFixed(2)}
              precision={2}
              prefix="₹"
              valueStyle={{ color: "#cf1322", fontWeight: 600 }}
            />
            <TrendText change={stats.revenueChange} />
          </Card>
        </Col>

        {/* Leads / Follow-ups */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card">
            <Statistic
              title={<span><PhoneOutlined /> Leads / Follow-ups</span>}
              value={stats.leadsFollowUp}
              valueStyle={{ color: "#fa8c16", fontWeight: 600 }}
            />
            <TrendText change={stats.leadsChange} />
          </Card>
        </Col>
      </Row>

      {/* ==== TABLE + MINI CHART ==== */}
      <Card className="table-card" title="Recent Bookings / Leads">
        {/* Dummy Mini Line Chart */}
        <div style={{ height: 80, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bookingTrend}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3f8600"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 12, color: "#8c8c8c", marginTop: -8 }}>
            Weekly booking trend
          </div>
        </div>

        {/* Bookings Table */}
        <Table
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}
