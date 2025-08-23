import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Grid, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/grid";
import "swiper/css/navigation";
import api from "../../../../api";
import "./TrendingServices.css";

export default function TrendingServices() {
  const [trending, setTrending] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const categoryRes = await api.get("/api/admin/categories");
        const salonCategory = categoryRes.data.find(
          (cat) => cat.name === "Salon At Home"
        );

        if (!salonCategory) {
          console.warn("⚠️ 'Salon At Home' category not found");
          return;
        }

        const subRes = await api.get(
          `/api/admin/subcategories?category=${salonCategory._id}`
        );

        setTrending(subRes.data);
      } catch (err) {
        console.error("❌ Error fetching trending services:", err);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="trending-container">
      {trending.length > 0 ? (
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
                onClick={() => navigate(`/category/${item.category?._id}`)}
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
        <p>Loading services...</p>
      )}
    </div>
  );
}
