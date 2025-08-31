import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton, Button, Table, Tag, message } from "antd";
import api from "../../../api";
import "../../css/CategoryServices.css";
import Salonservicesdrawer from "./details/Salonservicesdrawer";

export default function CategoryServices() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const isLoggedIn = !!localStorage.getItem("token");

  // Helper to round prices
  const roundPrice = (p) => Number(Number(p).toFixed(2));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/services?category=${id}`);
        setServices(res.data);

        const subs = [];
        const vars = [];
        res.data.forEach((s) => {
          if (s.subCategory && !subs.find((x) => x._id === s.subCategory._id)) {
            subs.push(s.subCategory);
          }
          if (s.variety && !vars.find((x) => x._id === s.variety._id)) {
            vars.push(s.variety);
          }
        });
        setSubCategories(subs);
        setVarieties(vars);

        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartItems(savedCart);
      } catch (err) {
        console.error("❌ Fetch services error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddToCart = (service) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    let updatedCart = [...cartItems];
    const existing = updatedCart.find((item) => item._id === service._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      updatedCart.push({ ...service, quantity: 1 });
    }
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    message.success(`${service.name} added to cart`);
  };

  const handleRemoveFromCart = (serviceId) => {
    const updatedCart = cartItems.filter((item) => item._id !== serviceId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    message.warning(`Removed from cart`);
  };

  const isInCart = (serviceId) => cartItems.some((item) => item._id === serviceId);

  const filteredServices = services.filter((s) => {
    return (
      (!selectedSubCat || s.subCategory?._id === selectedSubCat) &&
      (!selectedVariety || s.variety?._id === selectedVariety)
    );
  });

  const columns = [
    { title: "S.No.", render: (_, __, index) => index + 1, width: 70, align: "center" },
    {
      title: "Service",
      dataIndex: "name",
      width: 270,
      render: (_, record) => (
        <div className="service-cell">
          <img
            src={record.imageUrl || "/placeholder.png"}
            alt={record.name}
            className="service-thumb"
          />
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
      render: (discount) =>
        discount ? (
          <Tag color="green" className="discount-tag">
            {discount}% OFF
          </Tag>
        ) : (
          <Tag color="default">—</Tag>
        ),
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="action-buttons">
          {isInCart(record._id) ? (
            <Button
              danger
              shape="round"
              size="small"
              onClick={() => handleRemoveFromCart(record._id)}
            >
              REMOVE
            </Button>
          ) : (
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => handleAddToCart(record)}
            >
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
          {/* Subcategories Scroll */}
          <div className="subcat-scroll">
            <div
              className={`subcat-card ${!selectedSubCat ? "active" : ""}`}
              onClick={() => {
                setSelectedSubCat(null);
                setSelectedVariety(null);
              }}
            >
              <img src="/tintD.png" alt="All" width="120px" />
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

          {/* Varieties Filter Chips */}
          {selectedSubCat && varieties.length > 0 && (
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
          )}

          {/* Services List */}
          {isMobile ? (
            <div className="mobile-services">
              {filteredServices.map((service) => (
                <div key={service._id} className="mobile-service-card">
                  <img
                    src={service.imageUrl || "/placeholder.png"}
                    alt={service.name}
                    className="mobile-service-img"
                  />
                  <div className="mobile-service-info">
                    <h3>{service.name}</h3>
                    <p>
                      {service.duration
                        ? `${Math.floor(service.duration / 60)} hr ${service.duration % 60} mins`
                        : "N/A"}
                    </p>
                    <div className="price-section">
                      <span className="price">₹{roundPrice(service.price)}</span>
                      {service.originalPrice > service.price && (
                        <span className="old-price">₹{roundPrice(service.originalPrice)}</span>
                      )}
                    </div>
                    <div className="mobile-buttons">
                      {isInCart(service._id) ? (
                        <Button
                          danger
                          shape="round"
                          size="small"
                          onClick={() => handleRemoveFromCart(service._id)}
                        >
                          REMOVE
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          shape="round"
                          size="small"
                          onClick={() => handleAddToCart(service)}
                        >
                          ADD
                        </Button>
                      )}
                      <Button
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
            <Table
              dataSource={filteredServices}
              columns={columns}
              rowKey="_id"
              pagination={false}
              scroll={{ x: true }}
            />
          )}

          {drawerOpen && selectedService && (
            <Salonservicesdrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              service={selectedService}
            />
          )}
        </>
      )}
    </div>
  );
}
