// src/components/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const getToken = () => localStorage.getItem("token");

  // Helper to update cart state + lastUpdated
  const setCartState = (items) => {
    setCart(items);
    setLastUpdated(Date.now());
    if (!getToken()) localStorage.setItem("cart", JSON.stringify(items));
  };

  // Fetch cart from backend or localStorage
  const fetchCart = async () => {
    try {
      const token = getToken();
      if (token) {
        const res = await api.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartState(res.data.items || []);
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartState(localCart);
      }
    } catch (err) {
      console.error("❌ Fetch cart failed:", err);
      toast.error("Unable to fetch cart");
    }
  };

  // Add to cart
  const addToCart = async (serviceId, quantity = 1) => {
    try {
      const token = getToken();
      if (token) {
        const res = await api.post(
          "/api/cart/add",
          { serviceId, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartState(res.data.items || []);
        toast.success("Added to cart!");
      } else {
        const existing = cart.find((i) => i.service._id === serviceId);
        let updatedCart;
        if (existing) {
          updatedCart = cart.map((i) =>
            i.service._id === serviceId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          updatedCart = [...cart, { service: { _id: serviceId }, quantity }];
        }
        setCartState(updatedCart);
        toast.success("Added to cart!");
      }
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
      toast.error("Could not add to cart");
    }
  };

  // Remove from cart
  const removeFromCart = async (serviceId) => {
    try {
      const token = getToken();
      if (token) {
        const res = await api.delete(`/api/cart/${serviceId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartState(res.data.items || []);
      } else {
        setCartState(cart.filter((i) => i.service._id !== serviceId));
      }
      toast.success("Removed from cart");
    } catch (err) {
      console.error("❌ Remove from cart failed:", err);
      toast.error("Could not remove item");
    }
  };

  // Update quantity
  const updateQuantity = async (serviceId, qty) => {
    if (qty < 1) return;
    try {
      const token = getToken();
      if (token) {
        const res = await api.put(
          `/api/cart/${serviceId}`,
          { quantity: qty },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCartState(res.data.items || []);
      } else {
        setCartState(
          cart.map((i) =>
            i.service._id === serviceId ? { ...i, quantity: qty } : i
          )
        );
      }
    } catch (err) {
      console.error("❌ Update quantity failed:", err);
      toast.error("Could not update quantity");
    }
  };

  // ✅ Clear the entire cart
  const clearCart = async () => {
    try {
      const token = getToken();
      if (token) {
        const res = await api.delete("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartState([]);
        toast.success(res.data?.message || "Cart cleared successfully");
      } else {
        setCartState([]);
        localStorage.removeItem("cart");
        toast.success("Cart cleared successfully");
      }
    } catch (err) {
      console.error("❌ Clear cart failed:", err);
      toast.error("Could not clear cart");
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart, // ✅ expose clearCart
        lastUpdated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
