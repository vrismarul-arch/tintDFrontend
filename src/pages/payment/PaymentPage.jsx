import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { message, Spin, Button, Card, Radio, Modal } from "antd";
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

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("pendingBooking"));
    if (!stored) {
      message.error("No booking data found");
      navigate("/checkout");
      return;
    }
    setPendingBooking(stored);
  }, [navigate]);

  const clearCartBackend = async () => {
    try {
      await api.delete("/api/cart", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    } catch (err) {
      console.error("Failed to clear backend cart:", err);
    }
  };

  const handleOnlinePayment = async () => {
    if (!pendingBooking) return;
    setLoading(true);

    try {
      const { data } = await api.post("/api/payment/create-order", {
        totalAmount: pendingBooking.totalAmount,
      });

      const { orderId, amount, currency } = data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_RByvKNCLagLArF",
        amount: amount.toString(),
        currency,
        name: "Tintd",
        description: "Service Booking Payment",
        order_id: orderId,

        handler: async (response) => {
          try {
            const verifyRes = await api.post("/api/payment/verify", {
              ...response,
              bookingData: pendingBooking,
            });

            if (verifyRes.data.success) {
              message.success("Payment successful!");

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

        theme: { color: "#7A3EEB" },
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

      localStorage.setItem(
        "successBooking",
        JSON.stringify({ ...pendingBooking, paymentMethod: "cod" })
      );

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

  const confirmCancel = async () => {
    try {
      setCancelLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.info("Booking cancelled");
      localStorage.removeItem("pendingBooking");
      navigate("/cart");
    } finally {
      setCancelLoading(false);
      setShowCancelModal(false);
    }
  };

  if (!pendingBooking)
    return (
      <div className="payment-page-loader">
        <Spin size="large" />
      </div>
    );

  return (
    <>
      <div className="payment-page-wrapper">

        {/* LEFT SECTION */}
        <div className="payment-left">

          <Card className="section-card">
            <h3>Your Details</h3>
            <p><strong>Name:</strong> {pendingBooking.name}</p>
            <p><strong>Email:</strong> {pendingBooking.email}</p>
            <p><strong>Phone:</strong> {pendingBooking.phone}</p>
            <p><strong>Address:</strong> {pendingBooking.address}</p>
          </Card>

          <Card className="section-card">
            <h3>Order Summary</h3>

            {pendingBooking.services?.map((s, idx) => (
              <div key={idx} className="order-item">
                <img src={s.imageUrl} alt={s.name} className="service-image" />

                <div className="order-info">
                  <h4>{s.name}</h4>
                  <p>Qty: {s.quantity}</p>
                </div>

                <span className="order-price">₹{s.price * s.quantity}</span>
              </div>
            ))}

            <p className="total-amount">
              Total <span>₹{pendingBooking.totalAmount}</span>
            </p>
          </Card>

        </div>

        {/* RIGHT SECTION */}
        <div className="payment-right">
          <Card className="section-card">
            <h3>Payment Method</h3>

            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="payment-radio-group"
            >
              <Radio value="online" className="payment-option">
                <img src={onlinePaymentIcon} alt="Online" /><br />
                Online Payment
              </Radio>

              <Radio value="cod" className="payment-option">
                <img src={codPaymentIcon} alt="COD" />
                Cash on Delivery
              </Radio>
            </Radio.Group>

            <Button
              type="primary"
              block
              className="proceed-btn"
              loading={loading}
              onClick={handleProceed}
            >
              Proceed with {paymentMethod === "online" ? "Online Payment" : "Cash on Delivery"}
            </Button>

            <Button block className="cancel-btn" onClick={() => setShowCancelModal(true)}>
              ← Cancel & Go Back
            </Button>
          </Card>
        </div>

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
        {cancelLoading ? <Spin size="large" /> : <p>Are you sure?</p>}
      </Modal>
    </>
  );
}
