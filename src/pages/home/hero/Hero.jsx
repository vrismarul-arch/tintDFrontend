import React from "react";
import { Carousel } from "antd";
import "./Hero.css";
import facial from "./banner/banner1.png";
import waxing from "./banner/banner2.png";
import Manicure from "./banner/banner3.png";
import SareeDraping from "./banner/banner4.png";
import facialleft from "./banner/banner2.png";
import waxingleft from "./banner/banner5.png";
import facialleft1 from "./banner/banner6.png";
import right2 from "./banner/banner7.png";
import right3 from "./banner/banner8.png";
import { StarOutlined, TeamOutlined } from "@ant-design/icons";

const categories = [
  { name: "BOOK NOW", icon: facialleft },
  { name: "Salon for Women", icon: SareeDraping },
  { name: "Waxing Service", icon: waxing },
  { name: "Manicure", icon: Manicure },
  { name: "Saree Draping", icon: waxingleft },
 
];

const Hero = () => {
  return (
    <section className="hero-container">
      {/* Left Section */}
      <div className="hero-left">
        <h1 className="hero-title"><img src="/tintD.png" alt="Logo" className="uc-logo-mobile" /> services at your doorstep</h1>

        <Carousel autoplay dots className="hero-carousel">
          {categories.map((cat, index) => (
            <div key={index} className="hero-category-card">
              <img src={cat.icon} alt={cat.name} />
            </div>
          ))}
        </Carousel>

        <div className="hero-ratings">
          <div className="rating-item">
            <StarOutlined className="rating-icon" />
            <div className="rating-number">4.8</div>
            <div className="rating-label">Service Rating*</div>
          </div>

          <div className="rating-item">
            <TeamOutlined className="rating-icon" />
            <div className="rating-number">12M+</div>
            <div className="rating-label">Customers Globally*</div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="hero-right">
        <div className="image-grid">
          <img className="img-tall" src={facialleft1} alt="Service 1" />
          <img className="img-wide" src={right2} alt="Service 2" />
          <img className="img-tall" src={right3} alt="Service 4" />
          <img className="img-small" src={facialleft1} alt="Service 3" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
