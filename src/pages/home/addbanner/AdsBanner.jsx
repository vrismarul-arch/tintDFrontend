import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./AdsBanner.css";
import api from "../../../../api";

export default function AdsBanner() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/api/admin/banners");
      const now = new Date();

      const active = res.data.filter((b) => {
        if (!b.isActive) return false;
        if (b.schedule?.startDate && new Date(b.schedule.startDate) > now)
          return false;
        if (b.schedule?.endDate && new Date(b.schedule.endDate) < now)
          return false;
        return true;
      });

      setBanners(active);
    } catch (err) {
      console.error("Error fetching banners", err);
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1, // ✅ Mobile always 1 card
        },
      },
    ],
  };

  return (
    <div className="ads-card-slider">
      <div className="category-header">
        <h2 className="categories-title">Offers & Discounts</h2>
        <hr className="custom-hr" />
      </div>

      <Slider {...settings}>
        {banners.map((banner) => (
          <div
            key={banner._id}
            className="ads-card"
            onClick={() => banner.btnLink && (window.location.href = banner.btnLink)}
            style={{ cursor: banner.btnLink ? "pointer" : "default" }}
          >
            <div
              className="ads-card-img"
              style={{ backgroundImage: `url('${banner.imageUrl}')` }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
