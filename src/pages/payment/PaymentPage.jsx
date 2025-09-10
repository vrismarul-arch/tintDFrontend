import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { message, Spin, Button, Card, Radio, Modal } from "antd";

// Import images
import onlinePaymentIcon from "../payment/icon/bank.png";
import codPaymentIcon from "../payment/icon/afterpay.png";

import "./PaymentPage.css";

export default function PaymentPage() {
  const navigate = useNavigate();
  const [pendingBooking, setPendingBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Load pending booking from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pendingBooking"));
    if (!stored) {
      message.error("No booking data found");
      navigate("/checkout");
      return;
    }
    setPendingBooking(stored);
  }, [navigate]);

  // ✅ Clear backend cart
  const clearCartBackend = async () => {
    try {
      await api.delete("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      console.log("Backend cart cleared");
    } catch (err) {
      console.error("Failed to clear backend cart:", err);
    }
  };

  // ✅ Handle online payment
  const handleOnlinePayment = async () => {
    if (!pendingBooking) return;
    setLoading(true);

    try {
      const { data } = await api.post("/api/payment/create-order", {
        ...pendingBooking,
        paymentMethod: "online",
      });

      const { orderId, amount, currency, bookingId } = data;

      const options = {
        key: "rzp_test_RByvKNCLagLArF",
        amount: amount.toString(),
        currency,
        name: "Salon Booking",
        description: "Service Booking Payment",
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/api/payment/verify", {
              ...response,
              bookingId,
            });

            if (verifyRes.data.success) {
              message.success("Payment successful!");

              // Save booking success
              localStorage.setItem(
                "successBooking",
                JSON.stringify({ ...pendingBooking, paymentMethod: "online" })
              );

              // Clear local and backend cart
              localStorage.removeItem("cart");
              localStorage.removeItem("pendingBooking");
              await clearCartBackend();

              navigate("/success");
            } else {
              message.error("Payment verification failed!");
              navigate("/failure");
            }
          } catch (err) {
            console.error("Verify error:", err);
            message.error("Payment verification failed!");
            navigate("/failure");
          }
        },
        prefill: {
          name: pendingBooking.name,
          email: pendingBooking.email,
          contact: pendingBooking.phone,
        },
        theme: { color: "#3399cc" },
      };

      setLoading(false);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Order creation error:", err);
      message.error("Failed to create payment order");
      setLoading(false);
      navigate("/checkout");
    }
  };

  // ✅ Handle COD booking
  const handleCOD = async () => {
    if (!pendingBooking) return;
    setLoading(true);

    try {
      await api.post(
        "/api/bookings",
        { ...pendingBooking, paymentMethod: "cod" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      message.success("Booking placed with Cash on Delivery!");

      // Save booking success
      localStorage.setItem(
        "successBooking",
        JSON.stringify({ ...pendingBooking, paymentMethod: "cod" })
      );

      // Clear local and backend cart
      localStorage.removeItem("cart");
      localStorage.removeItem("pendingBooking");
      await clearCartBackend();

      navigate("/success");
    } catch (err) {
      console.error("COD booking error:", err);
      message.error("Failed to place COD booking");
      navigate("/failure");
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (paymentMethod === "online") handleOnlinePayment();
    else handleCOD();
  };

  // Cancel booking
  const confirmCancel = async () => {
    try {
      setCancelLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.info("Booking cancelled, returning to cart.");
      localStorage.removeItem("pendingBooking");
      navigate("/cart");
    } catch (err) {
      console.error("Cancel error:", err);
      message.error("Failed to cancel booking");
    } finally {
      setCancelLoading(false);
      setShowCancelModal(false);
    }
  };

  if (!pendingBooking)
    return (
      <div className="payment-container">
        <Spin size="large" />
      </div>
    );

  return (
    <>
      <div className="payment-container">
        <Card className="payment-card">
          <h3>Your Details</h3>
          <p><strong>Name:</strong> {pendingBooking.name}</p>
          <p><strong>Email:</strong> {pendingBooking.email}</p>
          <p><strong>Phone:</strong> {pendingBooking.phone}</p>
          <p><strong>Address:</strong> {pendingBooking.address}</p>

          <div className="payment-summary">
            <h3>Order Summary</h3>
            {pendingBooking.services?.map((s, idx) => (
              <div key={idx}>
                <span>{s.name} x {s.quantity}</span>
                <span>₹{s.price * s.quantity}</span>
              </div>
            ))}
            <p className="total">Total: ₹{pendingBooking.totalAmount}</p>
          </div>

          <div className="payment-method">
            <h3>Payment Method</h3>
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
            >
              <Radio value="online">
                <img src={onlinePaymentIcon} alt="Online" style={{ marginRight: 8 }} />
                Online Payment
              </Radio>
              <Radio value="cod">
                <img src={codPaymentIcon} alt="COD" style={{ marginRight: 8 }} />
                Cash on Delivery
              </Radio>
            </Radio.Group>
          </div>

          <div className="payment-buttons">
            <Button onClick={() => setShowCancelModal(true)}>← Go Back to Cart</Button>
            <Button onClick={handleProceed} loading={loading} type="primary">
              Confirm & Proceed with {paymentMethod === "online" ? "Online Payment" : "COD"}
            </Button>
          </div>
        </Card>
      </div>

      <Modal
        title="Cancel Booking?"
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        footer={[
          <Button key="no" onClick={() => setShowCancelModal(false)}>No</Button>,
          <Button key="yes" danger loading={cancelLoading} onClick={confirmCancel}>
            Yes, Cancel
          </Button>,
        ]}
      >
        {cancelLoading ? <Spin size="large" /> : <p>Are you sure you want to cancel this booking?</p>}
      </Modal>
    </>
  );
}
