// src/components/pages/CheckoutPage.jsx
import { useEffect, useState } from "react";
import { Form, Input, Button, Card, DatePicker, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import api from "../../../api";
import "./CheckoutPage.css";

const generateTimeSlots = () => {
  const slots = [];
  for (let h = 8; h <= 20; h += 2) {
    const startTime = dayjs().hour(h).minute(0).second(0);
    const endTime = startTime.add(2, "hour");
    slots.push({
      value: startTime.toISOString(),
      label: `${startTime.format("h A")} - ${endTime.format("h A")}`,
    });
  }
  return slots;
};

export default function CheckoutPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [services, setServices] = useState([]);
  const { cart } = useCart();
  const navigate = useNavigate();
  const timeSlots = generateTimeSlots();

  // Fetch service details from backend
  useEffect(() => {
    if (cart.length > 0) {
      const ids = cart.map((i) => i.service._id);
      api
        .post("/api/admin/services/byIds", { ids })
        .then((res) => setServices(res.data))
        .catch(() => toast.error("Failed to fetch service details"));
    }
  }, [cart]);

  // Load profile if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/api/profile", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => form.setFieldsValue(res.data))
        .catch(() => toast("Could not fetch profile", { icon: "⚠️" }));
    }
  }, [form]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => toast("Could not fetch location", { icon: "⚠️" })
      );
    }
  }, []);

  const handleSubmit = (values) => {
    if (!location) return toast.error("Location not available");
    setLoading(true);

    const totalAmount = cart.reduce((sum, item) => {
      const srv = services.find((s) => s._id === item.service._id);
      return sum + (srv?.price || item.service.price || 0) * item.quantity;
    }, 0);

    const payload = {
      ...values,
      location,
      services: cart.map((item) => {
        const srv = services.find((s) => s._id === item.service._id);
        return {
          serviceId: item.service._id,
          name: srv?.name || item.service.name,
          price: srv?.price || item.service.price,
          quantity: item.quantity,
          imageUrl: srv?.imageUrl || "/placeholder.png",
        };
      }),
      totalAmount,
    };

    localStorage.setItem("pendingBooking", JSON.stringify(payload));
    toast.success("Booking details saved! Redirecting to payment…");

    setTimeout(() => {
      setLoading(false);
      navigate("/payment");
    }, 1000);
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
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
    <div className="checkout-wrapper">
      <Card className="checkout-card">
        <h2 className="checkout-title">Checkout</h2>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          onFinishFailed={() => toast.error("Please fill all required fields")}
        >
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
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} placeholder="Enter your address" />
          </Form.Item>
          <Form.Item
            name="selectedDate"
            label="Select Date"
            rules={[{ required: true, message: "Please select a date" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              disabledDate={(d) => d && d < dayjs().startOf("day")}
            />
          </Form.Item>
          <Form.Item
            name="selectedTime"
            label="Select Time Slot"
            rules={[{ required: true, message: "Please select a time slot" }]}
          >
            <Radio.Group className="time-slots">
              {timeSlots.map((slot) => (
                <Radio.Button key={slot.value} value={slot.value}>
                  {slot.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          {location && (
            <p className="location-info">
              📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </p>
          )}
        </Form>
      </Card>

      <Card className="order-summary">
        <h3>Order Summary</h3>
        {cart.map((item) => {
          const srv = services.find((s) => s._id === item.service._id);
          const price = srv?.price || item.service.price;
          return (
            <div key={item.service._id} className="order-item">
              <img
                src={srv?.imageUrl || "/placeholder.png"}
                alt={srv?.name || item.service.name}
              />
              <div>
                <p className="item-name">{srv?.name || item.service.name}</p>
                <p className="item-price">
                  {item.quantity} × ₹{price} = ₹{item.quantity * price}
                </p>
              </div>
            </div>
          );
        })}
        <p className="total">
          Total: ₹
          {cart.reduce(
            (s, i) =>
              s + (services.find((srv) => srv._id === i.service._id)?.price || i.service.price) * i.quantity,
            0
          )}
        </p>
      </Card>

      <div className="sticky-footer">
        <Button
          type="primary"
          block
          shape="round"
          size="large"
          loading={loading}
          onClick={() => form.submit()}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
