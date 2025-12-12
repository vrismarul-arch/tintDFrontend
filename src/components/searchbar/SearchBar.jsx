import { useState, useEffect, useRef } from "react";
import api from "../../../api";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  // Auto typing placeholder
  const [placeholder, setPlaceholder] = useState("");
  const words = [
    "Search services, categories, salons...",
    "facial",
    "manicure",
    "pedicure",
    "massage"
  ];

  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Auto typing effect (same as your original logic, cleaned)
  useEffect(() => {
    let wordIndex = 0;
    let charIndex = 0;
    let typing = true;

    const interval = setInterval(() => {
      const currentWord = words[wordIndex];

      if (typing) {
        setPlaceholder(currentWord.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentWord.length) {
          typing = false;
          // pause on full word
          setTimeout(() => {}, 1000);
        }
      } else {
        setPlaceholder(currentWord.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          typing = true;
          wordIndex = (wordIndex + 1) % words.length;
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

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

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/services", { params: { search: query } });
        setServices(res.data || []);
        setShowOverlay(true);
      } catch (err) {
        console.error("Error fetching services:", err);
        // use a simple alert in absence of antd message
        try { /* avoid blocking if message system exists */ } catch {}
        setShowOverlay(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleServiceClick = (service) => {
    if (service.category?._id) {
      navigate(`/category/${service.category._id}`);
    } else {
      navigate(`/service/${service._id}`);
    }
    setShowOverlay(false);
  };

  const clearInput = () => {
    setQuery("");
    setServices([]);
    setShowOverlay(false);
  };

  return (
    <div className="searchbar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden>
          {/* small search SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-4.35-4.35" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="11" cy="11" r="6" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>

        <input
          className="search-input"
          placeholder={placeholder || "Search..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 0 && setShowOverlay(true)}
          aria-label="Search services"
        />

        {query && (
          <button className="clear-btn" onClick={clearInput} aria-label="Clear search">
            ×
          </button>
        )}
      </div>

      {showOverlay && (
        <div className="search-overlay" role="listbox">
          {loading && (
            <div className="overlay-loading">
              <div className="spinner" />
            </div>
          )}

          {!loading && services.length > 0 ? (
            <ul className="search-list">
              {services.map((service) => (
                <li
                  key={service._id}
                  className="search-item"
                  onClick={() => handleServiceClick(service)}
                  role="option"
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
                      <span className="dot">•</span>
                      <span>
                        ₹{(service.price ?? 0).toFixed(2)}
                        {service.originalPrice > service.price && (
                          <span className="strike">₹{service.originalPrice.toFixed(2)}</span>
                        )}
                      </span>
                      <span className="dot">•</span>
                      <span>{service.discount ? `${service.discount}% OFF` : "—"}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <div className="empty-search-results">No services found.</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
