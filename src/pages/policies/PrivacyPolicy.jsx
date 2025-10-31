import React from "react";
import "./PrivacyPolicy.css"; // 👈 create this file for styling

export default function PrivacyPolicy() {
  return (
    <div className="a4-container">
      <div className="a4-page">
        <h1>Privacy Policy - TINTD</h1>
        <h4>Effective Date: 07-08-2025</h4>
        <h4>Last Updated: 07-08-2025</h4>

        <p>
          This Privacy Policy explains how <b>TINTD</b>, operated by <b>VRISM</b>,
          a sole proprietorship owned by Mr. Vijayasundar and headquartered in
          Chennai, Tamil Nadu, India, collects, uses, stores, and protects your
          information when you use our mobile app, website, and related services
          (“Platform”). By using the Platform, you agree to the practices
          described in this policy.
        </p>

        <h3>1. Information We Collect</h3>
        <h4>(a) Personal Information</h4>
        <ul>
          <li>Full name, phone number, email address, and gender</li>
          <li>Address or service location</li>
          <li>Device identifiers (mobile number, IMEI, IP address)</li>
          <li>Payment details (through secure third-party gateways)</li>
        </ul>

        <h4>(b) Location Data</h4>
        <ul>
          <li>Clients: to locate available Partners nearby</li>
          <li>Partners: to navigate and verify service completion</li>
        </ul>

        <h4>(c) Access Permissions</h4>
        <ul>
          <li>Phone Dialer (for in-app calling between Client and Partner)</li>
          <li>Location Services (to show nearby services and route tracking)</li>
          <li>Camera & Storage (for profile pictures, service verification photos)</li>
        </ul>

        <h4>(d) Usage Data</h4>
        <p>
          We collect non-identifiable analytics such as app usage, screen time, and
          performance logs to improve the user experience.
        </p>

        <h3>2. How We Use Your Information</h3>
        <ul>
          <li>Create and manage your account</li>
          <li>Facilitate bookings, payments, and communication</li>
          <li>Verify identity and perform KYC checks</li>
          <li>Improve user experience and app functionality</li>
          <li>Provide customer support</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We do not sell or rent your personal data to third parties.</p>

        <h3>3. Data Sharing</h3>
        <ul>
          <li>Payment gateways (to process transactions securely)</li>
          <li>Verification agencies (for KYC & background checks)</li>
          <li>Law enforcement authorities, when legally required</li>
        </ul>
        <p>
          All third-party service providers are bound by confidentiality and
          data-protection obligations.
        </p>

        <h3>4. Data Retention</h3>
        <p>
          We retain personal data for as long as necessary to provide our
          services or comply with Indian tax and legal requirements. Upon
          deletion of your account, we will anonymize or securely delete
          identifiable information.
        </p>

        <h3>5. Data Security</h3>
        <p>
          We use encryption, firewalls, and secure servers to protect your data.
          However, no method of online transmission is 100% secure; users share
          data at their own risk.
        </p>

        <h3>6. Your Rights</h3>
        <ul>
          <li>Access and review your data</li>
          <li>Correct inaccurate information</li>
          <li>Request account or data deletion</li>
          <li>Withdraw consent to data processing</li>
        </ul>
        <p>
          To exercise these rights, contact{" "}
          <a href="tintdofficial@gmail.com">tintdofficial@gmail.com</a>
        </p>

        <h3>7. Children’s Privacy</h3>
        <p>
          TINTD services are not directed to minors under 18. We do not knowingly
          collect data from minors.
        </p>

        <h3>8. Policy Updates</h3>
        <p>
          We may modify this Privacy Policy periodically. Updates will be
          reflected in-app and on our website. Continued use implies acceptance.
        </p>

        <h3>9. Contact Us</h3>
        <ul>
          <li><b>TINTD (Operated by VRISM)</b></li>
          <li>Proprietor: Mr. Vijayasundar</li>
          <li>Head Office: Chennai, Tamil Nadu, India</li>
          <li>Email: <a href="tintdofficial@gmail.com">tintdofficial@gmail.com</a></li>
          <li>Phone: 9150948143</li>
        </ul>
      </div>
    </div>
  );
}
