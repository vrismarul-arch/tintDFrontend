import React, { useState, useEffect } from "react";
import {
  Card, Row, Col, Drawer, Form, Input, Button,
  Upload, Radio, Select, Modal, Avatar, Spin, Image
} from "antd";
import {
  CheckCircleTwoTone, CloseCircleTwoTone,
  UserOutlined, FileTextOutlined, BankOutlined,
  IdcardOutlined, UploadOutlined, EditFilled, LockOutlined
} from "@ant-design/icons";
import servicespartnerimg from "./servicepartner.jpg";
import api from "../../../../api";
import toast from "react-hot-toast";
import './PartnerRegisterForm.css';

const { Option } = Select;

const stepsDataInitial = [
  { step: "Step 1", title: "Profile Setup", completed: false, icon: <Avatar size="large" icon={<UserOutlined />} style={{ cursor: "pointer", backgroundColor: "#9a5edf" }} /> },
  { step: "Step 2", title: "Documents", completed: false, icon: <FileTextOutlined style={{ fontSize: 24, color: "#9254de" }} /> },
  { step: "Step 3", title: "Bank Info", completed: false, icon: <BankOutlined style={{ fontSize: 24, color: "#9254de" }} /> },
  { step: "Step 4", title: "Experience & Approval", completed: false, icon: <IdcardOutlined style={{ fontSize: 24, color: "#9254de" }} /> },
];

const PartnerRegisterForm = () => {
  const [stepsData, setStepsData] = useState(stepsDataInitial);
  const [open, setOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState(null);
  const [form] = Form.useForm();
  const [experience, setExperience] = useState("fresher");
  const [partnerId, setPartnerId] = useState(null);
  const [partnerData, setPartnerData] = useState(null);
  const [approvalModal, setApprovalModal] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState({});

  const toFileList = (url) => url ? [{ uid: "-1", name: "Uploaded", status: "done", url, thumbUrl: url }] : [];

  useEffect(() => {
    if (partnerId) {
      api.get(`/api/partners/${partnerId}`)
        .then(res => setPartnerData(res.data))
        .catch(() => toast.error("Failed to fetch partner data."));
    }
  }, [partnerId]);

  const handleCardClick = (step, index) => {
    if (index > 0 && !stepsData[index - 1].completed) {
      toast.error(`Please complete ${stepsData[index - 1].title} first`);
      return;
    }
    setSelectedStep(step);
    setOpen(true);
    toast(`Opening ${step.title} form...`, { icon: <EditFilled style={{ color: "#913ef8" }} /> });

    if (partnerData) {
      let prefill = {};
      switch (step.step) {
        case "Step 1":
          prefill = {
            name: partnerData.name,
            phone: partnerData.phone,
            city: partnerData.city,
            gender: partnerData.gender,
            profession: partnerData.profession
          };
          break;
        case "Step 2":
          prefill = {
            aadhaarFront: toFileList(partnerData.aadhaarFront),
            aadhaarBack: toFileList(partnerData.aadhaarBack),
            pan: toFileList(partnerData.pan)
          };
          break;
        case "Step 3":
          prefill = {
            bankName: partnerData.bankName,
            accountNumber: partnerData.accountNumber,
            ifsc: partnerData.ifsc
          };
          break;
        case "Step 4":
          prefill = {
            experience: partnerData.experience || "fresher",
            professionalCert: toFileList(partnerData.professionalCert)
          };
          setExperience(partnerData.experience || "fresher");
          break;
      }
      form.setFieldsValue(prefill);
    }
  };

  const handleFinish = async (values) => {
    try {
      if (selectedStep.step === "Step 2") {
        if (!values.aadhaarFront?.length || !values.aadhaarBack?.length || !values.pan?.length) {
          toast.error("All documents are mandatory!");
          return;
        }
      }

      const formData = new FormData();
      formData.append("step", selectedStep.step);
      if (partnerId) formData.append("partnerId", partnerId);

      for (const key in values) {
        if (Array.isArray(values[key]) && values[key].length > 0) {
          values[key].forEach(file => {
            if (file.originFileObj) formData.append(key, file.originFileObj);
          });
        } else if (values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      }

      const { data } = await api.post("/api/partners/submit", formData, { headers: { "Content-Type": "multipart/form-data" } });

      if (!partnerId) setPartnerId(data._id);
      setPartnerData(data);

      setStepsData(prev => prev.map(s => s.step === selectedStep.step ? { ...s, completed: true } : s));

      toast.success(`${selectedStep.title} completed successfully!`);

      setOpen(false);

      if (selectedStep.step === "Step 4") {
        toast.success("✅ Submitted Successfully! Our Team Will Contact You Soon on your registered mobile number.");
      }

      if (selectedStep.step === "Step 4" && data.status === "approved") {
        setApprovalModal(true);
      }
    } catch (err) {
      toast.error(`❌ Failed to submit ${selectedStep?.step || "form"}. Please try again.`);
    }
  };

  const renderUploadField = (fieldName, label) => (
    <Form.Item
      name={fieldName}
      valuePropName="fileList"
      rules={[{ required: true, message: `${label} is required` }]}
      getValueFromEvent={e => e.fileList}
    >
      <Upload
        beforeUpload={() => false}
        listType="picture-card"
        maxCount={1}
        fileList={form.getFieldValue(fieldName)}
        onChange={({ fileList, file }) => {
          form.setFieldsValue({ [fieldName]: fileList });
          if (file.status === "uploading") {
            setLoadingFiles(prev => ({ ...prev, [fieldName]: true }));
          } else {
            setLoadingFiles(prev => ({ ...prev, [fieldName]: false }));
            if (file.status !== "removed") toast.success(`${label} uploaded successfully!`);
          }
        }}
      >
        {loadingFiles[fieldName] ? <Spin /> : <div><UploadOutlined /><div style={{ marginTop: 8 }}>{label}</div></div>}
      </Upload>
    </Form.Item>
  );

  const renderStepForm = () => {
    switch (selectedStep?.step) {
      case "Step 1":
        return <>
          <Form.Item name="name" rules={[{ required: true }]}><Input placeholder="Name" /></Form.Item>
          <Form.Item name="phone" rules={[{ required: true }]}><Input placeholder="Phone" /></Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
  <Input placeholder="Email" />
</Form.Item>

          <Form.Item name="city" rules={[{ required: true }]}><Input placeholder="City" /></Form.Item>
          <Form.Item name="gender" rules={[{ required: true }]}><Select placeholder="Select Gender">
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
            <Option value="Other">Other</Option>
          </Select></Form.Item>
          <Form.Item name="profession" rules={[{ required: true }]}><Select placeholder="Select Profession">
            <Option value="Beautician">Beautician</Option>
            <Option value="Makeup Artist">Makeup Artist</Option>
            <Option value="Massage Therapist">Massage Therapist</Option>
          </Select></Form.Item>
        </>;
      case "Step 2":
        return <>
          {renderUploadField("aadhaarFront", "Aadhaar Front")}
          {renderUploadField("aadhaarBack", "Aadhaar Back")}
          {renderUploadField("pan", "PAN Card")}
        </>;
      case "Step 3":
        return <>
          <Form.Item name="bankName" rules={[{ required: true }]}><Input placeholder="Bank Name" /></Form.Item>
          <Form.Item name="accountNumber" rules={[{ required: true }]}><Input placeholder="Account Number" /></Form.Item>
          <Form.Item name="ifsc" rules={[{ required: true }]}><Input placeholder="IFSC" /></Form.Item>
        </>;
      case "Step 4":
        return <>
          <h3>Review All Details</h3>
          <p><strong>Name:</strong> {form.getFieldValue("name")}</p>
          <p><strong>Phone:</strong> {form.getFieldValue("phone")}</p>
          <p><strong>Email:</strong> {form.getFieldValue("email")}</p>

          <p><strong>City:</strong> {form.getFieldValue("city")}</p>
          <p><strong>Gender:</strong> {form.getFieldValue("gender")}</p>
          <p><strong>Profession:</strong> {form.getFieldValue("profession")}</p>
          <p><strong>Bank Name:</strong> {form.getFieldValue("bankName")}</p>
          <p><strong>Account Number:</strong> {form.getFieldValue("accountNumber")}</p>
          <p><strong>IFSC:</strong> {form.getFieldValue("ifsc")}</p>

          {/* ✅ Image Preview Group */}
          <Image.PreviewGroup>
            {["aadhaarFront", "aadhaarBack", "pan", "professionalCert"].map(field => {
              const file = form.getFieldValue(field)?.[0];
              if (!file) return null;
              return (
                <div key={field} style={{ marginBottom: 10 }}>
                  <strong>
                    {field === "aadhaarFront" ? "Aadhaar Front"
                      : field === "aadhaarBack" ? "Aadhaar Back"
                      : field === "pan" ? "PAN Card"
                      : "Experience Certificate"}:
                  </strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: 4 }}>
                    <Image
                      src={file.url || URL.createObjectURL(file.originFileObj)}
                      alt={file.name}
                      width={120}
                      height={120}
                      style={{ objectFit: "cover", borderRadius: 4 }}
                      preview={{ mask: "  Preview" }}
                    />
                    <span>{file.name}</span>
                  </div>
                </div>
              );
            })}
          </Image.PreviewGroup>

          <Form.Item name="experience">
            <Radio.Group value={experience} onChange={e => setExperience(e.target.value)}>
              <Radio value="fresher">Fresher</Radio>
              <Radio value="experienced">Experienced</Radio>
            </Radio.Group>
          </Form.Item>

          {experience === "experienced" && renderUploadField("professionalCert", "Experience Certificate")}
        </>;
      default:
        return null;
    }
  };

  return (
    <div className="steps-wrapper">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={15}>
          <div className="banner-box">
            <img src={servicespartnerimg} alt="Banner" className="banner-img" />
          </div>
        </Col>
        <Col xs={22} md={8}>
          <div className="steps-list">
            {stepsData.map((item, index) => {
              const isLocked = index > 0 && !stepsData[index - 1].completed;
              return (
                <Card key={index} hoverable={!isLocked} onClick={() => handleCardClick(item, index)} className={`step-card ${item.completed ? "completed-step" : ""}`}>
                  <div className="step-header">
                    <span>{item.step} {item.completed
                      ? <CheckCircleTwoTone twoToneColor="#52c41a" />
                      : <CloseCircleTwoTone twoToneColor="#ff4d4f" />}</span>
                    <span>{isLocked ? <LockOutlined style={{ fontSize: 24, color: "#ccc" }} /> : item.icon}</span>
                  </div>
                  <p className="step-title">{item.title}</p>
                  <p className={`step-subtitle ${item.completed ? "completed" : isLocked ? "locked" : "pending"}`}>
                    {item.completed ? "Completed" : isLocked ? "Locked" : "Pending"}
                  </p>
                </Card>
              );
            })}
          </div>
        </Col>
      </Row>

      <Drawer
        title={selectedStep ? `${selectedStep.step} - ${selectedStep.title}` : "Register"}
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {renderStepForm()}
          <Button type="primary" htmlType="submit" block style={{ marginTop: 12 }}>Submit</Button>
        </Form>
      </Drawer>

      <Modal
        title="Registration Approved"
        open={approvalModal}
        onOk={() => setApprovalModal(false)}
        onCancel={() => setApprovalModal(false)}
        okText="OK"
      >
        <p>🎉 Congratulations! Your partner request has been approved.</p>
        <p>Your login ID and password have been sent to you via WhatsApp.</p>
        <p>Thanks for contacting <strong>Tintt</strong>. You can now log in and start using our platform.</p>
      </Modal>
    </div>
  );
};

export default PartnerRegisterForm;
