import { Drawer, Form, Input, InputNumber, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function ServiceDrawer({
  open,
  onClose,
  onSave,
  categories,
  form,
  editingItem,
}) {
  return (
    <Drawer
      title={`${editingItem ? "Edit" : "Add"} Service`}
      open={open}
      onClose={onClose}
      width={480}
      extra={
        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={onSave}>
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
          <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 1000" />
        </Form.Item>

        <Form.Item name="price" label="Final Price">
          <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g. 800" />
        </Form.Item>

        <Form.Item name="hours" label="Duration Hours">
          <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
        </Form.Item>

        <Form.Item name="minutes" label="Duration Minutes">
          <InputNumber min={0} max={59} style={{ width: "100%" }} placeholder="30" />
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

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Enter service details" />
        </Form.Item>

        <Form.Item
          name="image"
          label="Upload Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
        >
          <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
