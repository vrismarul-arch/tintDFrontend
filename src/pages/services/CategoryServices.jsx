import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // 💡 Import useLocation
import { Skeleton, Button, Table, Tag } from "antd";
import api from "../../../api";
import "../../css/CategoryServices.css";
import Salonservicesdrawer from "./details/Salonservicesdrawer";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";

export default function CategoryServices() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 💡 Initialize useLocation
  const queryParams = new URLSearchParams(location.search);
  const initialSubCat = queryParams.get("subcat"); // 💡 Get the subcat ID from URL

  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  // 💡 Use the ID from the URL as the initial state
  const [selectedSubCat, setSelectedSubCat] = useState(initialSubCat); 
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const { cart, addToCart, removeFromCart } = useCart();
  const isLoggedIn = !!localStorage.getItem("token");
  const roundPrice = (p) => Number(Number(p).toFixed(2));

  // fetch services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/services?category=${id}`);
        setServices(res.data);

        const subs = [];
        const vars = [];
        res.data.forEach((s) => {
          if (s.subCategory && !subs.find((x) => x._id === s.subCategory._id))
            subs.push(s.subCategory);
          if (s.variety && !vars.find((x) => x._id === s.variety._id))
            vars.push(s.variety);
        });
        setSubCategories(subs);
        setVarieties(vars);
      } catch (err) {
        console.error("❌ Fetch services error:", err);
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 💡 Add an effect to update selectedSubCat if the URL changes (e.g., from another link)
  useEffect(() => {
    const newSubCat = queryParams.get("subcat");
    if (newSubCat !== selectedSubCat) {
      setSelectedSubCat(newSubCat);
    }
  }, [location.search]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddToCartClick = async (service) => {
    if (!isLoggedIn) {
      toast("Please login first", { icon: "🔑" });
      navigate("/login");
      return;
    }
    try {
      await addToCart(service._id);
      toast.success(`${service.name} added to cart`);
    } catch (err) {
      console.error("❌ Add to cart failed:", err);
      toast.error("Could not add to cart");
    }
  };

  const handleRemoveFromCartClick = async (serviceId) => {
    try {
      await removeFromCart(serviceId);
      toast.error("Removed from cart");
    } catch (err) {
      console.error("❌ Remove failed:", err);
      toast.error("Could not remove from cart");
    }
  };

  const isInCart = (serviceId) =>
    cart.some((item) => item.service._id === serviceId);

  // Filter services logic remains the same and correctly uses selectedSubCat
  const filteredServices = services.filter(
    (s) =>
      (!selectedSubCat || s.subCategory?._id === selectedSubCat) &&
      (!selectedVariety || s.variety?._id === selectedVariety)
  );

  const columns = [
    { title: "S.No.", render: (_, __, index) => index + 1, width: 70, align: "center" },
    {
      title: "Service",
      dataIndex: "name",
      width: 270,
      render: (_, record) => (
        <div className="service-cell">
          <img src={record.imageUrl || "/placeholder.png"} alt={record.name} className="service-thumb" />
          <div className="service-info">
            <h3 className="service-name">{record.name}</h3>
            <p className="service-duration">
              {record.duration
                ? `${Math.floor(record.duration / 60)} hr ${record.duration % 60} mins`
                : "N/A"}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 170,
      render: (_, record) => (
        <div className="price-cell">
          <span className="price">₹{roundPrice(record.price)}</span>
          {record.originalPrice > record.price && (
            <span className="old-price">₹{roundPrice(record.originalPrice)}</span>
          )}
        </div>
      ),
    },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (discount) => discount ? <Tag color="green">{discount}% OFF</Tag> : <Tag>—</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="action-buttons">
          {isInCart(record._id) ? (
            <Button danger shape="round" size="small" onClick={() => handleRemoveFromCartClick(record._id)}>
              REMOVE
            </Button>
          ) : (
            <Button type="primary" shape="round" size="small" onClick={() => handleAddToCartClick(record)}>
              ADD
            </Button>
          )}
          <Button
            size="small"
            className="view-btn"
            onClick={() => {
              setSelectedService(record);
              setDrawerOpen(true);
            }}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="category-services">
      {loading ? (
        <Skeleton active />
      ) : (
        <>
          {/* Subcategory Scroll */}
          <div className="subcat-scroll">
            <div
              className={`subcat-card ${!selectedSubCat ? "active" : ""}`}
              onClick={() => {
                setSelectedSubCat(null);
                setSelectedVariety(null);
              }}
            >
              <img src="/tintdfav.svg" alt="All" />
              <p>All</p>
            </div>
            {subCategories.map((sub) => (
              <div
                key={sub._id}
                className={`subcat-card ${selectedSubCat === sub._id ? "active" : ""}`}
                onClick={() => {
                  setSelectedSubCat(sub._id);
                  setSelectedVariety(null);
                }}
              >
                <img src={sub.imageUrl || "/placeholder.png"} alt={sub.name} />
                <p>{sub.name}</p>
              </div>
            ))}
          </div>

          {/* Variety Chips (Keep commented out or uncomment if needed) */}
          {/* {selectedSubCat && varieties.length > 0 && (
            <div className="variety-chips">
              {varieties.map((v) => (
                <button
                  key={v._id}
                  className={`chip ${selectedVariety === v._id ? "active" : ""}`}
                  onClick={() => setSelectedVariety(v._id)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )} */}

          {isMobile ? (
            <div className="mobile-services">
              {filteredServices.map((service) => (
                <div key={service._id} className="mobile-service-card">
                  <img src={service.imageUrl || "/placeholder.png"} alt={service.name} className="mobile-service-img" />
                  <div className="mobile-service-info">
                    <h3>{service.name}</h3>
                    <div className="price-section">
                      <span className="price">₹{roundPrice(service.price)}</span>
                    </div>
                    <div className="mobile-buttons">
                      {isInCart(service._id) ? (
                        <Button danger shape="round" size="small" onClick={() => handleRemoveFromCartClick(service._id)}>
                          REMOVE
                        </Button>
                      ) : (
                        <Button type="primary" shape="round" size="small" onClick={() => handleAddToCartClick(service)}>
                          ADD
                        </Button>
                      )}<Button
                        size="small"
                        className="view-btn"
                        onClick={() => {
                          setSelectedService(service);
                          setDrawerOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table dataSource={filteredServices} columns={columns} rowKey="_id" pagination={false} scroll={{ x: true }} />
          )}

          {drawerOpen && selectedService && (
            <Salonservicesdrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              service={selectedService}
              isMobile={isMobile}
            />
          )}
        </>
      )}
    </div>
  );
}