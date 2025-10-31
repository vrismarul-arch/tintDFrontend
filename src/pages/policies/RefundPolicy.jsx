import React from "react";
import "./RefundPolicy.css"; // You can reuse the same A4 style from TermsConditions.css

export default function RefundPolicy() {
  return (
    <div className="a4-container">
      <div className="a4-page">
        <h1>TINTD – Cancellation & Refund Policy</h1>
        <h4>Effective Date: 07-08-2025</h4>
        <h4>Last Updated: 07-08-2025</h4>

        <p>
          This <b>Cancellation & Refund Policy</b> governs all service bookings
          made through the <b>TINTD</b> mobile app or website, operated by{" "}
          <b>VRISM</b>, a sole proprietorship owned by Mr. Vijayasundar,
          headquartered in Chennai, Tamil Nadu, India.
        </p>
        <p>By booking a service, you agree to the terms below.</p>

        <h3>1. Cancellation by Client</h3>
        <ul>
          <li>
            Cancellations made within <b>5 minutes</b> of booking are fully
            refundable, provided the Partner has not yet accepted or started the
            service.
          </li>
          <li>
            After 5 minutes of booking, or once a Partner has been assigned,{" "}
            <b>no refund</b> will be provided under any circumstance.
          </li>
          <li>
            If the Client is unavailable at the time of Partner arrival (“No
            Show”), the booking will be marked as completed, and{" "}
            <b>no refund will apply.</b>
          </li>
        </ul>

        <h3>2. Cancellation by Partner</h3>
        <p>If a Partner cancels or fails to arrive for a confirmed booking:</p>
        <ul>
          <li>The Client will receive a <b>100% refund</b>, or</li>
          <li>
            The option to <b>reschedule the appointment</b> at no additional
            cost.
          </li>
        </ul>
        <p>
          Repeated Partner cancellations may lead to Partner suspension or
          removal from TINTD.
        </p>

        <h3>3. Refund Timelines</h3>
        <ul>
          <li>
            Approved refunds will be processed within{" "}
            <b>5–7 business days</b> through the original payment method.
          </li>
          <li>
            Bank processing times and third-party payment gateway delays are
            beyond TINTD’s control.
          </li>
        </ul>

        <h3>4. Service Quality Issues</h3>
        <p>
          If a Client is dissatisfied due to a verified service deficiency, they
          may raise a complaint within <b>24 hours</b> of service completion via
          the TINTD app or email.
        </p>
        <p>After internal review:</p>
        <ul>
          <li>
            A <b>partial or full refund</b> may be provided; or
          </li>
          <li>
            A <b>re-service</b> may be offered at no additional cost.
          </li>
        </ul>
        <p>
          All such decisions rest solely with <b>TINTD’s Quality Control Team.</b>
        </p>

        <h3>5. Non-Refundable Circumstances</h3>
        <p>No refunds will be issued for:</p>
        <ul>
          <li>Cancellations made after 5 minutes of booking</li>
          <li>Incorrect address, location, or contact information provided</li>
          <li>Unavailability of Client during Partner arrival</li>
          <li>
            Payment gateway or network issues not caused by TINTD
          </li>
          <li>
            Payments made outside the TINTD platform (cash, UPI, direct transfer,
            or any third-party methods)
          </li>
        </ul>

        <h3>6. Policy Modifications</h3>
        <p>
          TINTD reserves the right to modify or update this policy at any time
          without prior notice. Any changes will be effective immediately upon
          posting in the app or on our website.
        </p>

        <h3>7. Contact for Cancellations & Refunds</h3>
        <ul>
          <li><b>TINTD (Operated by VRISM)</b></li>
          <li>Proprietor: Mr. Vijayasundar</li>
          <li>Head Office: Chennai, Tamil Nadu, India</li>
          <li>
            Email:{" "}
            <a href="tintdofficial@gmail.com">tintdofficial@gmail.com</a>
          </li>
          <li>Phone: 9150948143</li>
        </ul>
      </div>
    </div>
  );
}
