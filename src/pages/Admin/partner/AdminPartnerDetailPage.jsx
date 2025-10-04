import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Descriptions,
  Spin,
  message,
  Steps,
  Image,
  Table,
  Tag,
  Button,
  Popconfirm,
  Space,
  Card,
  Row,
  Col,
  Drawer,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BankOutlined,
  UserOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import "./AdminPartnerDetailPage.css";

export default function AdminPartnerDetailPage() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchPartner = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/admin/partners/${id}`);
      setPartner(data.partner);
      setOrders(data.orders || []);
    } catch (err) {
      message.error("Failed to fetch partner or booking details");
    } finally {
      setLoading(false);
    }
  };

  const approvePartner = async () => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/partners/${id}`, { status: "approved" });
      message.success("Partner approved");
      fetchPartner();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to approve partner");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectPartner = async () => {
    try {
      setActionLoading(true);
      await api.put(`/api/admin/partners/${id}`, { status: "rejected" });
      message.success("Partner rejected");
      fetchPartner();
    } catch (err) {
      message.error(err.response?.data?.error || "Failed to reject partner");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchPartner();
  }, [id]);

  if (loading || !partner) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const orderColumns = [
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      render: (_, record) => record.bookingId || record._id,
    },
    {
      title: "Customer",
      render: (_, record) => record.user?.name || record.name,
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (amt) => `₹${amt?.toLocaleString() || 0}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color =
          status === "completed"
            ? "green"
            : status === "cancelled"
            ? "red"
            : "orange";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedOrder(record);
            setDrawerOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="partner-detail-page" style={{ padding: 20 }}>
      <h2 className="page-title">
        Partner Details - {partner.name} (ID: {partner.partnerId || partner._id})
      </h2>

      {/* Partner Steps */}
      <Steps
        size="small"
        className="partner-steps"
        items={[
          {
            title: "Profile Setup",
            status: partner.stepStatus?.profileSetup ? "finish" : "wait",
            icon: partner.stepStatus?.profileSetup ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : (
              <ClockCircleOutlined style={{ color: "orange" }} />
            ),
          },
          {
            title: "Documents",
            status: partner.stepStatus?.documents ? "finish" : "wait",
            icon: partner.stepStatus?.documents ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : (
              <FileTextOutlined style={{ color: "orange" }} />
            ),
          },
          {
            title: "Bank Info",
            status: partner.stepStatus?.bankInfo ? "finish" : "wait",
            icon: partner.stepStatus?.bankInfo ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : (
              <BankOutlined style={{ color: "orange" }} />
            ),
          },
          {
            title: "Approval",
            status: partner.stepStatus?.approval ? "finish" : "wait",
            icon: partner.stepStatus?.approval ? (
              <CheckCircleOutlined style={{ color: "green" }} />
            ) : (
              <UserOutlined style={{ color: "orange" }} />
            ),
          },
        ]}
      />

      {/* Approve/Reject Buttons */}
      {partner.status === "pending" && (
        <div className="action-buttons">
          <Popconfirm
            title="Approve Partner?"
            onConfirm={approvePartner}
            okButtonProps={{ loading: actionLoading }}
          >
            <Button type="primary">Approve</Button>
          </Popconfirm>
          <Popconfirm
            title="Reject Partner?"
            onConfirm={rejectPartner}
            okButtonProps={{ loading: actionLoading }}
          >
            <Button danger style={{ marginLeft: 10 }}>
              Reject
            </Button>
          </Popconfirm>
        </div>
      )}

      {/* Partner Info, Bank Info, Documents in Row/Column */}
      <Row gutter={[16, 16]} className="info-row">
        {/* Personal Info */}
        <Col xs={24} sm={12} md={8}>
          <Card title="Personal Info" className="info-card">
            <p><b>Name:</b> {partner.name}</p>
            <p><b>Email:</b> {partner.email}</p>
            <p><b>Phone:</b> {partner.phone}</p>
            <p><b>City:</b> {partner.city || "-"}</p>
            <p><b>Gender:</b> {partner.gender || "-"}</p>
            <p><b>Profession:</b> {partner.profession || "-"}</p>
            <p><b>Partner ID:</b> {partner.partnerId || partner._id}</p>
          </Card>
        </Col>

        {/* Bank Info */}
        <Col xs={24} sm={12} md={8}>
          <Card title="Bank Info" className="info-card">
            <p><b>Bank Name:</b> {partner.bankName || "-"}</p>
            <p><b>Account Number:</b> {partner.accountNumber || "-"}</p>
            <p><b>IFSC:</b> {partner.ifsc || "-"}</p>
          </Card>
        </Col>

        {/* Documents */}
        <Col xs={24} sm={24} md={8}>
          <Card title="Documents" className="info-card">
            {partner.aadhaarFront && <Image src={partner.aadhaarFront} width={120} style={{ marginBottom: 10 }} />}
            {partner.aadhaarBack && <Image src={partner.aadhaarBack} width={120} style={{ marginBottom: 10 }} />}
            {partner.pan && <Image src={partner.pan} width={120} style={{ marginBottom: 10 }} />}
            {partner.professionalCert && <Image src={partner.professionalCert} width={120} style={{ marginBottom: 10 }} />}
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginTop: 20, marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Card className="ledger-card">
            <h4>Total Orders</h4>
            <p className="ledger-value">{totalOrders}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="ledger-card">
            <h4>Total Amount</h4>
            <p className="ledger-value">₹{totalAmount.toLocaleString()}</p>
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      <h3 style={{ marginTop: 30 }}>Orders / Bookings</h3>
      <Table rowKey="_id" columns={orderColumns} dataSource={orders} />

      {/* Drawer for Booking Details */}
      <Drawer
        title={`Booking Details - ${selectedOrder?.bookingId}`}
        width={650}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedOrder && (
          <>
            <Descriptions bordered column={1} size="small" title="Customer Info">
              <Descriptions.Item label="Name">{selectedOrder.user?.name || selectedOrder.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedOrder.user?.email || selectedOrder.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedOrder.user?.phone || selectedOrder.phone}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedOrder.address}</Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={1} size="small" title="Services">
              {selectedOrder.services?.map((s) => (
                <Descriptions.Item key={s._id} label={s.serviceId?.name}>
                  Quantity: {s.quantity} | Price: ₹{s.serviceId?.price.toLocaleString()}
                </Descriptions.Item>
              ))}
            </Descriptions>

            <Descriptions bordered column={1} size="small" title="Booking Info">
              <Descriptions.Item label="Booking ID">{selectedOrder.bookingId || selectedOrder._id}</Descriptions.Item>
              <Descriptions.Item label="Amount">₹{selectedOrder.totalAmount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Payment Method">{selectedOrder.paymentMethod?.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedOrder.status === "completed" ? "green" : selectedOrder.status === "cancelled" ? "red" : "orange"}>
                  {selectedOrder.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">{selectedOrder.assignedTo?.name || "-"}</Descriptions.Item>
              <Descriptions.Item label="Location">
                Lat: {selectedOrder.location?.lat}, Lng: {selectedOrder.location?.lng}
              </Descriptions.Item>
              <Descriptions.Item label="Booking Date">{new Date(selectedOrder.selectedDate).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Booking Time">{new Date(selectedOrder.selectedTime).toLocaleTimeString()}</Descriptions.Item>
              <Descriptions.Item label="Created At">{new Date(selectedOrder.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Updated At">{new Date(selectedOrder.updatedAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Drawer>
    </div>
  );
}
