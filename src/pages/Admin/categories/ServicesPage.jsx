import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  message,
  Dropdown,
  Menu,
  Tabs,
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import "./services.css";

const { TabPane } = Tabs;

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchSubCategories();
    fetchVarieties();
  }, []);

  const fetchCategories = async () => {
    const res = await api.get("/api/admin/categories");
    setCategories(res.data);
  };

  const fetchSubCategories = async () => {
    const res = await api.get("/api/admin/subcategories");
    setSubCategories(res.data);
  };

  const fetchVarieties = async () => {
    const res = await api.get("/api/admin/varieties");
    setVarieties(res.data);
  };

  const fetchServices = async () => {
    const res = await api.get("/api/admin/services");
    setServices(res.data);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const duration = (values.hours || 0) * 60 + (values.minutes || 0);
      values.duration = duration;

      if (values.originalPrice && values.price) {
        values.discount = Math.round(
          ((values.originalPrice - values.price) / values.originalPrice) * 100
        );
      }

      const formData = new FormData();
      Object.keys(values).forEach((key) => formData.append(key, values[key]));

      if (values.image && values.image[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      if (editingItem) {
        await api.put(`/api/admin/services/${editingItem._id}`, formData);
        message.success("Service updated!");
      } else {
        await api.post("/api/admin/services", formData);
        message.success("Service added!");
      }

      setIsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchServices();
    } catch (err) {
      message.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/admin/services/${id}`);
    fetchServices();
    message.success("Service deleted!");
  };

  // Table columns
  const columns = [
    { title: "S.No", render: (_, __, index) => index + 1, width: 70 },
    {
      title: "Image",
      dataIndex: "imageUrl",
      render: (url, record) =>
        url ? (
          <img
            src={url}
            alt={record.name}
            className="w-16 h-16 object-cover rounded-lg shadow-sm border serviceimage"
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
    },
    { title: "Name", dataIndex: "name" },
    { title: "Category", dataIndex: ["category", "name"] },
    { title: "SubCategory", dataIndex: ["subCategory", "name"] },
    { title: "Variety", dataIndex: ["variety", "name"] },
    {
      title: "Final Price",
      dataIndex: "price",
      render: (p) => (
        <span className="font-semibold text-green-600">₹{p?.toFixed(2)}</span>
      ),
    },
    {
      title: "Original Price",
      dataIndex: "originalPrice",
      render: (op, record) =>
        op ? (
          <span
            className={`${
              op > record.price
                ? "line-through text-gray-400"
                : "text-gray-600"
            }`}
          >
            ₹{op?.toFixed(2)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (d) => `${Math.floor(d / 60)}h ${d % 60}m`,
    },
    {
      title: "Actions",
      width: 80,
      align: "center",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);
                form.setFieldsValue({
                  name: record.name,
                  originalPrice: record.originalPrice,
                  price: record.price,
                  hours: Math.floor(record.duration / 60),
                  minutes: record.duration % 60,
                  category: record.category?._id,
                  subCategory: record.subCategory?._id,
                  variety: record.variety?._id,
                  description: record.description,
                  image: record.imageUrl
                    ? [
                        {
                          uid: "-1",
                          name: "current.png",
                          status: "done",
                          url: record.imageUrl,
                        },
                      ]
                    : [],
                });
                setIsDrawerOpen(true);
              }}
            >
              Edit
            </Menu.Item>
            <Menu.Item
              key="delete"
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </Menu.Item>
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <Button shape="circle" icon={<MoreOutlined />} type="text" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="services-page">
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">💇 Services</h2>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setIsDrawerOpen(true);
            setEditingItem(null);
            form.resetFields();
          }}
        >
          + Add Service
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs defaultActiveKey="all">
        <TabPane tab="All" key="all">
          <Table
            dataSource={services}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            columns={columns}
          />
        </TabPane>

        {categories.map((cat) => (
          <TabPane tab={cat.name} key={cat._id}>
            <Table
              dataSource={services.filter(
                (s) => s.category && s.category._id === cat._id
              )}
              rowKey="_id"
              pagination={{ pageSize: 5 }}
              columns={columns}
            />
          </TabPane>
        ))}
      </Tabs>

      {/* Drawer for Add/Edit */}
      <Drawer
        title={`${editingItem ? "Edit" : "Add"} Service`}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={480}
        extra={
          <div className="flex gap-2">
            <Button onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter service name" />
          </Form.Item>

          <Form.Item name="originalPrice" label="Original Price">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="price" label="Final Price">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="hours" label="Duration Hours">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="minutes" label="Duration Minutes">
            <InputNumber min={0} max={59} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select a category">
              {categories.map((c) => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subCategory" label="SubCategory">
            <Select placeholder="Select a subcategory (optional)" allowClear>
              {subCategories.map((sc) => (
                <Select.Option key={sc._id} value={sc._id}>
                  {sc.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="variety" label="Variety">
            <Select placeholder="Select a variety (optional)" allowClear>
              {varieties.map((v) => (
                <Select.Option key={v._id} value={v._id}>
                  {v.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter service details" />
          </Form.Item>

          <Form.Item
            name="image"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e && e.fileList
            }
          >
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
