import { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, DatePicker, TimePicker } from "antd";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import dayjs from "dayjs";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [cart, setCart] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  // ✅ Load cart + service details
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);

    if (storedCart.length > 0) {
      const ids = storedCart.map((i) => i._id);
      api
        .post("/api/admin/services/byIds", { ids })
        .then((res) => setServices(res.data))
        .catch(() => message.error("Failed to fetch service details"));
    }
  }, []);

  // ✅ Fetch logged-in user profile & pre-fill form
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const { name, email, phone, address } = res.data;
          form.setFieldsValue({ name, email, phone, address });
        })
        .catch(() => {
          message.warning("Could not fetch profile details");
        });
    }
  }, [form]);

  // ✅ Fetch location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () =>
          message.warning("Could not fetch location. Please enter manually.")
      );
    }
  }, []);

  // ✅ Go to payment page after validating form
  const handleSubmit = (values) => {
    if (!location) return message.error("Location not available");

    const totalAmount = cart.reduce((sum, item) => {
      const srv = services.find((s) => s._id === item._id);
      const price = srv?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);

    const payload = {
      ...values,
      location,
      services: cart.map((item) => ({
        serviceId: item._id,
        quantity: item.quantity,
      })),
      totalAmount,
    };

    // Save booking data temporarily in localStorage
    localStorage.setItem("pendingBooking", JSON.stringify(payload));

    // Redirect to Payment Page
    navigate("/payment");
  };

  if (cart.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>
          Your cart is empty.{" "}
          <Button type="link" onClick={() => navigate("/category")}>
            Go Shopping
          </Button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card title="Checkout" className="w-full max-w-md shadow-md">
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          {/* User Info */}
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
            <Input placeholder="Enter your phone number" />
          </Form.Item>
          <Form.Item name="address" label="Address" rules={[{ required: true }]}>
            <Input.TextArea placeholder="Enter your address" rows={3} />
          </Form.Item>

          {/* Date + Time Slot */}
          <Form.Item
            name="selectedDate"
            label="Select Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Form.Item>
          <Form.Item
            name="selectedTime"
            label="Select Time"
            rules={[{ required: true, message: "Please select a time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="hh:mm A" use12Hours />
          </Form.Item>

          {location && (
            <p className="text-green-600 text-sm mb-2">
              Location fetched: Lat {location.lat.toFixed(4)}, Lng{" "}
              {location.lng.toFixed(4)}
            </p>
          )}

          {/* Order Summary */}
          <h4 className="font-semibold mt-4">Order Summary:</h4>
          {cart.map((item) => {
            const srv = services.find((s) => s._id === item._id);
            const price = srv?.price || item.price || 0;
            const name = srv?.name || item.name || "Service";
            const img = srv?.imageUrl || "/placeholder.png";
            return (
              <div key={item._id} className="order-summary-item">
                <img src={img} alt={name} />
                <span>
                  {name} x {item.quantity} = ₹{price * item.quantity}
                </span>
              </div>
            );
          })}
          <p className="font-bold mt-2">
            Total: ₹
            {cart.reduce((sum, item) => {
              const srv = services.find((s) => s._id === item._id);
              const price = srv?.price || item.price || 0;
              return sum + price * item.quantity;
            }, 0)}
          </p>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Proceed to Payment
          </Button>
        </Form>
      </Card>
    </div>
  );
}
