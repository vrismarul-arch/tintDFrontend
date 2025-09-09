// src/components/categories/Categories.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api";
import { Skeleton } from "antd";
import toast from "react-hot-toast";
import "./Categories.css";

export default function Categories() {
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
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/category/${catId}`);
    toast.success("Category selected");
  };

  return (
    <div className="categories-container">
      <h2 className="categories-title">Explore Our Categories</h2>

      <div className="category-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="category-card">
                <Skeleton.Image
                  active
                  style={{ width: "100%", height: 150, borderRadius: 8 }}
                />
                <Skeleton
                  active
                  paragraph={false}
                  title={{ width: "80%" }}
                  style={{ marginTop: 10 }}
                />
              </div>
            ))
          : categories.map((cat) => (
              <div
                key={cat._id}
                className="category-card"
                onClick={() => handleCategoryClick(cat._id)}
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
    </div>
  );
}
