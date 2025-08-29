import { useState } from "react";
import { Card, Button, Radio, message } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../api";

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirmPayment = async () => {
    const pendingBooking = JSON.parse(localStorage.getItem("pendingBooking"));
    if (!pendingBooking) {
      return message.error("No booking found");
    }

    const payload = { ...pendingBooking, paymentMethod };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await api.post("/api/bookings", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      message.success("Booking confirmed & payment method saved!");
      localStorage.removeItem("cart");
      localStorage.removeItem("pendingBooking");
      navigate("/profile");
    } catch (err) {
      message.error(err.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card title="Select Payment Method" className="w-full max-w-md shadow-md">
        <Radio.Group
          onChange={(e) => setPaymentMethod(e.target.value)}
          value={paymentMethod}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <Radio value="cash">Cash</Radio>
          <Radio value="card">Credit/Debit Card</Radio>
          <Radio value="upi">UPI</Radio>
        </Radio.Group>

        <Button
          type="primary"
          block
          className="mt-4"
          loading={loading}
          onClick={handleConfirmPayment}
        >
          Confirm & Book
        </Button>
      </Card>
    </div>
  );
}
