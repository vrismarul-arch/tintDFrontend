// ServicesPage.jsx
import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Drawer,
  Form,
  Input,
  Row,
  Col,
  InputNumber,
  Select,
  Upload,
  Dropdown,
  Menu,
  Tabs,
  Spin,
  Space,
  Modal,
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import toast, { Toaster } from "react-hot-toast";
import "./services.css";

const { TabPane } = Tabs;
const { confirm } = Modal;

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredVarieties, setFilteredVarieties] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all | active | inactive

  // initial load
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await Promise.all([fetchServices(activeFilter), fetchCategories(), fetchSubCategories(), fetchVarieties()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetchers
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data || []);
    } catch (err) {
      console.error("fetchCategories", err);
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await api.get("/api/admin/subcategories");
      setSubCategories(res.data || []);
    } catch (err) {
      console.error("fetchSubCategories", err);
    }
  };

  const fetchVarieties = async () => {
    try {
      const res = await api.get("/api/admin/varieties");
      setVarieties(res.data || []);
    } catch (err) {
      console.error("fetchVarieties", err);
    }
  };

  // Fetch services with status param
  const fetchServices = async (status = "all") => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/services?status=${status}`);
      setServices(res.data || []);
    } catch (err) {
      console.error("fetchServices", err);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  // normalization helper for Upload components
  const normalizeUpload = (e) => (Array.isArray(e) ? e : e?.fileList || []);

  // handle cascading selects
  const handleCategoryChange = (categoryId) => {
    form.setFieldsValue({ subCategory: null, variety: null });
    setFilteredSubCategories(subCategories.filter((sc) => sc.category?._id === categoryId));
    setFilteredVarieties([]);
  };

  const handleSubCategoryChange = (subCategoryId) => {
    form.setFieldsValue({ variety: null });
    setFilteredVarieties(varieties.filter((v) => v.subCategory?._id === subCategoryId));
  };

  // Save (create or update)
  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // convert hours/minutes to duration minutes
      const duration = (values.hours || 0) * 60 + (values.minutes || 0);
      values.duration = duration;

      // Ensure status default
      if (!editingItem) {
        values.status = values.status || "active";
      } else {
        values.status = values.status ?? editingItem.status;
      }

      // calculate discount if both prices provided
      if (values.originalPrice && values.price) {
        values.discount = Math.round(((values.originalPrice - values.price) / values.originalPrice) * 100);
      }

      // prepare formData for file uploads
      const formData = new FormData();

      // iterate keys
      Object.keys(values).forEach((key) => {
        // nested arrays that include image upload components
        if (["overview", "procedureSteps"].includes(key) && Array.isArray(values[key])) {
          const arr = values[key].map((item, index) => {
            // item.img is fileList
            if (item.img && item.img[0]?.originFileObj) {
              // append file under convention used by backend: overviewImages_<index> or procedureStepsImages_<index>
              const fileFieldName = key === "overview" ? `overviewImages_${index}` : `procedureStepsImages_${index}`;
              formData.append(fileFieldName, item.img[0].originFileObj);
              // replace img with filename placeholder (backend parses JSON and replaces using files)
              return { ...item, img: item.img[0].name };
            } else if (item.img && item.img[0]?.url) {
              // keep existing url
              return { ...item, img: item.img[0].url };
            }
            return item;
          });
          formData.append(key, JSON.stringify(arr));
        } else if (["thingsToKnow", "precautionsAftercare", "faqs"].includes(key)) {
          formData.append(key, JSON.stringify(values[key] || []));
        } else if (key === "status") {
          formData.append(key, values[key]);
        } else if (Array.isArray(values[key]) || typeof values[key] === "object") {
          // if it's an object but not handled above, attempt to append JSON
          formData.append(key, JSON.stringify(values[key]));
        } else if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // handle main image
      const mainImage = values.image?.[0]?.originFileObj;
      if (mainImage) {
        formData.append("image", mainImage);
      }

      if (editingItem) {
        await api.put(`/api/admin/services/${editingItem._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("✅ Service updated successfully!");
      } else {
        await api.post("/api/admin/services", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("✅ Service added successfully!");
      }

      // cleanup UI
      setIsDrawerOpen(false);
      setIsDetailsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      await fetchServices(activeFilter);
    } catch (err) {
      console.error("handleSave", err);
      toast.error("❌ Something went wrong while saving service!");
    } finally {
      setSaving(false);
    }
  };

  // Confirm hard delete
  const confirmHardDelete = (id) => {
    confirm({
      title: "Delete Service",
      icon: <ExclamationCircleOutlined />,
      content: "This will permanently delete the service. Are you sure?",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await api.delete(`/api/admin/services/${id}`);
          toast.success("🗑️ Service permanently deleted!");
          fetchServices(activeFilter);
        } catch (err) {
          console.error("deleteService", err);
          toast.error("❌ Failed to delete service!");
        }
      },
    });
  };

  // Soft toggle status
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "Activated" : "Deactivated";
    try {
      await api.put(`/api/admin/services/${id}`, { status: newStatus });
      toast.success(`✅ Service ${action} successfully!`);
      fetchServices(activeFilter);
    } catch (err) {
      console.error("handleStatusToggle", err);
      toast.error(`❌ Failed to ${action.toLowerCase()} service!`);
    }
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
            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          <span className="text-gray-400">No Image</span>
        ),
    },
    { title: "Name", dataIndex: "name", sorter: (a, b) => (a.name || "").localeCompare(b.name || "") },
    { title: "Category", dataIndex: ["category", "name"] },
    { title: "SubCategory", dataIndex: ["subCategory", "name"] },
    { title: "Variety", dataIndex: ["variety", "name"] },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            fontWeight: 600,
            padding: "4px 8px",
            borderRadius: 16,
            fontSize: 12,
            background: status === "active" ? "#ECFDF5" : "#FFF1F2",
            color: status === "active" ? "#065F46" : "#9A1C1C",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          {status?.toUpperCase() || "N/A"}
        </span>
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Final Price",
      dataIndex: "price",
      render: (p) => <span style={{ fontWeight: 700 }}>₹{typeof p === "number" ? p.toFixed(2) : p}</span>,
    },
    {
      title: "Original Price",
      dataIndex: "originalPrice",
      render: (op, record) =>
        op ? (
          <span style={{ textDecoration: op > record.price ? "line-through" : "none", color: "#6b7280" }}>
            ₹{typeof op === "number" ? op.toFixed(2) : op}
          </span>
        ) : (
          <span style={{ color: "#9ca3af" }}>-</span>
        ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (d) => `${Math.floor((d || 0) / 60)}h ${d ? d % 60 : 0}m`,
    },
    {
      title: "Actions",
      width: 140,
      align: "center",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="edit"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingItem(record);

                // prepare dependent selects
                setFilteredSubCategories(subCategories.filter((sc) => sc.category?._id === record.category?._id));
                setFilteredVarieties(varieties.filter((v) => v.subCategory?._id === record.subCategory?._id));

                const hours = Math.floor((record.duration || 0) / 60);
                const minutes = (record.duration || 0) % 60;

                // populate form
                form.setFieldsValue({
                  name: record.name,
                  originalPrice: record.originalPrice,
                  price: record.price,
                  hours,
                  minutes,
                  category: record.category?._id,
                  subCategory: record.subCategory?._id,
                  variety: record.variety?._id,
                  description: record.description,
                  status: record.status,
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
              Edit Details
            </Menu.Item>

            <Menu.Item
              key="toggle-status"
              icon={record.status === "active" ? <DeleteOutlined /> : <EditOutlined />}
              onClick={() => handleStatusToggle(record._id, record.status)}
            >
              {record.status === "active" ? "Deactivate" : "Activate"}
            </Menu.Item>

            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => confirmHardDelete(record._id)}>
              Hard Delete
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

  // header filter buttons (Active / Inactive / All)
  const renderFilterButtons = () => (
    <Space>
      <Button
        type={activeFilter === "all" ? "primary" : "default"}
        onClick={() => {
          setActiveFilter("all");
          fetchServices("all");
        }}
      >
        All
      </Button>
      <Button
        type={activeFilter === "active" ? "primary" : "default"}
        onClick={() => {
          setActiveFilter("active");
          fetchServices("active");
        }}
      >
        Active
      </Button>
      <Button
        type={activeFilter === "inactive" ? "primary" : "default"}
        onClick={() => {
          setActiveFilter("inactive");
          fetchServices("inactive");
        }}
      >
        Inactive
      </Button>
    </Space>
  );

  return (
    <div className="services-page p-6">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="header flex justify-between items-center mb-4">
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>💇 Services</h2>
          <div style={{ marginTop: 6 }}>{renderFilterButtons()}</div>
        </div>

        <div>
          <Button
            type="primary"
            size="large"
            onClick={() => {
              setIsDrawerOpen(true);
              setEditingItem(null);
              form.resetFields();
              setFilteredSubCategories([]);
              setFilteredVarieties([]);
            }}
          >
            + Add Service
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Spin />
        </div>
      ) : (
        <Tabs defaultActiveKey="all">
          <TabPane tab="All Services" key="all">
            <Table dataSource={services} rowKey="_id" pagination={{ pageSize: 100 }} columns={columns} />
          </TabPane>

          {categories.map((cat) => (
            <TabPane tab={cat.name} key={cat._id}>
              <Table
                dataSource={services.filter((s) => s.category && s.category._id === cat._id)}
                rowKey="_id"
                pagination={{ pageSize: 100 }}
                columns={columns}
              />
            </TabPane>
          ))}
        </Tabs>
      )}

      {/* Main Drawer for Add / Edit */}
      <Drawer
        title={`${editingItem ? "Edit" : "Add"} Service`}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={640}
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
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter service name" }]}>
            <Input placeholder="Enter service name" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="originalPrice" label="Original Price" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price" label="Final Price" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="hours" label="Hours">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="minutes" label="Minutes">
                <InputNumber min={0} max={59} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="category" label="Category">
                <Select placeholder="Select a category" allowClear onChange={handleCategoryChange}>
                  {categories.map((c) => (
                    <Select.Option key={c._id} value={c._id}>
                      {c.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="subCategory" label="SubCategory">
                <Select placeholder="Select a subcategory" allowClear onChange={handleSubCategoryChange}>
                  {filteredSubCategories.map((sc) => (
                    <Select.Option key={sc._id} value={sc._id}>
                      {sc.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="variety" label="Variety">
                <Select placeholder="Select a variety" allowClear>
                  {filteredVarieties.map((v) => (
                    <Select.Option key={v._id} value={v._id}>
                      {v.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select placeholder="Select service status">
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter service details" />
          </Form.Item>

          <Form.Item name="image" label="Upload Image" valuePropName="fileList" getValueFromEvent={normalizeUpload}>
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <Button type="dashed" block onClick={() => setIsDetailsDrawerOpen(true)}>
            Manage Service Details
          </Button>
        </Form>
      </Drawer>

      {/* Nested Drawer: Service Details */}
      <Drawer
        title="Service Details"
        open={isDetailsDrawerOpen}
        onClose={() => setIsDetailsDrawerOpen(false)}
        width={720}
        extra={
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={() => setIsDetailsDrawerOpen(false)}>Done</Button>
            <Button type="primary" onClick={() => setIsDetailsDrawerOpen(false)}>
              Save & Close
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Tabs defaultActiveKey="overview">
            {/* Overview */}
            <TabPane tab="Overview" key="overview">
              <Form.List name="overview">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
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
                          <Input placeholder="Title" />
                        </Form.Item>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
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
                      <div key={key} style={{ marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
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
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
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
                      <div key={key} style={{ marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                        <Form.Item {...restField} name={[name, "title"]} rules={[{ required: true }]}>
                          <Input placeholder="Title" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "desc"]} rules={[{ required: true }]}>
                          <Input.TextArea placeholder="Description" />
                        </Form.Item>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
                      + Add Info
                    </Button>
                  </>
                )}
              </Form.List>
            </TabPane>

            {/* Precautions */}
            <TabPane tab="Precautions / Aftercare" key="precautions">
              <Form.List name="precautionsAftercare">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} style={{ marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                        <Form.Item {...restField} name={[name, "title"]} rules={[{ required: true }]}>
                          <Input placeholder="Title" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "desc"]} rules={[{ required: true }]}>
                          <Input.TextArea placeholder="Description" />
                        </Form.Item>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
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
                      <div key={key} style={{ marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                        <Form.Item {...restField} name={[name, "question"]} rules={[{ required: true }]}>
                          <Input placeholder="Question" />
                        </Form.Item>
                        <Form.Item {...restField} name={[name, "answer"]} rules={[{ required: true }]}>
                          <Input.TextArea placeholder="Answer" />
                        </Form.Item>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button danger onClick={() => remove(name)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="dashed" block onClick={() => add()}>
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
