import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Card, Spin, message, Modal, Form, Input, Select } from "antd";
import api from "../../../../api"; // your axios instance
import "./AdminEmployees.css";

const { Option } = Select;

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/admin/employees");
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      message.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle create employee
  const handleCreate = async (values) => {
    try {
      const res = await api.post("/api/admin/employees", values);
      message.success("Employee created successfully");
      setModalVisible(false);
      form.resetFields();
      fetchEmployees();
    } catch (err) {
      console.error("Create employee error:", err);
      message.error(err.response?.data?.error || "Failed to create employee");
    }
  };

  const columns = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
    },
    {
      title: "Shift",
      dataIndex: "shift",
      key: "shift",
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      render: (salary) => salary ? `$${salary}` : "-",
    },
  ];

  return (
    <Card
      title="👤 Employees"
      extra={
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Add Employee
        </Button>
      }
    >
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={employees}
          pagination={{ pageSize: 8 }}
          bordered
        />
      )}

      {/* Modal for creating employee */}
      <Modal
        title="Create Employee"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{ shift: "Morning" }}
        >
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: "Please enter full name" }]}
          >
            <Input placeholder="John Doe" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter email" }, { type: "email", message: "Invalid email" }]}
          >
            <Input placeholder="john@example.com" />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input placeholder="+1234567890" />
          </Form.Item>

          <Form.Item name="specialization" label="Specialization">
            <Input placeholder="Hair stylist, Spa, etc." />
          </Form.Item>

          <Form.Item name="shift" label="Shift">
            <Select>
              <Option value="Morning">Morning</Option>
              <Option value="Evening">Evening</Option>
            </Select>
          </Form.Item>

          <Form.Item name="salary" label="Salary">
            <Input type="number" placeholder="50000" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Employee
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
