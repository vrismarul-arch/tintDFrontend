import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Grid, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/grid";
import "swiper/css/navigation";
import api from "../../../../api";
import { Skeleton } from "antd";
import "./TrendingServices.css";

export default function TrendingServices() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // ✅ Directly get all subcategories (or categories if you prefer)
        const subRes = await api.get("/api/admin/subcategories");
        setTrending(subRes.data || []);
      } catch (err) {
        console.error("❌ Error fetching trending services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="trending-container">
      <div className="category-header">
        <h2 className="home-title" style={{ marginTop: "3rem", textAlign: "left" }}>Saloon At Home For Women</h2>
        <hr className="custom-hr" />
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton-card">
              <Skeleton.Image
                active
                style={{ width: "100%", height: 100, borderRadius: 8 }}
              />
              <Skeleton
                active
                paragraph={false}
                title={{ width: "80%" }}
                style={{ marginTop: 10 }}
              />
            </div>
          ))}
        </div>
      ) : trending.length > 0 ? (
        <Swiper
          modules={[Pagination, Grid, Navigation, Autoplay]}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={15}
          loop={true}
          breakpoints={{
            0: {
              slidesPerView: 3,
              grid: { rows: 2, fill: "row" },
            },
            768: {
              slidesPerView: 4,
              grid: { rows: 1 },
            },
          }}
        >
          {trending.map((item) => (
            <SwiperSlide key={item._id}>
              <div
                className="trending-card"
                // 💡 CORRECTION: Pass the subcategory ID as a query parameter
                // This assumes `item.category?._id` is the Category ID and `item._id` is the Subcategory ID.
                onClick={() => navigate(`/category/${item.category?._id}?subcat=${item._id}`)}
              >
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name}
                  className="trending-card-img"
                />
                <div className="trending-card-overlay">{item.name}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p>No trending services found</p>
      )}
    </div>
  );
}