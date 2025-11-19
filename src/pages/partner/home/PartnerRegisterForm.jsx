import React, { useState, useEffect } from "react";
// 1. ✅ Import useNavigate for redirection
import { useNavigate } from "react-router-dom";
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
import api from "../../../../api"; // Assuming this is your axios instance setup
import toast from "react-hot-toast";
import './PartnerRegisterForm.css'; // Assuming this CSS file exists

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
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // 2. ✅ Initialize the navigate hook
  const navigate = useNavigate();

  const toFileList = (url) => url ? [{ uid: "-1", name: "Uploaded", status: "done", url, thumbUrl: url }] : [];

  useEffect(() => {
    if (partnerId) {
      api.get(`/api/partners/${partnerId}`)
        .then(res => setPartnerData(res.data))
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
            email: partnerData.email, // Ensure email is included if available
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
    setSubmitLoading(true);
    try {
      if (selectedStep.step === "Step 2") {
        const hasAllDocs = values.aadhaarFront?.length && values.aadhaarBack?.length && values.pan?.length;
        if (!hasAllDocs) {
          toast.error("All documents (Aadhaar Front/Back, PAN) are mandatory!");
          setSubmitLoading(false);
          return;
        }
      }
      
      // Validation for Step 4 if experienced, must have certificate
      if (selectedStep.step === "Step 4" && values.experience === "experienced") {
        const hasCert = values.professionalCert?.length;
        if (!hasCert) {
          toast.error("Experience Certificate is required for experienced partners!");
          setSubmitLoading(false);
          return;
        }
      }


      const formData = new FormData();
      formData.append("step", selectedStep.step);
      if (partnerId) formData.append("partnerId", partnerId);

      for (const key in values) {
        if (Array.isArray(values[key]) && values[key].length > 0) {
          values[key].forEach(file => {
            // Only append the actual file object for new uploads
            if (file.originFileObj) formData.append(key, file.originFileObj);
            // If it's an existing file with a URL (not being re-uploaded), handle it on the backend
            // For safety, we often only send new files and let the backend manage existing URLs
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
        
        // 3. ✅ REDIRECTION LOGIC
        navigate('/partner'); 
      }

      if (selectedStep.step === "Step 4" && data.status === "approved") {
        setApprovalModal(true);
      }
    } catch (err) {
      toast.error(`❌ Failed to submit ${selectedStep?.step || "form"}. Please try again.`);
      console.error(err);
    } finally {
      setSubmitLoading(false);
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
    // Attempt to retrieve current partner data for prefilling or review
    const currentPartnerData = partnerData || {};
    
    switch (selectedStep?.step) {
      case "Step 1":
        return <>
          <Form.Item name="name" rules={[{ required: true, message: "Name is required" }]}><Input placeholder="Name" /></Form.Item>
          <Form.Item 
            name="phone" 
            rules={[
              { required: true, message: "Phone is required" }, 
              { pattern: /^[0-9]{10}$/, message: "Must be a valid 10-digit phone number" }
            ]}
          ><Input placeholder="Phone" /></Form.Item>
          <Form.Item name="email" rules={[{ required: true, type: "email", message: "A valid email is required" }]}><Input placeholder="Email" /></Form.Item>
          <Form.Item name="city" rules={[{ required: true, message: "City is required" }]}><Input placeholder="City" /></Form.Item>
          <Form.Item name="gender" rules={[{ required: true, message: "Gender is required" }]}><Select placeholder="Select Gender">
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
            <Option value="Other">Other</Option>
          </Select></Form.Item>
          <Form.Item name="profession" rules={[{ required: true, message: "Profession is required" }]}><Select placeholder="Select Profession">
            <Option value="Beautician">Beautician</Option>
            <Option value="Makeup Artist">Makeup Artist</Option>
            <Option value="Massage Therapist">Massage Therapist</Option>
          </Select></Form.Item>
        </>;
      case "Step 2":
        return <>
          <p>Please upload clear images of the following documents:</p>
          {renderUploadField("aadhaarFront", "Aadhaar Front")}
          {renderUploadField("aadhaarBack", "Aadhaar Back")}
          {renderUploadField("pan", "PAN Card")}
        </>;
      case "Step 3":
        return <>
          <Form.Item name="bankName" rules={[{ required: true, message: "Bank Name is required" }]}><Input placeholder="Bank Name" /></Form.Item>
          <Form.Item name="accountNumber" rules={[{ required: true, message: "Account Number is required" }]}><Input placeholder="Account Number" /></Form.Item>
          <Form.Item name="ifsc" rules={[{ required: true, message: "IFSC Code is required" }]}><Input placeholder="IFSC" /></Form.Item>
        </>;
      case "Step 4":
        // Fallback to partnerData if form values haven't been set yet
        const displayData = {
            name: form.getFieldValue("name") || currentPartnerData.name || "N/A",
            phone: form.getFieldValue("phone") || currentPartnerData.phone || "N/A",
            email: form.getFieldValue("email") || currentPartnerData.email || "N/A",
            city: form.getFieldValue("city") || currentPartnerData.city || "N/A",
            gender: form.getFieldValue("gender") || currentPartnerData.gender || "N/A",
            profession: form.getFieldValue("profession") || currentPartnerData.profession || "N/A",
            bankName: form.getFieldValue("bankName") || currentPartnerData.bankName || "N/A",
            accountNumber: form.getFieldValue("accountNumber") || currentPartnerData.accountNumber || "N/A",
            ifsc: form.getFieldValue("ifsc") || currentPartnerData.ifsc || "N/A",
        };

        return <>
          <h3>Review Your Details</h3>
          <p><strong>Name:</strong> {displayData.name}</p>
          <p><strong>Phone:</strong> {displayData.phone}</p>
          <p><strong>Email:</strong> {displayData.email}</p>
          <p><strong>City:</strong> {displayData.city}</p>
          <p><strong>Gender:</strong> {displayData.gender}</p>
          <p><strong>Profession:</strong> {displayData.profession}</p>
          
          <h3 style={{ marginTop: 15 }}>Bank Details</h3>
          <p><strong>Bank Name:</strong> {displayData.bankName}</p>
          <p><strong>Account Number:</strong> {displayData.accountNumber}</p>
          <p><strong>IFSC:</strong> {displayData.ifsc}</p>

          <h3 style={{ marginTop: 15 }}>Uploaded Documents</h3>
          <Image.PreviewGroup>
            {["aadhaarFront", "aadhaarBack", "pan", "professionalCert"].map(field => {
              const fileList = form.getFieldValue(field) || toFileList(currentPartnerData[field]);
              const file = fileList?.[0];
              if (!file) return null;
              
              const fieldLabels = {
                  aadhaarFront: "Aadhaar Front",
                  aadhaarBack: "Aadhaar Back",
                  pan: "PAN Card",
                  professionalCert: "Experience Certificate"
              };
              
              const imageUrl = file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);

              return (
                <div key={field} style={{ marginBottom: 10 }}>
                  <strong>{fieldLabels[field]}:</strong>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: 4 }}>
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={file.name}
                        width={120}
                        height={120}
                        style={{ objectFit: "cover", borderRadius: 4 }}
                        preview={{ mask: "Preview" }}
                      />
                    )}
                    <span>{file.name || "File Uploaded"}</span>
                  </div>
                </div>
              );
            })}
          </Image.PreviewGroup>

          <h3 style={{ marginTop: 15 }}>Experience</h3>
          <Form.Item name="experience" initialValue="fresher" style={{ marginBottom: 0 }}>
            <Radio.Group onChange={e => setExperience(e.target.value)}>
              <Radio value="fresher">Fresher</Radio>
              <Radio value="experienced">Experienced</Radio>
            </Radio.Group>
          </Form.Item>

          {experience === "experienced" && (
            <div style={{ marginTop: 15 }}>
              {renderUploadField("professionalCert", "Experience Certificate")}
            </div>
          )}
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
                <Card
                  key={index}
                  hoverable={!isLocked}
                  onClick={() => handleCardClick(item, index)}
                  className={`step-card ${item.completed ? "completed-step" : ""}`}
                >
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
        <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ experience: "fresher" }}>
          {renderStepForm()}
          <Button
            type="primary"
            htmlType="submit"
            block
            style={{ marginTop: 12 }}
            loading={submitLoading}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </Button>
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
      </Modal>
    </div>
  );
};

export default PartnerRegisterForm;