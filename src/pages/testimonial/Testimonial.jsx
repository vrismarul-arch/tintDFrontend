import React, { useState } from "react";
import data from "./reviews.json";
import "./Testimonial.css";
import leftImg from "/tintD.png"; // <-- your left side image

const Testimonials = () => {
  const [index, setIndex] = useState(0);
  const [anim, setAnim] = useState("slide-in");

  const next = () => {
    setAnim("slide-out");
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % data.length);
      setAnim("slide-in");
    }, 300);
  };

  const prev = () => {
    setAnim("slide-out");
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + data.length) % data.length);
      setAnim("slide-in");
    }, 300);
  };

  const t = data[index];

  return (
    <div className="testimonial-container">

      {/* LEFT SIDE */}
      <div className="left-section">
        
        {/* LEFT SIDE IMAGE */}
        <div className="left-image-wrapper">
          <img src={leftImg} alt="Customer Love" className="left-image" />
        </div>

        <h1 className="left-title">
          Love from our customers
        </h1>

        <div className="left-rating">
          <span className="big-star"><svg xmlns="http://www.w3.org/2000/svg" width="66" height="63" fill="none" viewBox="0 0 66 63"><path fill="url(#a)" d="M29.39 3.065c1.449-3.036 5.771-3.036 7.22 0l6.688 14.015a4 4 0 0 0 3.087 2.243l15.395 2.03c3.336.44 4.672 4.55 2.232 6.867L52.749 38.91a4 4 0 0 0-1.179 3.63l2.827 15.27c.613 3.307-2.884 5.848-5.84 4.243l-13.649-7.407a4 4 0 0 0-3.816 0l-13.648 7.407c-2.957 1.605-6.454-.936-5.841-4.244L14.43 42.54a4 4 0 0 0-1.18-3.63L1.989 28.22c-2.44-2.317-1.104-6.427 2.232-6.867l15.395-2.03a4 4 0 0 0 3.087-2.243z" /><defs><linearGradient id="a" x1="15.5" x2="50" y1="8.5" y2="63.5" gradientUnits="userSpaceOnUse"><stop stop-color="#713fa8" /><stop offset=".5" stop-color="#6f3ea6" /><stop offset="1" stop-color="#523d67" /></linearGradient></defs></svg></span>
          <h2 className="rating-value">4.5</h2>
        </div>

      </div>

      {/* RIGHT SIDE REVIEW CARD */}
      <div className={`review-card ${anim}`}>
        <img src={t.img} alt={t.name} className="user-img" />
        <h3 className="user-name">{t.name}</h3>
        <h3 className="user-name">{t.role}</h3>
        <p className="stars">{"⭐".repeat(t.rating)}</p>
        <p className="review-text">{t.review}</p>
        
        <div className="nav-btns">
          <p className="page-count">
            <b>{index + 1}</b><span> / {data.length}</span>
          </p>
          <button className="nav-btn" onClick={prev}>←</button>
          <button className="nav-btn" onClick={next}>→</button>
        </div>
      </div>

    </div>
  );
};

export default Testimonials;
