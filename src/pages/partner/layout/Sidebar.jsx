import { Layout, Avatar, Menu, Spin, Tag } from "antd";
import {
  WalletOutlined,
  DollarOutlined,
  GiftOutlined,
  AppstoreOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../../api"; // your API
import "./Sidebar.css";

const { Sider } = Layout;

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth(); // auth context

  const [selectedKey, setSelectedKey] = useState(location.pathname);
  const [dynamicData, setDynamicData] = useState(null); // fetched data
  const [fetching, setFetching] = useState(false);

  // Sync selected menu with URL
  useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location.pathname]);

  // Fetch dynamic data only if user is logged in
  useEffect(() => {
    if (!user) return; // do nothing if not logged in

    const fetchData = async () => {
      try {
        setFetching(true);
        // Fetch partner dashboard or menu data
        const { data } = await api.get(`/api/partners/${user.id}/dashboard`);
        setDynamicData(data);

        // Optionally store in localStorage to persist on reload
        localStorage.setItem("partnerData", JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch partner data", err);
      } finally {
        setFetching(false);
      }
    };

    // Try to load from localStorage first
    const cached = localStorage.getItem("partnerData");
    if (cached) {
      setDynamicData(JSON.parse(cached));
    } else {
      fetchData();
    }
  }, [user]);

  // Show nothing if loading or not logged in
  if (loading || !user) return null;

  const menuItems = [
    {
      key: "/partner/history",
      icon: <WalletOutlined />,
      label: (
        <div className="menu-item">
          <span className="menu-title">Booking History</span>
          <span className="menu-description">
            {dynamicData?.bookingHistory ? `$${dynamicData.bookingHistory}` : "View your booking history"}
          </span>
        </div>
      ),
    },
    {
      key: "/partner/incentives",
      icon: <DollarOutlined />,
      label: (
        <div className="menu-item">
          <span className="menu-title">Incentives</span>
          <span className="menu-description">
            {dynamicData?.incentives || "Know how you get paid"}
          </span>
        </div>
      ),
    },
    {
      key: "/partner/rewards",
      icon: <GiftOutlined />,
      label: (
        <div className="menu-item">
          <span className="menu-title">Rewards</span>
          <span className="menu-description">
            {dynamicData?.rewards || "Insurance and Discounts"}
          </span>
        </div>
      ),
    },
    // Add other menu items as needed
  ];

  return (
    <Sider width={280} collapsible collapsed={collapsed} trigger={null} className="sidebar">
      {/* Profile Section */}
      <div
        className="profile-section cursor-pointer"
        onClick={() => {
          navigate("/partner/profile");
          setSelectedKey("/partner/profile");
        }}
      >
        {fetching ? (
          <Spin size="small" />
        ) : (
          <>
            <Avatar size={64} src={user?.avatar || "/tintD.png"} />
            <div className="profile-name">{user?.name || "Guest User"}</div>
            {user && (
              <div className="profile-status">
                <Tag
                  color={
                    user?.status === "approved"
                      ? "green"
                      : user?.status === "rejected"
                      ? "red"
                      : "orange"
                  }
                >
                  {user?.status?.toUpperCase() || "PENDING"}
                </Tag>
              </div>
            )}
          </>
        )}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => {
          setSelectedKey(key);
          navigate(key);
        }}
        items={menuItems}
        className="menu"
      />
    </Sider>
  );
}
