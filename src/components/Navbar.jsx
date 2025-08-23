import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ShoppingCartOutlined, UserOutlined, HomeOutlined, GiftOutlined, CalendarOutlined, LogoutOutlined } from "@ant-design/icons";
import LocationSearch from "../components/LocationSearch/LocationSearch";
import { useCart } from "../context/CartContext"; // ✅ cart context
import "./Navbar.css";

const menuData = {
  desktopNav: [],
  mobileNav: [
    { name: "Home", icon: HomeOutlined, link: "/" },
    { name: "Services", icon: GiftOutlined, link: "/services" },
    { name: "Refer", icon: CalendarOutlined, link: "/refer" },
    { name: "Bookings", icon: UserOutlined, link: "/bookings" },
  ],
};

const ResponsiveNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart(); // ✅ get cart
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  if (isMobile) {
    return (
      <>
        <LocationSearch isMobile={isMobile} />
        <div className="mobile-bottom-navbar">
          {menuData.mobileNav.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.link;
            return (
              <Link
                key={index}
                to={item.link}
                className={`tab-item ${isActive ? "active" : ""}`}
              >
                <IconComponent className="tab-icon" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* ✅ Mobile Cart */}
          <Link to="/cart" className="tab-item">
            <div className="cart-icon-wrapper">
              <ShoppingCartOutlined className="tab-icon" />
              {cart.length > 0 && (
                <span className="cart-badge">{cart.length}</span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          {/* ✅ Mobile Logout */}
          {isLoggedIn && (
            <button className="tab-item logout-btn" onClick={handleLogout}>
              <LogoutOutlined className="tab-icon" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <div className="desktop-navbar">
      <div className="nav-left">
        <Link to="/">
          <img src="/tintD.png" alt="Logo" className="uc-logo" />
        </Link>
      </div>

      <div className="nav-middle">
        {menuData.desktopNav.map((item, index) => (
          <a key={index} href={item.link}>
            {item.name}
          </a>
        ))}
      </div>

      <LocationSearch isMobile={isMobile} />

      <div className="nav-right">
        {/* ✅ Desktop Cart */}
        <Link to="/cart" className="cart-icon-wrapper">
          <ShoppingCartOutlined className="uc-icon" />
          {cart.length > 0 && (
            <span className="cart-badge">{cart.length}</span>
          )}
        </Link>

        <UserOutlined className="uc-icon" />

        {/* ✅ Desktop Logout */}
        {isLoggedIn && (
          <button className="logout-btn" onClick={handleLogout}>
            <LogoutOutlined className="uc-icon" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default ResponsiveNavbar;
  