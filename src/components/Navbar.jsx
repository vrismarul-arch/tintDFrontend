import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCartOutlined,
  UserOutlined,
  HomeOutlined,
  GiftOutlined,
  CalendarOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { Badge } from "antd";
import LocationSearch from "../components/LocationSearch/LocationSearch";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const menuData = {
  desktopNav: [],
  mobileNav: [
    { name: "Home", icon: HomeOutlined, link: "/" },
    { name: "Services", icon: GiftOutlined, link: "/services" },
    { name: "Refer", icon: CalendarOutlined, link: "/refer" },
    { name: "Bookings", icon: UserOutlined, link: "/bookings" },
    { name: "Profile", icon: ProfileOutlined, link: "/profile" }, // ✅ Added Profile
  ],
};

const ResponsiveNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const totalCartQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
            <Badge count={totalCartQuantity} size="small" offset={[0, 5]}>
              <ShoppingCartOutlined className="tab-icon" />
            </Badge>
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
        <Link to="/cart">
          <Badge count={totalCartQuantity} size="small" offset={[0, 5]}>
            <ShoppingCartOutlined className="uc-icon" />
          </Badge>
        </Link>

        {/* ✅ Desktop Profile */}
        <Link to="/profile">
          <UserOutlined className="uc-icon" />
        </Link>

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
  