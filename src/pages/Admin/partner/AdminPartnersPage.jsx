import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  message,
  Popconfirm,
  Space,
  Drawer,
  Descriptions,
  Tabs,
  Steps,
  Image,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import api from "../../../../api";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  /* ------------ Fetch Partners ------------ */
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/partners");
      setPartners(Array.isArray(data) ? data : data.partners || []);
    } catch (err) {
      message.error("Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  /* ------------ Approve Partner ------------ */
  const approvePartner = async (id) => {
    try {
      await api.put(`/api/admin/partners/${id}/approve`);
      message.success("Partner approved and email sent");
      fetchPartners();
    } catch (err) {
      message.error(err.response?.data?.error || "Error approving partner");
    }
  };

  /* ------------ Reject Partner ------------ */
  const rejectPartner = async (id) => {
    try {
      await api.put(`/api/admin/partners/${id}/reject`);
      message.success("Partner rejected and email sent");
      fetchPartners();
    } catch (err) {
      message.error(err.response?.data?.error || "Error rejecting partner");
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  /* ------------ Table Columns ------------ */
  const columns = [ { title: "S.No", render: (_, __, index) => index + 1, width: 70 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => {
        let color =
          status === "approved"
            ? "green"
            : status === "rejected"
            ? "red"
            : "orange";
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            onClick={() => {
              setSelectedPartner(record);
              setDrawerOpen(true);
            }}
          >
            View
          </Button>

          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Approve Partner"
                description="Are you sure you want to approve this partner?"
                onConfirm={() => approvePartner(record._id)}
              >
                <Button type="primary">Approve</Button>
              </Popconfirm>
              <Popconfirm
                title="Reject Partner"
                description="Are you sure you want to reject this partner?"
                onConfirm={() => rejectPartner(record._id)}
              >
                <Button danger>Reject</Button>
              </Popconfirm>
            </>
          )}

          {record.status === "approved" && (
            <Button type="primary" disabled>
              Approved
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /* ------------ Filter Partners ------------ */
  const filteredPartners =
    filter === "all"
      ? partners
      : partners.filter((p) => p.status === filter);

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-xl font-bold mb-4">Partner Management</h2>

      {/* Tabs for filtering */}
      <Tabs
        activeKey={filter}
        onChange={(key) => setFilter(key)}
        items={[
          { key: "all", label: "All Partners" },
          { key: "pending", label: "Pending" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ]}
      />

      {/* Table */}
      <Table
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={filteredPartners}
      />

      {/* Drawer for Partner Details */}
      <Drawer
        title={`Partner Details - ${selectedPartner?.name || ""}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={600}
      >
        {selectedPartner && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Modern Stepper */}
            <Steps
              size="small"
              direction="horizontal"
              items={[
                {
                  title: "Profile Setup",
                  status: selectedPartner.stepStatus?.profileSetup
                    ? "finish"
                    : "wait",
                  icon: selectedPartner.stepStatus?.profileSetup ? (
                    <CheckCircleOutlined style={{ color: "green" }} />
                  ) : (
                    <ClockCircleOutlined style={{ color: "orange" }} />
                  ),
                },
                {
                  title: "Documents",
                  status: selectedPartner.stepStatus?.documents
                    ? "finish"
                    : "wait",
                  icon: selectedPartner.stepStatus?.documents ? (
                    <CheckCircleOutlined style={{ color: "green" }} />
                  ) : (
                    <FileTextOutlined style={{ color: "orange" }} />
                  ),
                },
                {
                  title: "Bank Info",
                  status: selectedPartner.stepStatus?.bankInfo
                    ? "finish"
                    : "wait",
                  icon: selectedPartner.stepStatus?.bankInfo ? (
                    <CheckCircleOutlined style={{ color: "green" }} />
                  ) : (
                    <BankOutlined style={{ color: "orange" }} />
                  ),
                },
                {
                  title: "Approval",
                  status: selectedPartner.stepStatus?.approval
                    ? "finish"
                    : "wait",
                  icon: selectedPartner.stepStatus?.approval ? (
                    <CheckCircleOutlined style={{ color: "green" }} />
                  ) : (
                    <UserOutlined style={{ color: "orange" }} />
                  ),
                },
              ]}
            />

            {/* Personal Info */}
            <Descriptions bordered column={1} size="small" title="Personal Info">
              <Descriptions.Item label="Name">
                {selectedPartner.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedPartner.email}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {selectedPartner.phone}
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {selectedPartner.city || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedPartner.gender || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Profession">
                {selectedPartner.profession || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Bank Info */}
            <Descriptions bordered column={1} size="small" title="Bank Info">
              <Descriptions.Item label="Bank Name">
                {selectedPartner.bankName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {selectedPartner.accountNumber || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="IFSC">
                {selectedPartner.ifsc || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Status */}
            <Descriptions bordered column={1} size="small" title="Status">
              <Descriptions.Item label="Status">
                <Tag>{selectedPartner.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Partner ID">
                {selectedPartner.partnerId || "-"}
              </Descriptions.Item>
            </Descriptions>

            {/* Documents */}
            <Descriptions bordered column={1} size="small" title="Documents">
              {selectedPartner.aadhaarFront && (
                <Descriptions.Item label="Aadhaar Front">
                  <Image
                    src={selectedPartner.aadhaarFront}
                    width={100}
                    style={{ borderRadius: 4 }}
                  />
                </Descriptions.Item>
              )}
              {selectedPartner.aadhaarBack && (
                <Descriptions.Item label="Aadhaar Back">
                  <Image
                    src={selectedPartner.aadhaarBack}
                    width={100}
                    style={{ borderRadius: 4 }}
                  />
                </Descriptions.Item>
              )}
              {selectedPartner.pan && (
                <Descriptions.Item label="PAN Card">
                  <Image
                    src={selectedPartner.pan}
                    width={100}
                    style={{ borderRadius: 4 }}
                  />
                </Descriptions.Item>
              )}
              {selectedPartner.professionalCert && (
                <Descriptions.Item label="Professional Cert">
                  <Image
                    src={selectedPartner.professionalCert}
                    width={100}
                    style={{ borderRadius: 4 }}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
}
