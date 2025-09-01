import React, { useEffect, useState } from "react";
import { Table, Tag, Button, Card, Spin, message, Modal, Form, Input, Select, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../../../api";
import "./AdminEmployees.css";

const { Option } = Select;

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/api/employees");
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

  // Handle create or update employee
  const handleFormSubmit = async (values) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        await api.put(`/api/employees/${editingEmployee._id}`, values);
        message.success("Employee updated successfully");
      } else {
        // Create new employee
        const res = await api.post("/api/employees", values);
        message.success("Employee created successfully");
        
        // Show the new employee's login credentials
        Modal.success({
          title: "Employee Login Credentials",
          content: (
            <div>
              <p>The employee has been created successfully.</p>
              <p>Please share the following credentials with them:</p>
              <p><strong>Email:</strong> {res.data.employee.email}</p>
              <p><strong>Password:</strong> Tintd@12345</p>
            </div>
          ),
          okText: "OK",
        });
      }
      setModalVisible(false);
      setEditingEmployee(null);
      form.resetFields();
      fetchEmployees();
    } catch (err) {
      console.error("Form submit error:", err);
      message.error(err.response?.data?.error || "Failed to save employee");
    }
  };

  // Handle delete employee
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/employees/${id}`);
      message.success("Employee deleted successfully");
      fetchEmployees();
    } catch (err) {
      console.error("Delete employee error:", err);
      message.error("Failed to delete employee");
    }
  };

  // Handle "Update" button click
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue(employee);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "#",
      render: (_, __, index) => index + 1,
      width: 50,
    },
    {
      title: "Emp ID",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (id) => <strong>{id}</strong>,
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
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={role === "superadmin" ? "purple" : role === "admin" ? "volcano" : "geekblue"}>{role?.toUpperCase()}</Tag>,
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <span className="employee-actions">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure you want to delete this employee?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <Card
      title="👤 Employees"
      extra={
        <Button type="primary" onClick={() => { setEditingEmployee(null); form.resetFields(); setModalVisible(true); }}>
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

      {/* Modal for creating/updating employee */}
      <Modal
        title={editingEmployee ? "Update Employee" : "Create Employee"}
        visible={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingEmployee(null); form.resetFields(); }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ shift: "Morning", role: "employee" }}
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
            <Input placeholder="john@example.com" disabled={!!editingEmployee} />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select>
              <Option value="employee">Employee</Option>
              <Option value="admin">Admin</Option>
              <Option value="superadmin">Superadmin</Option>
            </Select>
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
              {editingEmployee ? "Update Employee" : "Create Employee"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
