import { useState, useEffect, useRef } from "react";
import { Input, List, Spin, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close overlay on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch services with debounce
  useEffect(() => {
    if (!query.trim()) {
      setServices([]);
      setShowOverlay(false);
      return;
    }

    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/services", { params: { search: query } });
        setServices(res.data);
        setShowOverlay(true);
      } catch (err) {
        console.error("Error fetching services:", err);
        message.error("Failed to fetch services.");
        setShowOverlay(false);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => fetchServices(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Correct navigation function
  const handleServiceClick = (service) => {
    if (service.category?._id) {
      navigate(`/category/${service.category._id}`); // go to category page
    } else {
      navigate(`/service/${service._id}`); // fallback: direct service page
    }
    setShowOverlay(false);
  };

  return (
    <div className="searchbar-container" ref={searchRef}>
      <Input
        placeholder="Search services, categories, salons..."
        prefix={<SearchOutlined style={{ color: "#a066e1" }} />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length > 0 && setShowOverlay(true)}
        allowClear
      />

      {showOverlay && (
        <div className="search-overlay">
          {loading && <Spin className="search-spin" />}
          {!loading && services.length > 0 ? (
            <List
              dataSource={services}
              renderItem={(service) => (
                <List.Item
                  className="search-item"
                  onClick={() => handleServiceClick(service)}
                >
                  <img
                    src={service.imageUrl || "/placeholder.png"}
                    alt={service.name}
                    className="search-item-image"
                  />
                  <div className="search-item-details">
                    <div className="search-item-name">{service.name}</div>
                    <div className="search-item-info">
                      <span>
                        Duration:{" "}
                        {service.duration
                          ? `${Math.floor(service.duration / 60)} hr ${service.duration % 60} mins`
                          : "N/A"}
                      </span>
                      <span style={{ margin: "0 6px" }}>•</span>
                      <span>
                        ₹{service.price.toFixed(2)}
                        {service.originalPrice > service.price && (
                          <span style={{ textDecoration: "line-through", marginLeft: 4 }}>
                            ₹{service.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </span>
                      <span style={{ margin: "0 6px" }}>•</span>
                      <span>{service.discount ? `${service.discount}% OFF` : "—"}</span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : !loading ? (
            <div className="empty-search-results">No services found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
