import React, { useState } from "react";
import { Input, Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";  // <-- import navigation
import "./VerifyOTP.css";
import servicespartnerimg from "./servicepartner.jpg";

const { Title, Text } = Typography;

const VerifyOTP = ({ phone = "9999988888", onVerify }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const navigate = useNavigate(); // router hook

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleVerify = () => {
    const otpValue = otp.join("");
    if (otpValue.length === 6) {
      onVerify?.(otpValue);
    } else {
      alert("Please enter complete 6-digit OTP");
    }
  };

  return (
    <div className="otp-container">
      {/* Left: OTP Form */}
      <div className="otp-wrapper">
        <div className="otp-header">
          {/* ✅ Back navigates to Send OTP page */}
          <ArrowLeftOutlined
            onClick={() => navigate("/sentotp")}
            className="otp-back"
          />
        </div>

        <div className="otp-content">
          <Title level={4}>Enter OTP to verify</Title>
          <Text>
            A 6 digit OTP has been sent to your phone number{" "}
            <b>+91 {phone}</b>{" "}
            <span className="otp-change">Change</span>
          </Text>

          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-input-${index}`}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, index)}
                className="otp-box"
              />
            ))}
          </div>

          <Button
            type="primary"
            className="otp-btn"
            block
            onClick={handleVerify}
          >
            Verify OTP
          </Button>
        </div>
      </div>

      {/* Right: Image */}
      <div className="otp-image">
        <img src={servicespartnerimg} alt="OTP Illustration" />
      </div>
    </div>
  );
};

export default VerifyOTP;
