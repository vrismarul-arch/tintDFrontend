import React, { useState } from "react";
import { Input, Button, Checkbox, Typography } from "antd";
import { MobileOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./sendotp.css";
import servicespartnerimg from "./servicepartner.jpg";

const { Title, Text } = Typography;

const Sendotp = () => {
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = () => {
    if (!phone) {
      alert("Please enter mobile number");
      return;
    }
    // TODO: call API to send OTP
    navigate("/verifyotp", { state: { phone } });
  };

  return (
    <div className="partner-wrapper">
      {/* Image Section */}
      <div className="partner-top">
        <img
          src={servicespartnerimg}
          alt="Partner Banner"
          className="partner-image"
        />
      </div>

      {/* Form Section */}
      <div className="partner-bottom">
        <Text strong className="partner-subtitle">
          Be a EatFit Partner
        </Text>
        <Title level={3} className="partner-title">
          Get a stable monthly income
        </Title>

        {/* Input */}
        <div className="partner-input">
          <Text className="partner-label">Enter Mobile Number</Text>
          <Input
            size="large"
            placeholder="e.g. 9999988888"
            prefix={<MobileOutlined style={{ color: "#ff4d4f" }} />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Checkbox */}
        <div className="partner-checkbox">
          <Checkbox>
            By signing up I agree to the{" "}
            <a href="#">Terms of use</a> and <a href="#">Privacy Policy</a>.
          </Checkbox>
        </div>

        {/* Button */}
        <Button
          type="primary"
          size="large"
          block
          className="partner-btn"
          onClick={handleSendOtp}
        >
          Send OTP
        </Button>
      </div>
    </div>
  );
};

export default Sendotp;
