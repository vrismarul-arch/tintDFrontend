import React from "react";
import "./Footer.css";
import {
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section */}
        <div className="footer-column">
          <h2 className="footer-logo">TINTD</h2>
          <p className="footer-tagline">
           Expert makeup artists at your doorstep. Serving Chennai with on-demand beauty services.
          </p>
        </div>

        {/* Information Section */}
     

        {/* Need Help Section */}
        <div className="footer-column">
          <h3>Need Help</h3>
          {/* <Link to="/refund-policy">Refund Policy</Link> */}
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-conditions">Terms and Conditions</Link>
          <Link to="/refund-policy">Refund Policy</Link>
        </div>

        {/* Contact Section */}
        <div className="footer-column">
          <h3>Contact Support</h3>

          <p>
            <strong>Address:</strong>
            <br />
            <EnvironmentOutlined /> No.3A, Kurinji Nagar, 8th Cross Street, Perungudi,
            Chennai – 600096, India.
          </p>

      

          <p>
            <MailOutlined /> tintdofficial@gmail.com
            <br />
            <PhoneOutlined /> +91 9150948143
          </p>

          <div className="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <FacebookFilled /> </a>
           
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <InstagramFilled />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer">
              <YoutubeFilled />
            </a>
          </div>
        </div>
      </div>

      <p className="footer-bottom">
        © {new Date().getFullYear()} Tintd. All rights reserved.
      </p>
    </footer>
  );
}
