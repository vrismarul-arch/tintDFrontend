import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spin, Button, Table, Tag } from "antd";
import api from "../../../api";
import "../../css/CategoryServices.css";

export default function CategoryServices() {
  const { id } = useParams();
  const [services, setServices] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/api/admin/services?category=${id}`);
        const servicesData = res.data;

        setServices(servicesData);

        // ✅ Extract unique SubCategories
        const subCatMap = new Map();
        servicesData.forEach((s) => {
          if (s.subCategory && !subCatMap.has(s.subCategory._id)) {
            subCatMap.set(s.subCategory._id, s.subCategory);
          }
        });

        setSubCategories(Array.from(subCatMap.values()));
      } catch (err) {
        console.error("❌ Fetch services error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ✅ Update varieties when subcategory changes
  useEffect(() => {
    if (selectedSubCat) {
      const filteredServices = services.filter(
        (s) => s.subCategory?._id === selectedSubCat
      );

      const varietyMap = new Map();
      filteredServices.forEach((s) => {
        if (s.variety && !varietyMap.has(s.variety._id)) {
          varietyMap.set(s.variety._id, s.variety);
        }
      });

      setVarieties(Array.from(varietyMap.values()));
      setSelectedVariety(null);
    } else {
      setVarieties([]);
      setSelectedVariety(null);
    }
  }, [selectedSubCat, services]);

  // ✅ Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) return <Spin className="m-10" />;

  // ✅ Filter services
  const filteredServices = services.filter((s) => {
    return (
      (!selectedSubCat || s.subCategory?._id === selectedSubCat) &&
      (!selectedVariety || s.variety?._id === selectedVariety)
    );
  });

  // ✅ Table columns for desktop
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
          <span className="price">₹{record.price}</span>
          {record.originalPrice > record.price && (
            <span className="old-price">₹{record.originalPrice}</span>
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
      render: () => (
        <div className="action-buttons">
          <Button type="primary" shape="round" size="small" className="add-btn">
            ADD
          </Button>
          <Button size="small" className="view-btn">
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="services-container">
      <h1 className="page-title">Services</h1>

      {/* ✅ SubCategories Row */}
      <div className="subcat-scroll">
        {/* 🔹 All Tab */}
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

        {/* 🔹 SubCategories */}
        {subCategories.map((sub) => (
          <div
            key={sub._id}
            className={`subcat-card ${selectedSubCat === sub._id ? "active" : ""}`}
            onClick={() => setSelectedSubCat(sub._id)}
          >
            <img src={sub.imageUrl || "/placeholder.png"} alt={sub.name} />
            <p>{sub.name}</p>
          </div>
        ))}
      </div>

      {/* ✅ Varieties Chips */}
      {selectedSubCat && (
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

      {/* ✅ Desktop → Table */}
      {!isMobile && (
        <Table
          dataSource={filteredServices}
          rowKey="_id"
          columns={columns}
          pagination={false}
          bordered={false}
          className="services-table"
        />
      )}

      {/* ✅ Mobile → Cards */}
      {isMobile && (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service._id} className="service-card">
              <img
                src={service.imageUrl || "/placeholder.png"}
                alt={service.name}
                className="service-card-img"
              />
              <div className="service-card-body">
                <h3 className="service-card-title">{service.name}</h3>
                <p className="service-card-duration">
                  {service.duration
                    ? `${Math.floor(service.duration / 60)} hr ${service.duration % 60} mins`
                    : "N/A"}
                </p>
                <div className="service-card-price">
                  <span className="price">₹{service.price}</span>
                  {service.originalPrice > service.price && (
                    <span className="old-price">₹{service.originalPrice}</span>
                  )}
                </div>
                {service.discount ? (
                  <Tag color="green" className="discount-tag">
                    {service.discount}% OFF
                  </Tag>
                ) : null}
                <div className="service-card-actions">
                  <Button type="primary" size="small" className="add-btn">
                    ADD
                  </Button>
                  <Button size="small" className="view-btn">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
