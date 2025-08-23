// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// ✅ Same backend URL logic as api.js
const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const CartContext = createContext();
const socket = io(backendURL, { withCredentials: true });

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const userId = localStorage.getItem("userId"); // saved after login/register

  useEffect(() => {
    if (!userId) return;

    // Join user's cart room and fetch cart
    socket.emit("joinCart", { userId });
    socket.emit("getCart", { userId });

    // Listen for updates
    socket.on("cartUpdated", (updatedCart) => {
      setCart(updatedCart?.items || []);
    });

    socket.on("cartError", (msg) => {
      console.error("❌ Cart error:", msg);
    });

    return () => {
      socket.off("cartUpdated");
      socket.off("cartError");
    };
  }, [userId]);

  // Cart actions
  const addToCart = (serviceId, quantity = 1) => {
    if (!userId) return alert("Please login first!");
    socket.emit("addToCart", { userId, serviceId, quantity });
  };

  const updateQuantity = (serviceId, quantity) => {
    if (!userId) return;
    socket.emit("updateQuantity", { userId, serviceId, quantity });
  };

  const removeFromCart = (serviceId) => {
    if (!userId) return;
    socket.emit("removeFromCart", { userId, serviceId });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
