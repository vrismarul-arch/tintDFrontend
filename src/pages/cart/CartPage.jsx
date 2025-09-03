import { useEffect, useState } from "react";
import { Table, Button, Input, message } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  useEffect(() => {
    loadCart();
    const handleStorage = (e) => {
      if (e.key === "cart") loadCart();
    };
    window.addEventListener("storage", handleStorage);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const updateQuantity = (id, qty) => {
    let updated = cart.map((item) =>
      item._id === id ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeFromCart = (id) => {
    let updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    message.success("Item removed from cart");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 5;
  const total = subtotal + delivery;

  // =========================
  // ✅ Desktop Table Columns
  // =========================
  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (_, item) => (
        <div className="cart-table-product">
          <img src={item.imageUrl || "/placeholder.png"} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <Button type="link" danger onClick={() => removeFromCart(item._id)}>
              Remove
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      render: (_, item) => (
        <div className="qty-box">
          <Button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</Button>
          <span>{item.quantity}</span>
          <Button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</Button>
        </div>
      ),
    },
    { title: "Price", dataIndex: "price", render: (price) => `₹${price}` },
    {
      title: "Total",
      render: (_, item) => `₹${item.price * item.quantity}`,
    },
  ];

  return (
    <div className="cart-container">
      <h2 className="cart-title">🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : isMobile ? (
        // =========================
        // ✅ Mobile Card Layout
        // =========================
        <div className="cart-mobile">
          {cart.map((item) => (
            <div key={item._id} className="cart-mobile-item">
              <img src={item.imageUrl || "/placeholder.png"} alt={item.name} />
              <div className="cart-mobile-info">
                <h3>{item.name}</h3>
                <p className="cart-mobile-price">₹{item.price}</p>
                <div className="qty-box">
                  <Button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</Button>
                  <span>{item.quantity}</span>
                  <Button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</Button>
                </div>
              </div>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFromCart(item._id)}
              />
            </div>
          ))}



          <div className="cart-summary">
            <div className="summary-row">
              <span>Sub Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹{delivery}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <Button type="primary" block className="checkout-btn">
            Checkout
          </Button>
          <Button type="link" onClick={() => navigate("/category")}>
            ← Continue Shopping
          </Button>
        </div>
      ) : (
        // =========================
        // ✅ Desktop Table Layout
        // =========================
        <div className="cart-desktop">
          <Table
            dataSource={cart}
            columns={columns}
            rowKey="_id"
            pagination={false}
          />

          <div className="cart-summary">
            <div className="summary-row">
              <span>Sub Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹{delivery}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
<Button type="primary" className="checkout-btn" onClick={() => navigate("/checkout")}>
  Checkout
</Button>


          <Button type="link" onClick={() => navigate("/category")}>
            ← Continue Shopping
          </Button>
        </div>
      )}
    </div>
  );
}
