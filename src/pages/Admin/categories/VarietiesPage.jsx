import { useEffect, useState, useMemo } from "react";
import { // Added useMemo for efficient filtering
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
  Tabs, // NEW: Imported Tabs for filtering
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

// Constant for the "Show All" filter option (key for the first tab)
const ALL_SUBCATEGORIES_KEY = "all";

export default function VarietiesPage() {
  const [varieties, setVarieties] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  
  // NEW STATES: Filter and Loading
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState(ALL_SUBCATEGORIES_KEY);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchVarieties();
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
        const res = await api.get("/api/admin/subcategories");
        setSubCategories(res.data);
    } catch (err) {
        console.error("Error fetching subcategories:", err);
        message.error("Failed to load subcategories.");
    }
  };

  const fetchVarieties = async () => {
    try {
        const res = await api.get("/api/admin/varieties");
        setVarieties(res.data);
    } catch (err) {
        console.error("Error fetching varieties:", err);
        message.error("Failed to load varieties.");
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true); // Start loading
      
      const values = await form.validateFields();
      const formData = new FormData();
      
      // Append non-file fields
      Object.keys(values).forEach((key) => {
        if (key !== 'image') {
            formData.append(key, values[key]);
        }
      });

      // Append file object
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
      message.error("Something went wrong with save!");
    } finally {
        setSaveLoading(false); // Stop loading
    }
  };

  const handleDelete = async (id) => {
    try {
        await api.delete(`/api/admin/varieties/${id}`);
        fetchVarieties();
        message.success("Variety deleted!");
    } catch (err) {
        console.error("Error deleting variety:", err);
        message.error("Failed to delete variety.");
    }
  };
  
  // Filtering logic based on selectedSubCategoryFilter
  const filteredVarieties = useMemo(() => {
    if (selectedSubCategoryFilter === ALL_SUBCATEGORIES_KEY) {
      return varieties;
    }
    return varieties.filter(
      (variety) => variety.subCategory?._id === selectedSubCategoryFilter
    );
  }, [varieties, selectedSubCategoryFilter]);

  // Custom normalization function for Upload component
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Map subcategories into Tabs structure
  const subCategoryTabs = [
    { key: ALL_SUBCATEGORIES_KEY, label: 'All SubCategories', children: null },
    ...subCategories.map(sc => ({
        key: sc._id,
        label: sc.name,
        children: null,
    }))
  ];

  return (
    <div className="categories-page">
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          <TagsOutlined className="mr-2 text-blue-500" /> Varieties
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
          + Add Variety
        </Button>
      </div>
      
      {/* --- Tab Panel Filter Section --- */}
      <div className="tab-filter-section mb-4">
        <Tabs
            defaultActiveKey={ALL_SUBCATEGORIES_KEY}
            activeKey={selectedSubCategoryFilter}
            onChange={setSelectedSubCategoryFilter}
            items={subCategoryTabs}
        />
      </div>
      {/* ---------------------------------- */}

      <Table
        dataSource={filteredVarieties} // Use filtered data
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
            title: "SubCategory", 
            dataIndex: ["subCategory", "name"],
            key: "subCategoryName" 
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
        onClose={() => {
            setIsDrawerOpen(false);
            setEditingItem(null);
            form.resetFields();
        }}
        width={420}
        extra={
          <div className="flex gap-2">
            <Button 
                onClick={() => {
                    setIsDrawerOpen(false);
                    setEditingItem(null);
                    form.resetFields();
                }}
                disabled={saveLoading}
            >
                Cancel
            </Button>
            <Button 
                type="primary" 
                onClick={handleSave}
                loading={saveLoading} // Loading state applied
            >
              Save
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter the variety name" }]}>
            <Input placeholder="Enter variety name" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Enter description" />
          </Form.Item>
          <Form.Item
            name="subCategory"
            label="Select SubCategory"
            rules={[{ required: true, message: "Please select a subcategory" }]}
          >
            <Select placeholder="Choose a subcategory">
              {subCategories.map((sc) => (
                <Select.Option key={sc._id} value={sc._id}>
                  {sc.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* Display current image during edit mode */}
          {editingItem && editingItem.imageUrl && (
            <Form.Item label="Current Image">
                <img 
                    src={editingItem.imageUrl} 
                    alt="Current Variety" 
                    className="w-24 h-24 object-cover rounded-lg mb-2 border" 
                />
            </Form.Item>
          )}

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