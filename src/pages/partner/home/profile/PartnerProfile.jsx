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
  Avatar,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { usePartnerAuth } from "../../../../hooks/usePartnerAuth.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../../../../api";
import "./PartnerProfile.css";
import moment from "moment";

export default function PartnerProfile() {
  const { logout, isAuthed } = usePartnerAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [fileList, setFileList] = useState({});
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const actions = ["Personal Info", "Document", "Bank Info", "Tint ID Card"];
  const documentFields = ["aadhaarFront", "aadhaarBack", "pan", "professionalCert"];
  const bankFields = ["accountNumber", "ifsc", "bankName"];

  // -----------------------------
  // Fetch partner profile from backend
  // -----------------------------
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("partnerToken");
      const { data } = await api.get("/api/partners/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure dob is a string in "YYYY-MM-DD"
      if (data.dob) data.dob = moment(data.dob).format("YYYY-MM-DD");

      setProfile(data);
    } catch (err) {
      message.error(err.response?.data?.error || "Profile fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchProfile();
  }, [isAuthed]);

  const showDrawer = (title) => {
    setDrawerTitle(title);
    setIsEditing(false);
    setOpen(true);
    setFileList({});
  };

  const onClose = () => {
    setOpen(false);
    setDrawerTitle("");
    setIsEditing(false);
    setFileList({});
    form.resetFields();
  };

  const handleLogout = () => {
    logout();
    navigate("/partner/login");
    message.success("Logged out successfully");
  };

  const getInitialValues = (title) => {
    if (!profile) return {};
    if (title === "Personal Info") {
      return { ...profile, dob: profile.dob ? moment(profile.dob, "YYYY-MM-DD") : null };
    } else if (title === "Document") {
      const docs = {};
      documentFields.forEach((f) => (docs[f] = profile[f] || null));
      return docs;
    } else if (title === "Bank Info") {
      const bank = {};
      bankFields.forEach((f) => (bank[f] = profile[f] || ""));
      return bank;
    }
    return {};
  };

  // -----------------------------
  // Handle profile update
  // -----------------------------
  const handleSave = async (values) => {
    try {
      const formData = new FormData();

      // Convert DatePicker value to string
      if (values.dob) values.dob = values.dob.format("YYYY-MM-DD");

      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined && v !== null) formData.append(k, v);
      });

      Object.entries(fileList).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const token = localStorage.getItem("partnerToken");

      const { data } = await api.put("/api/partners/update", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      // Ensure dob is string
      if (data.dob) data.dob = moment(data.dob).format("YYYY-MM-DD");

      message.success(`${drawerTitle} updated successfully`);
      setIsEditing(false);
      setFileList({});
      form.resetFields();
      setProfile(data);
    } catch (err) {
      message.error(err.response?.data?.error || "Update failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );

  if (!profile) return null;

  return (
    <div className="profile-container">
      <div className="profile-left">
        {profile.avatar ? (
          <img src={profile.avatar} alt="Profile" className="profile-img" />
        ) : (
          <Avatar size={120} icon={<UserOutlined />} style={{ backgroundColor: "#9a5edf" }} />
        )}
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

      <div className="profile-right">
        {actions.map((action, idx) => (
          <button key={idx} className="action-btn" onClick={() => showDrawer(action)}>
            <span>{action}</span>
            <FiArrowRight className="icon" />
          </button>
        ))}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <Drawer title={drawerTitle} placement="left" closable onClose={onClose} open={open} width="100%" style={{ maxWidth: "900px" }}>
        {(drawerTitle === "Personal Info" || drawerTitle === "Document" || drawerTitle === "Bank Info") && (
          !isEditing ? (
            <div>
              {drawerTitle === "Personal Info" && (
                <>
                  <Image src={profile.avatar || ""} width={120} height={120} style={{ borderRadius: "50%", marginBottom: 16 }} fallback={<Avatar size={120} icon={<UserOutlined />} />} />
                  <p><strong>Name:</strong> {profile.name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Phone:</strong> {profile.phone}</p>
                  <p><strong>City:</strong> {profile.city || "-"}</p>
                  <p><strong>Gender:</strong> {profile.gender || "-"}</p>
                  <p><strong>Profession:</strong> {profile.profession || "-"}</p>
                  <p><strong>Date of Birth:</strong> {profile.dob || "-"}</p>
                  <p><strong>Partner ID:</strong> {profile.partnerId}</p>
                  <Tag color={profile.status === "approved" ? "green" : "orange"}>{profile.status?.toUpperCase()}</Tag>
                </>
              )}
              {drawerTitle === "Document" && documentFields.map((f) => profile[f] && <p key={f}><strong>{f.replace(/([A-Z])/g," $1")}:</strong><br/><Image src={profile[f]} width={200} /></p>)}
              {drawerTitle === "Bank Info" && bankFields.map((f) => <p key={f}><strong>{f.replace(/([A-Z])/g," $1")}:</strong> {profile[f] || "-"}</p>)}
              <Button type="primary" onClick={() => setIsEditing(true)}>Edit</Button>
            </div>
          ) : (
            <Form layout="vertical" form={form} initialValues={getInitialValues(drawerTitle)} onFinish={handleSave}>
              {drawerTitle === "Personal Info" && (
                <>
                  <Form.Item label="Profile Image">
                    <Upload beforeUpload={(file) => { setFileList(prev => ({ ...prev, avatar: file })); return false; }} showUploadList={false}>
                      <Button icon={<UploadOutlined />}>Upload New Image</Button>
                    </Upload>
                    {fileList.avatar ? <Image src={URL.createObjectURL(fileList.avatar)} width={120} height={120} style={{ borderRadius: "50%", marginTop: 8 }} /> : profile.avatar && <Image src={profile.avatar} width={120} height={120} style={{ borderRadius: "50%", marginTop: 8 }} />}
                  </Form.Item>
                  <Form.Item name="name" label="Name"><Input /></Form.Item>
                  <Form.Item name="email" label="Email"><Input /></Form.Item>
                  <Form.Item name="phone" label="Phone"><Input /></Form.Item>
                  <Form.Item name="city" label="City"><Input /></Form.Item>
                  <Form.Item name="gender" label="Gender"><Input /></Form.Item>
                  <Form.Item name="profession" label="Profession"><Input /></Form.Item>
                  <Form.Item name="dob" label="Date of Birth"><DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" /></Form.Item>
                </>
              )}
              {drawerTitle === "Document" && documentFields.map((f) => (
                <Form.Item key={f} label={f.replace(/([A-Z])/g," $1")}>
                  <Upload beforeUpload={(file) => { setFileList(prev => ({ ...prev, [f]: file })); return false; }} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                  {fileList[f] ? <Image src={URL.createObjectURL(fileList[f])} width={200} /> : profile[f] && <Image src={profile[f]} width={200} />}
                </Form.Item>
              ))}
              {drawerTitle === "Bank Info" && bankFields.map((f) => <Form.Item key={f} name={f} label={f.replace(/([A-Z])/g," $1")}><Input /></Form.Item>)}
              <div style={{ display: "flex", gap: 10 }}>
                <Button type="primary" htmlType="submit">Save</Button>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            </Form>
          )
        )}
      </Drawer>
    </div>
  );
}
