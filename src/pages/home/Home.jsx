import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import "../../css/Home.css"; // ✅ custom styles

export default function Home() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/admin/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="home-container">
      <h2 className="home-title">Explore Our Categories</h2>

      <div className="category-grid">
        {categories.map((cat) => (
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

      <h2 className="home-title" style={{ marginTop: "3rem" }}>
        Trending Services
      </h2>
    </div>
  );
}
