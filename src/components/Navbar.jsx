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
import { Badge, Input } from "antd";
import LocationSearch from "./LocationSearch/LocationSearch";
// Note: You would need to set up a CartContext or remove this dependency
// import { useCart } from "../context/CartContext"; 
import "./Navbar.css";

const { Search } = Input;

const menuData = {
  desktopNav: [],
  mobileNav: [
    { name: "Home", icon: HomeOutlined, link: "/" },
    { name: "Services", icon: GiftOutlined, link: "/services" },
    { name: "Refer", icon: CalendarOutlined, link: "/refer" },
    { name: "Bookings", icon: UserOutlined, link: "/bookings" },
    { name: "Profile", icon: ProfileOutlined, link: "/profile" },
  ],
};

const ResponsiveNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  // const { cart } = useCart(); // Uncomment and set up a CartContext to use this
  const cart = []; // Placeholder if you don't have a CartContext
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const totalCartQuantity = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

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
    // 📱 Mobile Header + Bottom Nav
    return (
      <>
        <div className="mobile-top-bar">
         <Link to="/">
          <img src="/tintD.png" alt="Logo" className="uc-logo-mobile" />
        </Link>
 <Link to="/profile">
          <UserOutlined className="uc-icon" />
        </Link>
        </div>
        <div className="mobile-top-bar">
          <LocationSearch />       

        </div>
        <div className="mobile-top-bar">
                  <Search placeholder="Search for groceries and more" enterButton />

        </div>


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

          <Link to="/cart" className="tab-item">
            <Badge count={totalCartQuantity} size="small" offset={[0, 5]}>
              <ShoppingCartOutlined className="tab-icon" />
            </Badge>
            <span>Cart</span>
          </Link>

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

  // 💻 Desktop Navbar
  return (
    <div className="desktop-navbar">
      <div className="nav-left">
        <Link to="/">
          <img src="/tintD.png" alt="Logo" className="uc-logo" />
        </Link>
      </div>

      <div className="nav-middle">
        <LocationSearch isMobile={isMobile} />
      </div>

      <div className="nav-right">
        <Search placeholder="Search for restaurants and food" enterButton />

        <Link to="/cart">
          <Badge count={totalCartQuantity} size="small" offset={[0, 5]}>
            <ShoppingCartOutlined className="uc-icon" />
          </Badge>
        </Link>

        <Link to="/profile">
          <UserOutlined className="uc-icon" />
        </Link>

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