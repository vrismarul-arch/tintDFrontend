import { useEffect, useState } from "react";
import { Table, Button, message as antdMessage } from "antd";
import { DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import api from "../../../api";
import "./CartPage.css";

export default function CartPage() {
  const { cart, setCart, updateQuantity, removeFromCart } = useCart();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // ✅ Fetch latest cart from backend
  const fetchCart = async (showMessage = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return setCart([]);
      const { data } = await api.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(data?.items || []);
      if (showMessage && data?.success) {
        antdMessage.success(data.message || "Cart updated successfully");
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      antdMessage.error("Could not update cart. Try refreshing.");
      setCart([]);
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-refresh cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Clear cart after successful payment
  useEffect(() => {
    const successBooking = localStorage.getItem("successBooking");
    if (successBooking) {
      localStorage.removeItem("cart");
      localStorage.removeItem("successBooking");
      fetchCart(true); // refresh cart and show success message
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  const delivery = cart.length > 0 ? 5 : 0;
  const total = subtotal ;

  const columns = [
    {
      title: "Product",
      render: (_, item) => (
        <div className="cart-product">
          <img src={item.service.imageUrl || "/placeholder.png"} alt={item.service.name} />
          <div className="cart-product-info">
            <h3>{item.service.name}</h3>
            <p className="price">₹{item.service.price}</p>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={async () => {
                await removeFromCart(item.service._id);
                fetchCart();
              }}
            >
              Remove
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Quantity",
      render: (_, item) => (
        <div className="qty-box">
          <Button
            onClick={async () => {
              await updateQuantity(item.service._id, item.quantity - 1);
              fetchCart();
            }}
            disabled={item.quantity <= 1}
          >
            -
          </Button>
          <span>{item.quantity}</span>
          <Button
            onClick={async () => {
              await updateQuantity(item.service._id, item.quantity + 1);
              fetchCart();
            }}
          >
            +
          </Button>
        </div>
      ),
    },
    { title: "Price", render: (_, item) => `₹${item.service.price}` },
    { title: "Total", render: (_, item) => `₹${item.service.price * item.quantity}` },
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
            <div key={item.service._id} className="cart-card">
              <img src={item.service.imageUrl || "/placeholder.png"} alt={item.service.name} />
              <div className="cart-card-info">
                <h3>{item.service.name}</h3>
                <p>Price: ₹{item.service.price}</p>
                <p>Total: ₹{item.service.price * item.quantity}</p>
                <div className="qty-box">
                  <Button
                    onClick={async () => { await updateQuantity(item.service._id, item.quantity - 1); fetchCart(); }}
                    disabled={item.quantity <= 1}
                  >-</Button>
                  <span>{item.quantity}</span>
                  <Button
                    onClick={async () => { await updateQuantity(item.service._id, item.quantity + 1); fetchCart(); }}
                  >+</Button>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={async () => { await removeFromCart(item.service._id); fetchCart(); }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="cart-summary">
            <div className="summary-row"><span>Sub Total</span><span>₹{subtotal}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
            <Button type="primary" className="checkout-btn" onClick={() => navigate("/checkout")}>
              Checkout
            </Button>
          </div>
        </div>
      ) : (
        <div className="desktop-cart">
          <Table dataSource={cart} columns={columns} rowKey={(item) => item.service._id} pagination={false} />
          <div className="cart-summary">
            <div className="summary-row"><span>Sub Total</span><span>₹{subtotal}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
            <Button type="primary" className="checkout-btn" onClick={() => navigate("/checkout")}>
              Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
