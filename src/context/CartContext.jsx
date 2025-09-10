// src/components/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../../api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now()); // for badge animation

  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data.items || []);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
    }
  };

  const addToCart = async (serviceId) => {
    const res = await api.post("/api/cart/add", { serviceId, quantity: 1 });
    setCart(res.data.items);
    setLastUpdated(Date.now());
  };

  const removeFromCart = async (serviceId) => {
    const res = await api.delete(`/api/cart/${serviceId}`);
    setCart(res.data.items);
    setLastUpdated(Date.now());
  };

  const updateQuantity = async (serviceId, qty) => {
    const res = await api.put(`/api/cart/${serviceId}`, { quantity: qty });
    setCart(res.data.items);
    setLastUpdated(Date.now());
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        lastUpdated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
