import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  Drawer,
  Spin,
  message,
  Button,
  Tag,
  Image,
  Form,
  Input,
  Upload,
  DatePicker,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.js";
import { useNavigate } from "react-router-dom";
import api from "../../../../../api";
import "./PartnerProfile.css";
import moment from "moment"; // Import the moment library

export default function PartnerProfile() {
  const { logout, isAuthed } = usePartnerAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState({});
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Hook to get form instance

  const actions = ["Personal Info", "Document", "Bank Info", "Tint ID Card"];

  // Fetch profile when logged in
  useEffect(() => {
    if (!isAuthed) return;

    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("partnerToken");
        const { data } = await api.get("/api/partners/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
      } catch (err) {
        message.error(err.response?.data?.error || "Profile fetch error");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed]);

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem("partnerToken");
      const { data } = await api.get("/api/partners/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data);
    } catch (err) {}
  };

  const showDrawer = (title) => {
    setDrawerTitle(title);
    setIsEditing(false);
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setDrawerTitle("");
    setIsEditing(false);
    setFileList({});
    form.resetFields(); // Reset form fields on close
  };

  const handleLogout = () => {
    logout();
    navigate("/partner/login");
    message.success("Logged out successfully");
  };

  const handleSave = async (values) => {
    try {
      const formData = new FormData();

      // Convert DOB to string if present
      if (values.dob) values.dob = values.dob.format("YYYY-MM-DD");

      Object.entries(values).forEach(([k, v]) => formData.append(k, v));
      Object.entries(fileList).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const token = localStorage.getItem("partnerToken");
      await api.put("/api/partners/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Profile updated successfully");
      setIsEditing(false);
      await refreshProfile();
    } catch (err) {
      message.error(err.response?.data?.error || "Update failed");
    }
  };
  
  // Prepare initial values for the form, converting dob to a moment object
  const initialFormValues = profile ? {
    ...profile,
    dob: profile.dob ? moment(profile.dob, "YYYY-MM-DD") : null,
  } : {};
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-container">
      {/* Left Profile Section */}
      <div className="profile-left">
        <img
          src={profile.avatar || "https://i.pravatar.cc/150"}
          alt="Profile"
          className="profile-img"
        />
        <h2 className="profile-name">{profile.name}</h2>
        <div className="profile-details">
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
          <p><strong>City:</strong> {profile.city || "-"}</p>
          <p><strong>Gender:</strong> {profile.gender || "-"}</p>
          <p><strong>Profession:</strong> {profile.profession || "-"}</p>
          <p><strong>Date of Birth:</strong> {profile.dob || "-"}</p>
          <p className="status">
            <strong>Status:</strong>{" "}
            <Tag color={profile.status === "approved" ? "green" : "orange"}>
              {profile.status?.toUpperCase()}
            </Tag>
          </p>
        </div>
      </div>

      {/* Right Action Section */}
      <div className="profile-right">
        {actions.map((action, idx) => (
          <button
            key={idx}
            className="action-btn"
            onClick={() => showDrawer(action)}
          >
            <span>{action}</span>
            <FiArrowRight className="icon" />
          </button>
        ))}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Drawer */}
      <Drawer
        title={drawerTitle}
        placement="left"
        closable
        onClose={onClose}
        open={open}
        width="100%"
        style={{ maxWidth: "900px" }}
      >
        {/* PERSONAL INFO */}
        {drawerTitle === "Personal Info" && (
          <>
            {!isEditing ? (
              <div>
                <Image
                  src={profile.avatar || "https://i.pravatar.cc/150"}
                  width={120}
                  height={120}
                  style={{ borderRadius: "50%", marginBottom: 16 }}
                />
                <p><strong>Name:</strong> {profile.name}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Phone:</strong> {profile.phone}</p>
                <p><strong>City:</strong> {profile.city || "-"}</p>
                <p><strong>Gender:</strong> {profile.gender || "-"}</p>
                <p><strong>Profession:</strong> {profile.profession || "-"}</p>
                <p><strong>Date of Birth:</strong> {profile.dob || "-"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Tag color={profile.status === "approved" ? "green" : "orange"}>
                    {profile.status?.toUpperCase()}
                  </Tag>
                </p>
                <p><strong>Partner ID:</strong> {profile.partnerId}</p>
                <Button type="primary" onClick={() => setIsEditing(true)}>Edit</Button>
              </div>
            ) : (
              <Form layout="vertical" initialValues={initialFormValues} onFinish={handleSave} form={form}>
                <Form.Item label="Profile Image">
                  <Upload
                    beforeUpload={(file) => {
                      setFileList((prev) => ({ ...prev, avatar: file }));
                      return false;
                    }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload New Image</Button>
                  </Upload>
                  <Image
                    src={fileList.avatar ? URL.createObjectURL(fileList.avatar) : profile.avatar || "https://i.pravatar.cc/150"}
                    width={120}
                    height={120}
                    style={{ borderRadius: "50%", marginTop: 8 }}
                  />
                </Form.Item>

                <Form.Item name="name" label="Name"><Input /></Form.Item>
                <Form.Item name="email" label="Email"><Input /></Form.Item>
                <Form.Item name="phone" label="Phone"><Input /></Form.Item>
                <Form.Item name="city" label="City"><Input /></Form.Item>
                <Form.Item name="gender" label="Gender"><Input /></Form.Item>
                <Form.Item name="profession" label="Profession"><Input /></Form.Item>

                <Form.Item
                  name="dob"
                  label="Date of Birth"
                  rules={[{ required: true, message: "Please select your date of birth" }]}
                >
                  <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>


                <Form.Item label="Status">
                  <Tag color={profile.status === "approved" ? "green" : "orange"}>
                    {profile.status?.toUpperCase()}
                  </Tag>
                </Form.Item>
                <Form.Item label="Partner ID">
                  <Input value={profile.partnerId} disabled />
                </Form.Item>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="primary" htmlType="submit">Save</Button>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </Form>
            )}
          </>
        )}

        {/* DOCUMENT INFO */}
        {drawerTitle === "Document" && (
          <>
            {!isEditing ? (
              <div>
                {profile.aadhaarFront && <p><strong>Aadhaar Front:</strong><br /><Image src={profile.aadhaarFront} width={200} /></p>}
                {profile.aadhaarBack && <p><strong>Aadhaar Back:</strong><br /><Image src={profile.aadhaarBack} width={200} /></p>}
                {profile.pan && <p><strong>PAN:</strong><br /><Image src={profile.pan} width={200} /></p>}
                {profile.professionalCert && <p><strong>Experience Certificate:</strong><br /><Image src={profile.professionalCert} width={200} /></p>}
                <Button type="primary" onClick={() => setIsEditing(true)}>Edit</Button>
              </div>
            ) : (
              <Form layout="vertical" onFinish={handleSave}>
                {["aadhaarFront","aadhaarBack","pan","professionalCert"].map((field) => (
                  <Form.Item key={field} label={field.replace(/([A-Z])/g, " $1")}>
                    <Upload
                      beforeUpload={(file) => {
                        setFileList((prev) => ({ ...prev, [field]: file }));
                        return false;
                      }}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />}>Upload</Button>
                    </Upload>
                    {fileList[field] || profile[field] ? (
                      <Image
                        src={fileList[field] ? URL.createObjectURL(fileList[field]) : profile[field]}
                        width={200}
                      />
                    ) : null}
                  </Form.Item>
                ))}
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="primary" htmlType="submit">Save</Button>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </Form>
            )}
          </>
        )}

        {/* BANK INFO */}
        {drawerTitle === "Bank Info" && (
          <>
            {!isEditing ? (
              <div>
                <p><strong>Account Number:</strong> {profile.accountNumber || "-"}</p>
                <p><strong>IFSC:</strong> {profile.ifsc || "-"}</p>
                <p><strong>Bank Name:</strong> {profile.bankName || "-"}</p>
                <Button type="primary" onClick={() => setIsEditing(true)}>Edit</Button>
              </div>
            ) : (
              <Form layout="vertical" initialValues={profile} onFinish={handleSave}>
                <Form.Item name="accountNumber" label="Account Number"><Input /></Form.Item>
                <Form.Item name="ifsc" label="IFSC"><Input /></Form.Item>
                <Form.Item name="bankName" label="Bank Name"><Input /></Form.Item>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Button type="primary" htmlType="submit">Save</Button>
                  <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              </Form>
            )}
          </>
        )}

        {/* TINT ID CARD */}
        {drawerTitle === "Tint ID Card" && (
          <div className="idcard-container">
            <div className="idcard-card">
              <div className="idcard-header">
                <img src={profile.avatar || "/tintD.png"} alt="avatar" className="idcard-avatar" />
                <img src="/tintdw.png" alt="Logo" className="uc-logo-mobile" />
              </div>

              <div className="idcard-details">
                <div className="idcard-info">
                  <h2 className="idcard-name">{profile.name}</h2>
                  <h2 style={{
                    color: profile.status === "approved" ? "green" :
                           profile.status === "rejected" ? "red" : "orange"
                  }}>
                    {profile.status ? profile.status.toUpperCase() : "PENDING"}
                  </h2>
                </div>
                <p><strong>License Validity:</strong> {profile.licenseValidity || "-"}</p>
                <p><strong>Partner ID:</strong> {profile.partnerId || "-"}</p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}