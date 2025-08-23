import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Drawer,
  Form,
  Input,
  DatePicker,
  Switch,
  Upload,
  message,
  Dropdown,
  Menu,
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import api from "../../../../api";
import "./banners.css";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const res = await api.get("/api/admin/banners");
    setBanners(res.data);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (key === "schedule") {
          if (values.schedule) {
            formData.append("schedule[startDate]", values.schedule[0]?.toISOString());
            formData.append("schedule[endDate]", values.schedule[1]?.toISOString());
          }
        } else {
          formData.append(key, values[key]);
        }
      });

      if (values.image && values.image[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      if (editingItem) {
        await api.put(`/api/admin/banners/${editingItem._id}`, formData);
        message.success("Banner updated!");
      } else {
        await api.post("/api/admin/banners", formData);
        message.success("Banner added!");
      }

      setIsDrawerOpen(false);
      form.resetFields();
      setEditingItem(null);
      fetchBanners();
    } catch (err) {
      message.error("Something went wrong!");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/admin/banners/${id}`);
    fetchBanners();
    message.success("Banner deleted!");
  };

  return (
    <div className="banners-page">
      <div className="header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🖼️ Banners</h2>
        <Button
          type="primary"
          onClick={() => {
            setIsDrawerOpen(true);
            setEditingItem(null);
            form.resetFields();
          }}
        >
          + Add Banner
        </Button>
      </div>

      <Table
        dataSource={banners}
        rowKey="_id"
        pagination={{ pageSize: 5 }}
        columns={[
              { title: "S.No.", render: (_, __, index) => index + 1, width: 70, align: "center" },

          { title: "Title", dataIndex: "title" },
          { title: "Subtitle", dataIndex: "subtitle" },
          {
            title: "Image",
            dataIndex: "imageUrl",
            render: (url) => (
              <img
                src={url}
                alt="banner"
                className="w-28 h-16 object-cover rounded shadow border serviceimage"
              />
            ),
          },
          { title: "Active", dataIndex: "isActive", render: (a) => (a ? "Yes" : "No") },
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
                          title: record.title,
                          subtitle: record.subtitle,
                          btnText: record.btnText,
                          btnLink: record.btnLink,
                          isActive: record.isActive,
                          image: record.imageUrl
                            ? [
                                {
                                  uid: "-1",
                                  name: "banner.png",
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
        title={`${editingItem ? "Edit" : "Add"} Banner`}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={500}
        extra={<Button type="primary" onClick={handleSave}>Save</Button>}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subtitle" label="Subtitle">
            <Input />
          </Form.Item>
          <Form.Item name="btnText" label="Button Text">
            <Input />
          </Form.Item>
          <Form.Item name="btnLink" label="Button Link">
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="schedule" label="Schedule">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item
            name="image"
            label="Upload Image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
