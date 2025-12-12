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
          <h2 className="footer-logo"><img src="/tintdw.png" alt="Logo" className="uc-logo-mobile" /></h2>
          <p className="footer-tagline">
            Experience personalized beauty on your own terms. TINTD provides on-demand doorstep makeup services for weddings, parties, photoshoots, or any day you want to feel special. Our professional artists are ready to serve you anywhere in Chennai.
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
