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
  Card,
  Grid,
} from "antd";
import {
  UploadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "../../../../api";
import "./banners.css";

const { useBreakpoint } = Grid;

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] = useState(null);
  const screens = useBreakpoint();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/api/admin/banners");
      setBanners(res.data);
    } catch (err) {
      message.error("Failed to load banners!");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      // handle schedule
      if (values.schedule) {
        formData.append("schedule[startDate]", values.schedule[0]?.toISOString());
        formData.append("schedule[endDate]", values.schedule[1]?.toISOString());
      }

      // handle other fields
      ["title", "subtitle", "btnText", "btnLink", "isActive"].forEach((field) => {
        if (values[field] !== undefined) formData.append(field, values[field]);
      });

      // handle image
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
    try {
      await api.delete(`/api/admin/banners/${id}`);
      fetchBanners();
      message.success("Banner deleted!");
    } catch {
      message.error("Failed to delete banner!");
    }
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      title: record.title || "",
      subtitle: record.subtitle !== "undefined" ? record.subtitle : "",
      btnText: record.btnText !== "undefined" ? record.btnText : "",
      btnLink: record.btnLink !== "undefined" ? record.btnLink : "",
      isActive: record.isActive,
      schedule:
        record.schedule?.startDate && record.schedule?.endDate
          ? [dayjs(record.schedule.startDate), dayjs(record.schedule.endDate)]
          : null,
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
  };

  // =========================
  // Mobile Card View
  // =========================
  const renderCards = () => (
    <div className="banner-cards">
      {banners.map((banner, index) => (
        <Card
          key={banner._id}
          className="banner-card"
          title={`${index + 1}. ${banner.title || "Untitled"}`}
          extra={
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item icon={<EditOutlined />} onClick={() => handleEdit(banner)}>
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => handleDelete(banner._id)}
                  >
                    Delete
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          }
        >
          {banner.imageUrl && (
            <img
              src={banner.imageUrl}
              alt="banner"
              className="w-full h-40 object-cover rounded shadow border mb-2"
            />
          )}
          <p><strong>Subtitle:</strong> {banner.subtitle !== "undefined" ? banner.subtitle || "-" : "-"}</p>
          <p>
            <strong>Button:</strong>{" "}
            {banner.btnLink && banner.btnLink !== "undefined" ? (
              <a href={banner.btnLink} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                {banner.btnText !== "undefined" ? banner.btnText : banner.btnLink}
              </a>
            ) : (
              "-"
            )}
          </p>
          <p><strong>Active:</strong> {banner.isActive ? "Yes" : "No"}</p>
          {banner.schedule?.startDate && banner.schedule?.endDate && (
            <p>
              <strong>Schedule:</strong>{" "}
              {dayjs(banner.schedule.startDate).format("DD MMM YYYY")} →{" "}
              {dayjs(banner.schedule.endDate).format("DD MMM YYYY")}
            </p>
          )}
        </Card>
      ))}
    </div>
  );

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

      {/* Table for desktop, Cards for mobile */}
      {screens.xs ? (
        renderCards()
      ) : (
        <Table
          dataSource={banners}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: "S.No.",
              render: (_, __, index) => index + 1,
              width: 70,
              align: "center",
            },
            { title: "Title", dataIndex: "title" },
            {
              title: "Subtitle",
              dataIndex: "subtitle",
              render: (v) => (v !== "undefined" && v ? v : "-"),
            },
            {
              title: "Button Text",
              dataIndex: "btnText",
              render: (v) => (v !== "undefined" && v ? v : "-"),
            },
            {
              title: "Button Link",
              dataIndex: "btnLink",
              render: (link) =>
                link && link !== "undefined" ? (
                  <a href={link} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                    {link}
                  </a>
                ) : (
                  "-"
                ),
            },
            {
              title: "Image",
              dataIndex: "imageUrl",
              render: (url) =>
                url ? (
                  <img
                    src={url}
                    alt="banner"
                    className="w-28 h-16 object-cover rounded shadow border serviceimage"
                  />
                ) : (
                  "-"
                ),
            },
            {
              title: "Schedule",
              render: (_, record) =>
                record.schedule?.startDate && record.schedule?.endDate ? (
                  <>
                    {dayjs(record.schedule.startDate).format("DD MMM YYYY")} →{" "}
                    {dayjs(record.schedule.endDate).format("DD MMM YYYY")}
                  </>
                ) : (
                  "-"
                ),
            },
            {
              title: "Active",
              dataIndex: "isActive",
              render: (a) => (a ? "Yes" : "No"),
            },
            {
              title: "Actions",
              render: (_, record) => (
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item icon={<EditOutlined />} onClick={() => handleEdit(record)}>
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
      )}

      {/* Drawer Form */}
      <Drawer
        title={`${editingItem ? "Edit" : "Add"} Banner`}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={500}
        extra={<Button type="primary" onClick={handleSave}>Save</Button>}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Title">
            <Input placeholder="Enter banner title" />
          </Form.Item>
          <Form.Item name="subtitle" label="Subtitle">
            <Input placeholder="Enter subtitle" />
          </Form.Item>
          <Form.Item name="btnText" label="Button Text">
            <Input placeholder="Enter button text (e.g. Book Now)" />
          </Form.Item>
          <Form.Item name="btnLink" label="Button Link">
            <Input placeholder="https://example.com" />
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
