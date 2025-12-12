import React from "react";
import { Carousel } from "antd";
import "./Hero.css";

import waxingleft2 from "./banner/banner1.png";
import facialleft1 from "./banner/banner6.png";
import right2 from "./banner/banner7.png";
import right3 from "./banner/banner8.png";
import { StarOutlined, TeamOutlined } from "@ant-design/icons";

const categories = [
  { name: "BOOK NOW", icon: facialleft1 },
  { name: "Salon for Women", icon: right2 },
  { name: "Waxing Service", icon: right3 },
  { name: "Manicure", icon: facialleft1 },
  { name: "Saree Draping", icon: waxingleft2 },
 
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
            <div className="rating-number">5k+</div>
            <div className="rating-label">Happy Clients</div>
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
