import React, { useState, useEffect } from "react";
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.min.css";
import "./TestimonialSlider.css";

const testimonials = [
  { video: "https://youtu.be/IEQ5ckrCCXU", thumb: "https://cdn.shopify.com/s/files/1/0248/2444/7029/files/vid-3-light-min.jpg?v=1660937599" },
  { video: "https://youtu.be/57elmQ8ivUU", thumb: "https://cdn.shopify.com/s/files/1/0248/2444/7029/files/vid-2-light-min.jpg?v=1660937624" },
  { video: "https://youtu.be/lk0pEnl28R0", thumb: "https://cdn.shopify.com/s/files/1/0248/2444/7029/files/vid-1-light-min.jpg?v=1660937649" },
  { video: "https://youtu.be/CQXtKQ1wAEk", thumb: "https://cdn.shopify.com/s/files/1/0248/2444/7029/files/vid-4-min.jpg?v=1662580555" },
  { video: "https://youtu.be/viErAUJ5XwI", thumb: "https://cdn.shopify.com/s/files/1/0248/2444/7029/files/vid-5-min.jpg?v=1662580555" },
];

const TestimonialSlider = () => {
  const [isOpen, setOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const slideWidth = 286 + 16; // 286px + 16px gap

  const handleOpen = (url) => {
    const videoId = url.split("youtu.be/")[1];
    setCurrentVideo(videoId);
    setOpen(true);
  };

  return (
    <div className="custom-slider-container">
      <h2>Customer Testimonials</h2>
      <div className="custom-slider">
        <button className="arrow prev" onClick={prevSlide}>&#10094;</button>

        <div className="slides-wrapper" style={{ transform: `translateX(-${currentIndex * slideWidth}px)` }}>
          {testimonials.map((item, idx) => (
            <div key={idx} className="slide" onClick={() => handleOpen(item.video)}>
              <img src={item.thumb} alt={`Testimonial ${idx + 1}`} />
            </div>
          ))}
        </div>

        <button className="arrow next" onClick={nextSlide}>&#10095;</button>
      </div>

      <ModalVideo
        channel="youtube"
        autoplay
        isOpen={isOpen}
        videoId={currentVideo}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

export default TestimonialSlider;
