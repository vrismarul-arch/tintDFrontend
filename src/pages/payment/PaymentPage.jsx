import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import { message, Spin, Button, Card, Radio, Modal } from "antd";

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

  // 🟢 Online Payment
  const handleOnlinePayment = () => {
    if (!pendingBooking) return;

    setLoading(true);
    api
      .post("/api/payment/create-order", {
        amount: pendingBooking.totalAmount,
        bookingData: pendingBooking,
      })
      .then((res) => {
        const { orderId, amount, currency } = res.data;

        const options = {
          key: "rzp_test_RByvKNCLagLArF",
          amount: amount.toString(),
          currency,
          name: "Salon Booking",
          description: "Service Booking Payment",
          order_id: orderId,
          handler: async function (response) {
            try {
              const verifyRes = await api.post("/api/payment/verify", {
                ...response,
                bookingData: pendingBooking,
              });

              if (verifyRes.data.success) {
                message.success("Payment successful!");
                localStorage.removeItem("cart");
                localStorage.removeItem("pendingBooking");
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
      })
      .catch((err) => {
        console.error("Order creation error:", err);
        message.error("Failed to create payment order");
        setLoading(false);
        navigate("/checkout");
      });
  };

  // 🟢 COD
  const handleCOD = async () => {
    if (!pendingBooking) return;
    try {
      setLoading(true);
      await api.post(
        "/api/bookings",
        { ...pendingBooking, paymentMethod: "cod" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      message.success("Booking placed with Cash on Delivery!");
      localStorage.removeItem("cart");
      localStorage.removeItem("pendingBooking");
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
    if (paymentMethod === "online") {
      handleOnlinePayment();
    } else {
      handleCOD();
    }
  };

  // 🟢 Handle Cancel Modal confirm
  const confirmCancel = async () => {
    try {
      setCancelLoading(true);
      // backend cancel call optional
      await new Promise((resolve) => setTimeout(resolve, 1500)); // mock delay
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

  if (!pendingBooking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin /> <span className="ml-2">Loading booking...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-4">
        <Card title="Review & Confirm" className="w-full max-w-lg shadow-md">
          {/* ✅ User Details */}
          <h3 className="font-semibold mb-2">Your Details</h3>
          <p><strong>Name:</strong> {pendingBooking.name}</p>
          <p><strong>Email:</strong> {pendingBooking.email}</p>
          <p><strong>Phone:</strong> {pendingBooking.phone}</p>
          <p><strong>Address:</strong> {pendingBooking.address}</p>

          <hr className="my-3" />

          {/* ✅ Order Summary */}
          <h3 className="font-semibold mb-2">Order Summary</h3>
          {pendingBooking.services?.map((s, idx) => (
            <div key={idx} className="flex justify-between border-b py-1">
              <span>{s.name} x {s.quantity}</span>
              <span>₹{s.price * s.quantity}</span>
            </div>
          ))}
          <p className="font-bold mt-2">Total: ₹{pendingBooking.totalAmount}</p>

          <hr className="my-3" />

          {/* ✅ Payment Method */}
          <h3 className="font-semibold mb-2">Payment Method</h3>
          <Radio.Group
            onChange={(e) => setPaymentMethod(e.target.value)}
            value={paymentMethod}
            className="mb-4"
          >
            <Radio value="online">💳 Online Payment</Radio>
            <Radio value="cod">🚚 Cash on Delivery</Radio>
          </Radio.Group>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button danger onClick={() => setShowCancelModal(true)} block>
              ← Go Back to Cart
            </Button>
            <Button type="primary" onClick={handleProceed} loading={loading} block>
              Confirm & Proceed with{" "}
              {paymentMethod === "online" ? "Online Payment" : "COD"}
            </Button>
          </div>
        </Card>
      </div>

      {/* ✅ Cancel Confirmation Modal */}
      <Modal
        title="Cancel Booking?"
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        footer={[
          <Button key="no" onClick={() => setShowCancelModal(false)}>
            No
          </Button>,
          <Button
            key="yes"
            danger
            loading={cancelLoading}
            onClick={confirmCancel}
          >
            Yes, Cancel
          </Button>,
        ]}
      >
        {cancelLoading ? (
          <div className="flex justify-center items-center py-6">
            <Spin size="large" />
          </div>
        ) : (
          <p>
            Are you sure you want to cancel this booking and return to your cart?
          </p>
        )}
      </Modal>
    </>
  );
}
