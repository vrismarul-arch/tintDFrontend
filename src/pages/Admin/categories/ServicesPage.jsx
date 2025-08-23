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
  Spin,
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
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchServices(),
          fetchCategories(),
          fetchSubCategories(),
          fetchVarieties(),
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchCategories = async () => {
    const res = await api.get("/api/admin/categories");
    setCategories(res.data || []);
  };

  const fetchSubCategories = async () => {
    const res = await api.get("/api/admin/subcategories");
    setSubCategories(res.data || []);
  };

  const fetchVarieties = async () => {
    const res = await api.get("/api/admin/varieties");
    setVarieties(res.data || []);
  };

  const fetchServices = async () => {
    const res = await api.get("/api/admin/services");
    setServices(res.data || []);
  };

  // Antd Upload normalizer
  const normalizeUpload = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList ? e.fileList : [];
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const values = await form.validateFields();

      const duration = (values.hours || 0) * 60 + (values.minutes || 0);
      values.duration = duration;

      if (values.originalPrice && values.price) {
        values.discount = Math.round(
          ((values.originalPrice - values.price) / values.originalPrice) * 100
        );
      }

      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (["overview", "procedureSteps"].includes(key)) {
  const arr = values[key].map((item, index) => {
    if (item.img && item.img[0]?.originFileObj) {
      formData.append(`${key}Images_${index}`, item.img[0].originFileObj);
      return { ...item, img: item.img[0].name };
    } else if (item.img && item.img[0]?.url) {
      return { ...item, img: item.img[0].url };
    }
    return item;
  });
  formData.append(key, JSON.stringify(arr));


        } else if (
          ["thingsToKnow", "precautionsAftercare", "faqs"].includes(key)
        ) {
          formData.append(key, JSON.stringify(values[key] || []));
        } else if (Array.isArray(values[key]) || typeof values[key] === "object") {
          formData.append(key, JSON.stringify(values[key] ?? null));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Main image
      const mainImage = values.image?.[0]?.originFileObj;
      if (mainImage) {
        formData.append("image", mainImage);
      }

      if (editingItem) {
        await api.put(`/api/admin/services/${editingItem._id}`, formData);
        message.success("✅ Service updated successfully!");
      } else {
        await api.post("/api/admin/services", formData);
        message.success("✅ Service added successfully!");
      }

      setIsDrawerOpen(false);
      setIsDetailsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchServices();
    } catch (err) {
      console.error(err);
      message.error("❌ Something went wrong while saving service!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/admin/services/${id}`);
    fetchServices();
    message.success("🗑️ Service deleted!");
  };

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
            className={`${op > record.price ? "line-through text-gray-400" : "text-gray-600"}`}
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
                  hours: Math.floor((record.duration || 0) / 60),
                  minutes: (record.duration || 0) % 60,
                  category: record.category?._id,
                  subCategory: record.subCategory?._id,
                  variety: record.variety?._id,
                  description: record.description,
                  overview: (record.overview || []).map((item, idx) => ({
                    ...item,
                    img: item.img
                      ? [
                          {
                            uid: `overview-${idx}`,
                            name: `overview-${idx}.png`,
                            status: "done",
                            url: item.img,
                          },
                        ]
                      : [],
                  })),
                  procedureSteps: (record.procedureSteps || []).map((item, idx) => ({
                    ...item,
                    img: item.img
                      ? [
                          {
                            uid: `step-${idx}`,
                            name: `step-${idx}.png`,
                            status: "done",
                            url: item.img,
                          },
                        ]
                      : [],
                  })),
                  thingsToKnow: record.thingsToKnow || [],
                  precautionsAftercare: record.precautionsAftercare || [],
                  faqs: record.faqs || [],
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

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spin />
        </div>
      ) : (
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
      )}

      {/* Drawer for Add/Edit */}
      <Drawer
        title={`${editingItem ? "Edit" : "Add"} Service`}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={520}
        extra={
          <div className="flex gap-2">
            <Button onClick={() => setIsDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave} loading={saving}>
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
            <Select placeholder="Select a category" allowClear>
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
            getValueFromEvent={normalizeUpload}
          >
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          {/* Open nested details drawer */}
          <Button type="dashed" block onClick={() => setIsDetailsDrawerOpen(true)}>
            Manage Service Details
          </Button>
        </Form>
      </Drawer>

      {/* Nested Drawer for Service Details */}
      <Drawer
        title="Service Details"
        open={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        width={560}
        extra={<Button type="primary" onClick={() => setIsDetailsDrawerOpen(false)}>Done</Button>}
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="overview">
            {/* Overview */}
            <TabPane tab="Overview" key="overview">
              <Form.List name="overview">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex flex-col gap-2 mb-3 p-2 border rounded">
                        <Form.Item
                          {...restField}
                          name={[name, "img"]}
                          valuePropName="fileList"
                          getValueFromEvent={normalizeUpload}
                          rules={[{ required: true, message: "Image required" }]}
                        >
                          <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                          </Upload>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "title"]}
                          rules={[{ required: true, message: "Title required" }]}
                        >
                          <Input placeholder="Title" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Overview
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>

            {/* Procedure Steps */}
            <TabPane tab="Procedure Steps" key="steps">
              <Form.List name="procedureSteps">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex flex-col gap-2 mb-3 p-2 border rounded">
                        <Form.Item
                          {...restField}
                          name={[name, "img"]}
                          valuePropName="fileList"
                          getValueFromEvent={normalizeUpload}
                          rules={[{ required: true, message: "Image required" }]}
                        >
                          <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
                            <Button icon={<UploadOutlined />}>Upload</Button>
                          </Upload>
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "title"]} rules={[{ required: true }]}> 
                          <Input placeholder="Step Title" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "desc"]} rules={[{ required: true }]}> 
                          <Input.TextArea placeholder="Step Description" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Step
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>

            {/* Things to Know */}
            <TabPane tab="Things to Know" key="know">
              <Form.List name="thingsToKnow">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex flex-col gap-2 mb-3 p-2 border rounded">
                        <Form.Item {...restField} name={[name, "title"]} rules={[{ required: true }]}> 
                          <Input placeholder="Title" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "desc"]} rules={[{ required: true }]}> 
                          <Input.TextArea placeholder="Description" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Info
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>

            {/* Precautions / Aftercare */}
            <TabPane tab="Precautions / Aftercare" key="precautions">
              <Form.List name="precautionsAftercare">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex flex-col gap-2 mb-3 p-2 border rounded">
                        <Form.Item {...restField} name={[name, "title"]} rules={[{ required: true }]}> 
                          <Input placeholder="Title" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "desc"]} rules={[{ required: true }]}> 
                          <Input.TextArea placeholder="Description" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      + Add Precaution
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>

            {/* FAQs */}
            <TabPane tab="FAQs" key="faqs">
              <Form.List name="faqs">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex flex-col gap-2 mb-3 p-2 border rounded">
                        <Form.Item {...restField} name={[name, "question"]} rules={[{ required: true }]}> 
                          <Input placeholder="Question" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "answer"]} rules={[{ required: true }]}> 
                          <Input.TextArea placeholder="Answer" />
                        </Form.Item>
                        <Button danger onClick={() => remove(name)}>Remove</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()} block>
                      + Add FAQ
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>
          </Tabs>
        </Form>
      </Drawer>
    </div>
  );
}
