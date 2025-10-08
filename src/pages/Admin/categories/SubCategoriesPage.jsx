import { useEffect, useState, useMemo } from "react";
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
  Select, // Still needed for the Drawer form
  Tabs,   // New: Import Tabs component
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import "./categories.css";

// Constant for the "Show All" filter option (key for the first tab)
const ALL_CATEGORIES_KEY = "all";

export default function SubCategoriesPage() {
  const [subCategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  // State for category filtering, now driven by Tabs key
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(ALL_CATEGORIES_KEY);

  useEffect(() => {
    fetchSubCategories();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      message.error("Failed to load categories.");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await api.get("/api/admin/subcategories");
      setSubCategories(res.data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      message.error("Failed to load subcategories.");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      Object.keys(values).forEach((key) => formData.append(key, values[key]));

      // Append the actual file object if it exists
      if (values.image && values.image[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      if (editingItem) {
        // Update existing subcategory
        await api.put(`/api/admin/subcategories/${editingItem._id}`, formData);
        message.success("SubCategory updated!");
      } else {
        // Create new subcategory
        await api.post("/api/admin/subcategories", formData);
        message.success("SubCategory added!");
      }

      setIsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchSubCategories(); // Refresh the list
    } catch (err) {
      console.error(err);
      message.error("Something went wrong with save!");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/subcategories/${id}`);
      fetchSubCategories();
      message.success("SubCategory deleted!");
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      message.error("Failed to delete subcategory.");
    }
  };

  // Memoized function to filter subcategories based on the selected category
  const filteredSubCategories = useMemo(() => {
    if (selectedCategoryFilter === ALL_CATEGORIES_KEY) {
      return subCategories;
    }
    return subCategories.filter(
      (subCategory) => subCategory.category?._id === selectedCategoryFilter
    );
  }, [subCategories, selectedCategoryFilter]);
  
  // Custom normalization function for Upload component during edit
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Map categories into Tabs structure
  const categoryTabs = [
    { 
      key: ALL_CATEGORIES_KEY, 
      label: 'All Categories', 
      children: (
        <Table
          dataSource={filteredSubCategories}
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
            { 
              title: "Category", 
              dataIndex: ["category", "name"],
              key: "categoryName"
            },
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Description", dataIndex: "description", key: "description" },
            {
              title: "Actions",
              key: "actions",
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
                            category: record.category?._id,
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
      ),
    },
    // Add individual category tabs
    ...categories.map(c => ({
        key: c._id,
        label: c.name,
        // We use the same Table component for all tabs. The filtering logic 
        // in 'filteredSubCategories' automatically ensures the correct data is displayed.
        children: null, // Table is rendered once below the Tabs component, see explanation in final step
    }))
  ];

  return (
    <div className="categories-page">
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          <AppstoreOutlined className="mr-2 text-blue-500" /> SubCategories
        </h2>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setIsDrawerOpen(true);
            setEditingItem(null);
            form.resetFields();
          }}
        >
          + Add SubCategory
        </Button>
      </div>

      {/* --- Tab Panel Filter Section (Replaced Dropdown) --- */}
      <div className="tab-filter-section mb-4">
        <Tabs
            defaultActiveKey={ALL_CATEGORIES_KEY}
            activeKey={selectedCategoryFilter}
            onChange={setSelectedCategoryFilter}
            items={categoryTabs.map(tab => ({
                key: tab.key,
                label: tab.label,
                // The Table component will be rendered outside the Tabs, 
                // so the children property can be null to keep the DOM clean.
                children: null,
            }))}
        />
      </div>
      {/* ----------------------------------------------------- */}
      
      {/* The Table component is placed outside the Tabs to avoid unnecessary re-rendering
          and ensure the table structure is constant while the data changes via filtering. */}
      <Table
        dataSource={filteredSubCategories}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
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
          { 
            title: "Category", 
            dataIndex: ["category", "name"],
            key: "categoryName"
          },
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Description", dataIndex: "description", key: "description" },
          {
            title: "Actions",
            key: "actions",
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
                          category: record.category?._id,
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
        title={`${editingItem ? "Edit" : "Add"} SubCategory`}
        open={isDrawerOpen}
        onClose={() => {
            setIsDrawerOpen(false);
            setEditingItem(null);
            form.resetFields();
        }}
        width={420}
        extra={
          <div className="flex gap-2">
            <Button onClick={() => {
                setIsDrawerOpen(false);
                setEditingItem(null);
                form.resetFields();
            }}>
                Cancel
            </Button>
            <Button type="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter the subcategory name" }]}>
            <Input placeholder="Enter subcategory name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
          <Form.Item 
            name="category" 
            label="Select Category" 
            rules={[{ required: true, message: "Please select a parent category" }]}
          >
            {/* The Select component is still used here for choosing a parent category in the form */}
            <Select placeholder="Choose a category">
              {categories.map((c) => (
                <Select.Option key={c._id} value={c._id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
        

          <Form.Item
            name="image"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={editingItem ? [] : [{ required: false, message: "Please upload an image" }]}
          >
            <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Upload New</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}