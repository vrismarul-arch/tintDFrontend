import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./AdsBanner.css";
import api from "../../../../api";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Lucide icons

// Custom Arrow Components
const PrevArrow = ({ className, style, onClick }) => (
  <button
    className={`custom-arrow prev ${className}`}
    style={{ ...style }}
    onClick={onClick}
    aria-label="Previous Slide"
  >
    <ChevronLeft size={28} />
  </button>
);

const NextArrow = ({ className, style, onClick }) => (
  <button
    className={`custom-arrow next ${className}`}
    style={{ ...style }}
    onClick={onClick}
    aria-label="Next Slide"
  >
    <ChevronRight size={28} />
  </button>
);

export default function AdsBanner() {
  const [banners, setBanners] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchBanners();
    
    // Set initial screen size and add a listener for changes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get("/api/admin/banners");
      const now = new Date();
      const activeBanners = res.data.filter((b) => {
        if (!b.isActive) return false;
        if (b.schedule?.startDate && new Date(b.schedule.startDate) > now)
          return false;
        if (b.schedule?.endDate && new Date(b.schedule.endDate) < now)
          return false;
        return true;
      });
      setBanners(activeBanners);
    } catch (err) {
      console.error("Error fetching banners", err);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    autoplay: true,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    appendDots: (dots) => (
      <ul
        style={{
          margin: 0,
          position: "absolute",
          bottom: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        {dots}
      </ul>
    ),
  };

  return (
    <div className="ads-banner-container">
      <Slider {...settings} className="ads-slick-slider">
        {banners.map((banner, i) => {
          // Choose the image based on screen size
          const imageUrl = isMobile && banner.mobileImageUrl 
            ? banner.mobileImageUrl 
            : banner.imageUrl || "/placeholder.png";

          return (
            <div key={i} className="ads-slide">
              <div
                className="ads-slide-bg"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                }}
              >
                
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}