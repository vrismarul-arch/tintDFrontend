import { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(stored);
  };

  useEffect(() => {
    loadCart();
    const handleStorage = (e) => e.key === "cart" && loadCart();
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const updateQuantity = (id, qty) => {
    const updated = cart.map((item) =>
      item._id === id ? { ...item, quantity: Math.max(1, qty) } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeFromCart = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    message.success("Item removed from cart");
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cart.length > 0 ? 5 : 0;
  const total = subtotal + delivery;

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (_, item) => (
        <div className="cart-product">
          <img src={item.imageUrl || "/placeholder.png"} alt={item.name} />
          <div className="cart-product-info">
            <h3>{item.name}</h3>
            <p className="price">₹{item.price}</p>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeFromCart(item._id)}
            >
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
    { title: "Total", render: (_, item) => `₹${item.price * item.quantity}` },
  ];

  return (
    <div className="cart-container">
     <Button
  type="text"
  className="back-btn"
  icon={<ArrowLeftOutlined />}
  onClick={() => navigate("/")}
>
  Continue Shopping
</Button>

      <h2 className="cart-title">🛒 Shopping Cart</h2>

      {cart.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : isMobile ? (
        <div className="cart-cards">
          {cart.map((item) => (
            <div key={item._id} className="cart-card">
              <img src={item.imageUrl || "/placeholder.png"} alt={item.name} />
              <div className="cart-card-info">
                <h3>{item.name}</h3>
                <p>Price: ₹{item.price}</p>
                <p>Total: ₹{item.price * item.quantity}</p>
                <div className="qty-box">
                  <Button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</Button>
                  <span>{item.quantity}</span>
                  <Button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</Button>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeFromCart(item._id)}
                >
                  Remove
                </Button>
              </div>
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
            <Button
              type="primary"
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </Button>
          </div>
        </div>
      ) : (
        <div className="desktop-cart">
          <Table
            dataSource={cart}
            columns={columns}
            rowKey="_id"
            pagination={false}
            className="cart-table"
            scroll={{ x: "max-content" }}
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
            <Button
              type="primary"
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
