import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import "../../css/Home.css";
import TrendingServices from "../services/trendind/trendingservices";
import Adsbanner from "../home/addbanner/AdsBanner";
import { Skeleton } from "antd";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/admin/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="home-container">
      <h2 className="home-title">Explore Our Categories</h2>

      <div className="category-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="category-card">
                <Skeleton.Image active style={{ width: "100%", height: 150, borderRadius: 8 }} />
                <Skeleton active paragraph={false} title={{ width: "80%" }} style={{ marginTop: 10 }} />
              </div>
            ))
          : categories.map((cat) => (
              <div
                key={cat._id}
                className="category-card"
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                <img
                  src={cat.imageUrl || "/placeholder.png"}
                  alt={cat.name}
                  onError={(e) => (e.target.src = "/placeholder.png")}
                />
                <div className="category-info">
                  <h3>{cat.name}</h3>
                  <span className="category-badge">New</span>
                </div>
              </div>
            ))}
      </div>

      <h2 className="home-title" style={{ marginTop: "3rem" }}>Trending Services</h2>
      {loading ? <Skeleton active paragraph={{ rows: 3 }} /> : <TrendingServices />}

      <div className="addbanner" style={{ marginTop: "2rem" }}>
        {loading ? <Skeleton.Image active style={{ width: "100%", height: 150, borderRadius: 8 }} /> : <Adsbanner />}
      </div>
    </div>
  );
}
