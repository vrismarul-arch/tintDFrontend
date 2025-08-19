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
  Tabs,
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  FolderOpenOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined, TagsOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import "./categories.css";
import SubCategoriesPage from "./SubCategoriesPage";
import VarietiesPage from "./VarietiesPage";

const { TabPane } = Tabs;

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
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
        await api.put(`/api/admin/categories/${editingItem._id}`, formData);
        message.success("Category updated!");
      } else {
        await api.post("/api/admin/categories", formData);
        message.success("Category added!");
      }

      setIsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      message.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/categories/${id}`);
      fetchCategories();
      message.success("Category deleted!");
    } catch (err) {
      message.error("Delete failed!");
    }
  };

  return (
    <div className="categories-page">
      <Tabs defaultActiveKey="categories">
        {/* CATEGORIES TAB */}
     <TabPane
  tab={
    <span className="flex items-center">
      <FolderOpenOutlined className="mr-2 text-yellow-500" /> Categories
    </span>
  }
  key="categories"
>
          <div className="header flex justify-between items-center mb-4">

            <h2 className="text-2xl font-bold text-gray-800">
              <FolderOpenOutlined className="mr-2 text-yellow-500" /> Categories
            </h2>            <Button
              type="primary"
              size="large"
              onClick={() => {
                setIsDrawerOpen(true);
                setEditingItem(null);
                form.resetFields();
              }}
            >
              + Add Category
            </Button>
          </div>

          <Table
            dataSource={categories}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            className="category-table"
            columns={[
              {
                title: "S.No",
                render: (_, __, index) => index + 1,
                width: 80,
              },
              {
                title: "Image",
                dataIndex: "imageUrl",
                render: (image, record) => (
                  <img
                    src={image}
                    alt={record.name}
                    className="w-16 h-16 rounded-lg object-cover shadow-sm border serviceimage"
                    onError={(e) => (e.target.src = "/placeholder.png")}
                  />
                ),
              },
              {
                title: "Name",
                dataIndex: "name",
                render: (text) => (
                  <span className="font-medium text-gray-800">{text}</span>
                ),
              },
              {
                title: "Description",
                dataIndex: "description",
                render: (text) => (
                  <span className="text-gray-500 text-sm">
                    {text || "No description"}
                  </span>
                ),
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
                    <Dropdown
                      overlay={menu}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        shape="circle"
                        icon={<MoreOutlined />}
                        type="text"
                        className="action-btn"
                      />
                    </Dropdown>
                  );
                },
              },
            ]}
          />

          {/* Drawer for Add/Edit */}
          <Drawer
            title={`${editingItem ? "Edit" : "Add"} Category`}
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
                <Input placeholder="Enter category name" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Enter description" />
              </Form.Item>
              <Form.Item
                name="image"
                label="Upload Image"
                valuePropName="fileList"
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e && e.fileList
                }
              >
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Form>
          </Drawer>
        </TabPane>

        {/* SUBCATEGORIES TAB */}
       <TabPane
  tab={
    <span>
      <AppstoreOutlined /> SubCategories
    </span>
  }
  key="subcategories"
>
  <SubCategoriesPage />
</TabPane>

        {/* VARIETIES TAB */}
       <TabPane
  tab={
    <span>
      <TagsOutlined /> Varieties
    </span>
  }
  key="varieties"
>
  <VarietiesPage />
</TabPane>
      </Tabs>
    </div>
  );
}
