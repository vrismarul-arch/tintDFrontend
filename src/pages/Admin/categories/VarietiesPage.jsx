import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Drawer,
  Form,
  Input,
  Upload,
  message,
  Dropdown,
  Menu,
  Select,
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  TagsOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import "./categories.css";

export default function VarietiesPage() {
  const [varieties, setVarieties] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchVarieties();
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    const res = await api.get("/api/admin/subcategories");
    setSubCategories(res.data);
  };

  const fetchVarieties = async () => {
    const res = await api.get("/api/admin/varieties");
    setVarieties(res.data);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      Object.keys(values).forEach((key) => formData.append(key, values[key]));

      if (values.image && values.image[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      if (editingItem) {
        await api.put(`/api/admin/varieties/${editingItem._id}`, formData);
        message.success("Variety updated!");
      } else {
        await api.post("/api/admin/varieties", formData);
        message.success("Variety added!");
      }

      setIsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchVarieties();
    } catch (err) {
      console.error(err);
      message.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/admin/varieties/${id}`);
    fetchVarieties();
    message.success("Variety deleted!");
  };

  return (
    <div className="categories-page">
      <div className="header flex justify-between items-center mb-4">
<h2 className="text-2xl font-bold text-gray-800">
  <TagsOutlined className="mr-2 text-blue-500" /> Varieties
</h2>        <Button
          type="primary"
          size="large"
          onClick={() => {
            setIsDrawerOpen(true);
            setEditingItem(null);
            form.resetFields();
          }}
        >
          + Add Variety
        </Button>
      </div>

      <Table
        dataSource={varieties}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        columns={[
          { title: "S.No", render: (_, __, index) => index + 1 },
          {
            title: "Image",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (image, record) => (
              <img
                src={image}
                alt={record.name}
                className="w-16 h-16 rounded-lg object-cover shadow-sm border serviceimage"
                onError={(e) => (e.target.src = "/placeholder.png")}
              />
            ),
          },
          { title: "SubCategory", dataIndex: ["subCategory", "name"] },
          { title: "Name", dataIndex: "name" },
          { title: "Description", dataIndex: "description" },
          {
            title: "Actions",
            render: (_, record) => (
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingItem(record);
                        form.setFieldsValue({
                          name: record.name,
                          description: record.description,
                          subCategory: record.subCategory?._id,
                        });
                        setIsDrawerOpen(true);
                      }}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      icon={<DeleteOutlined />}
                      danger
                      onClick={() => handleDelete(record._id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button icon={<MoreOutlined />} />
              </Dropdown>
            ),
          },
        ]}
      />

      <Drawer
        title={`${editingItem ? "Edit" : "Add"} Variety`}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={420}
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
            <Input placeholder="Enter variety name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
          <Form.Item
            name="subCategory"
            label="Select SubCategory"
            rules={[{ required: true }]}
          >
            <Select placeholder="Choose a subcategory">
              {subCategories.map((sc) => (
                <Select.Option key={sc._id} value={sc._id}>
                  {sc.name}
                </Select.Option>
              ))}
            </Select>
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
