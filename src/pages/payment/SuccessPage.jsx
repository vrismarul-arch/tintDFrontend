import { useEffect, useState } from "react";
import { Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import successIllustration from "../payment/icon/payment.gif"; // Your image path
import paymentdesktop from "../payment/icon/paymentdesktop.gif"; // Your image path
import "./SuccessPage.css";

export default function SuccessPage() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("successBooking"));
    if (stored) {
      setBooking(stored);
      localStorage.removeItem("successBooking");
    } else {
      navigate("/success"); // fallback if no data
    }
  }, [navigate]);

  if (!booking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="success-page-container">
      <Card className="success-card">
        <div className="success-content">
          {/* Left Section: Booking Details */}
          <div className="details">
            <h2 className="title">Booking Confirmed!</h2>

            {/* Mobile Illustration */}
<div className="mobile-illustration-wrapper">
  <img
    src={successIllustration}
    alt="Success"
    className="mobile-illustration"
  />
</div>


            <p className="subtitle">
              Thank you for your booking. Your payment has been verified successfully.
            </p>

            <div className="booking-details">
              <p><strong>Name:</strong> {booking.name}</p>
              <p><strong>Email:</strong> {booking.email}</p>
              <p><strong>Phone:</strong> {booking.phone}</p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {booking.paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}
              </p>
              <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>
            </div>

            <div className="buttons">
              <Button type="primary" size="large" onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <Button className="mt-2" onClick={() => navigate("/booking-history")}>
                View My Bookings
              </Button>
            </div>
          </div>

          {/* Right Section: Desktop Illustration */}
          <div className="desktop-illustration">
            <img src={successIllustration} alt="Success" />
          </div>
        </div>
      </Card>
    </div>
  );
}
