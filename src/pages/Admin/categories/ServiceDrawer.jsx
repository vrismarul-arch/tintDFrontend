import { useState } from "react";
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Collapse,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";

export default function ServiceDrawer({
  open,
  onClose,
  onSave,
  categories,
  form,
  editingItem,
}) {
  // ✅ State for nested drawer
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
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
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 1000"
            />
          </Form.Item>

          <Form.Item name="price" label="Final Price">
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              placeholder="e.g. 800"
            />
          </Form.Item>

          <Form.Item name="hours" label="Duration Hours">
            <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
          </Form.Item>

          <Form.Item name="minutes" label="Duration Minutes">
            <InputNumber
              min={0}
              max={59}
              style={{ width: "100%" }}
              placeholder="30"
            />
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

          {/* ✅ Button to open nested drawer */}
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setDetailsOpen(true)}
          >
            Manage Service Details
          </Button>
        </Form>
      </Drawer>

      {/* ✅ Nested Drawer for Service Details */}
      <Drawer
        title="Service Details"
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        width={480}
        extra={
          <Button type="primary" onClick={() => setDetailsOpen(false)}>
            Done
          </Button>
        }
      >
        <Collapse accordion>
          <Collapse.Panel header="Overview" key="1">
            <Form.List name="overview">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex gap-2 mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Title" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Overview
                  </Button>
                </>
              )}
            </Form.List>
          </Collapse.Panel>

          <Collapse.Panel header="Procedure Steps" key="2">
            <Form.List name="procedureSteps">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex flex-col gap-2 mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Step Title" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "desc"]}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea placeholder="Step Description" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        Remove Step
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Step
                  </Button>
                </>
              )}
            </Form.List>
          </Collapse.Panel>

          <Collapse.Panel header="Things to Know" key="3">
            <Form.List name="thingsToKnow">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex flex-col gap-2 mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Title" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "desc"]}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea placeholder="Description" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Info
                  </Button>
                </>
              )}
            </Form.List>
          </Collapse.Panel>

          <Collapse.Panel header="Precautions & Aftercare" key="4">
            <Form.List name="precautionsAftercare">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex flex-col gap-2 mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "title"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Title" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "desc"]}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea placeholder="Description" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add Precaution
                  </Button>
                </>
              )}
            </Form.List>
          </Collapse.Panel>

          <Collapse.Panel header="FAQs" key="5">
            <Form.List name="faqs">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="flex flex-col gap-2 mb-2">
                      <Form.Item
                        {...restField}
                        name={[name, "question"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Question" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "answer"]}
                        rules={[{ required: true }]}
                      >
                        <Input.TextArea placeholder="Answer" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        Remove FAQ
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    Add FAQ
                  </Button>
                </>
              )}
            </Form.List>
          </Collapse.Panel>
        </Collapse>
      </Drawer>
    </>
  );
}
