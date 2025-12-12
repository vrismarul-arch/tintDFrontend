import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { ShoppingCartOutlined, HomeOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Badge, message } from "antd";
import LocationSearch from "./LocationSearch/LocationSearch";
import SearchBar from "./searchbar/SearchBar";
import api from "../../api";
import { useCart } from "../context/CartContext";
import "./Navbar.css";

const menuData = {
  mobileNav: [
    { name: "Home", icon: HomeOutlined, link: "/" },
    { name: "Bookings", icon: ProfileOutlined, link: "/booking-history" },
    { name: "Profile", icon: ProfileOutlined, link: "/profile" },
  ],
};

const ResponsiveNavbar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("avatar") || null);
  const [user, setUser] = useState(null);
  const [animateBadge, setAnimateBadge] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { cart, fetchCart, lastUpdated } = useCart();

  const totalCartQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // ----------------- Handle window resize -----------------
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------------- Animate badge on cart update -----------------
  useEffect(() => {
    if (cart.length >= 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 600);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);

  // ----------------- Fetch latest cart on mount (refresh safe) -----------------
  useEffect(() => {
    fetchCart(); // ensures badge is correct even after page refresh or payment success
  }, []);

  // ----------------- Fetch user profile -----------------
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId && localStorage.getItem("token")) {
          const res = await api.get(`/users/${userId}`);
          if (res.data) {
            setUser(res.data);
            if (res.data.avatar) {
              setUserAvatar(res.data.avatar);
              localStorage.setItem("avatar", res.data.avatar);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        message.error("Could not load profile.");
      }
    };
    setIsLoggedIn(!!localStorage.getItem("token"));
    fetchUserProfile();
  }, [location.pathname, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("avatar");
    setIsLoggedIn(false);
    setUser(null);
    setUserAvatar(null);
    navigate("/login");
  };

  const profileMenu = (
    <Menu>
      <Menu.Item key="profile"><Link to="/profile">Profile</Link></Menu.Item>
      <Menu.Item key="bookings"><Link to="/booking-history">My Bookings</Link></Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>Logout</Menu.Item>
    </Menu>
  );

  // ------------------- MOBILE NAVBAR -------------------
  if (isMobile) {
    return (
      <>
        <div className="mobile-top-bar">          
  <div className="mobile-middle-bar">
          <LocationSearch />
          <SearchBar />
        </div>
          {!isLoggedIn ? (
            <Link to="/login">
              <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: "#a066e1" }} />
            </Link>
          ) : (
            <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
              <Avatar size={36} src={userAvatar || undefined} icon={<UserOutlined />} style={{ backgroundColor: "#a066e1", cursor: "pointer" }} />
            </Dropdown>
          )}
        </div>
{/* 
        <div className="mobile-middle-bar">
          <LocationSearch />
          <SearchBar />
        </div> */}

        <div className="mobile-bottom-navbar">
          {menuData.mobileNav.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.link;
            return (
              <Link key={index} to={item.link} className={`tab-item ${isActive ? "active" : ""}`}>
                <Icon className="tab-icon" />
                <span>{item.name}</span>
              </Link>
            );
          })}
          <Link to="/cart" className="tab-item">
            <Badge count={totalCartQuantity} offset={[0, 0]} showZero={false} className={animateBadge ? "badge-pulse" : ""}>
              <ShoppingCartOutlined className="tab-icon" />
            </Badge>
            <span className="cart-label">Cart</span>
          </Link>
        </div>
      </>
    );
  }

  // ------------------- DESKTOP NAVBAR -------------------
  return (
    <div className="desktop-navbar">
      <div className="nav-left"><Link to="/"><img src="/tintD.png" alt="Logo" className="uc-logo" /></Link></div>
      <div className="nav-middle">
        <LocationSearch isMobile={isMobile} />
        <SearchBar />
      </div>
      <div className="nav-right">
        <Link to="/cart" className="nav-link">
          <Badge count={totalCartQuantity} offset={[0, 0]} showZero={false} className={animateBadge ? "badge-pulse" : ""}>
            <ShoppingCartOutlined className="nav-icon" />
          </Badge>
        </Link>

        {!isLoggedIn ? (
          <Link to="/login" className="nav-link">
            <Avatar size={36} icon={<UserOutlined />} style={{ backgroundColor: "#a066e1" }} />
            <span style={{ marginLeft: 6 }}>Sign In</span>
          </Link>
        ) : (
          <Dropdown overlay={profileMenu} trigger={["click"]} placement="bottomRight">
            <div className="nav-link" style={{ cursor: "pointer" }}>
              <Avatar size={36} src={userAvatar || undefined} icon={<UserOutlined />} style={{ backgroundColor: "#a066e1" }} />
              <span style={{ marginLeft: 6 }}>{user?.name || "Profile"}</span>
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default ResponsiveNavbar;
