import { Drawer, Button, Form, Input } from "antd";

export default function ServiceDetailDrawer({ open, onClose, serviceDetail, onSave }) {
  const [form] = Form.useForm();

  // Pre-fill when editing
  React.useEffect(() => {
    if (serviceDetail) {
      form.setFieldsValue(serviceDetail);
    } else {
      form.resetFields();
    }
  }, [serviceDetail, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSave(values); // parent handles API call
    } catch (err) {
      console.error("Validation failed:", err);
    }
  };

  return (
    <Drawer
      title="Service Details"
      open={open}
      onClose={onClose}
      width={600}
      extra={
        <div className="flex gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>
            Save
          </Button>
        </div>
      }
    >
      <Form layout="vertical" form={form}>
        {/* Procedure Steps */}
        <Form.List name="procedureSteps">
          {(fields, { add, remove }) => (
            <>
              <h3 className="font-semibold mb-2">Procedure Steps</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex gap-2 items-center mb-2">
                  <Form.Item {...restField} name={[name, "title"]} rules={[{ required: true }]}>
                    <Input placeholder="Step Title" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "desc"]} rules={[{ required: true }]}>
                    <Input placeholder="Step Description" />
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

        {/* Things To Know */}
        <Form.List name="thingsToKnow">
          {(fields, { add, remove }) => (
            <>
              <h3 className="font-semibold mt-4 mb-2">Things To Know</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex gap-2 items-center mb-2">
                  <Form.Item {...restField} name={[name, "title"]}>
                    <Input placeholder="Title" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "desc"]}>
                    <Input placeholder="Description" />
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

        {/* Precautions */}
        <Form.List name="precautionsAftercare">
          {(fields, { add, remove }) => (
            <>
              <h3 className="font-semibold mt-4 mb-2">Precautions & Aftercare</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex gap-2 items-center mb-2">
                  <Form.Item {...restField} name={[name, "title"]}>
                    <Input placeholder="Title" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "desc"]}>
                    <Input placeholder="Description" />
                  </Form.Item>
                  <Button danger onClick={() => remove(name)}>Remove</Button>
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} block>
                + Add Aftercare
              </Button>
            </>
          )}
        </Form.List>

        {/* FAQs */}
        <Form.List name="faqs">
          {(fields, { add, remove }) => (
            <>
              <h3 className="font-semibold mt-4 mb-2">FAQs</h3>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="flex gap-2 items-center mb-2">
                  <Form.Item {...restField} name={[name, "question"]}>
                    <Input placeholder="Question" />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "answer"]}>
                    <Input placeholder="Answer" />
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
      </Form>
    </Drawer>
  );
}
