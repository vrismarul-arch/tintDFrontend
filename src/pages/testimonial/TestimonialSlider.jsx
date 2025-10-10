import React, { useState, useEffect, useRef } from "react";
import ModalVideo from "react-modal-video";
import "react-modal-video/css/modal-video.min.css";
// Ensure you have a file named TestimonialSlider.css in the same directory
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
  // currentIndex represents the index of the first visible slide
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [slidesToShow, setSlidesToShow] = useState(4);
  // sliderRef is not strictly necessary for this logic but kept for potential future use

  // Responsive slides count
  const updateSlidesToShow = () => {
    if (window.innerWidth <= 480) setSlidesToShow(1);
    else if (window.innerWidth <= 768) setSlidesToShow(2);
    else if (window.innerWidth <= 1024) setSlidesToShow(3);
    else setSlidesToShow(4);
  };

  useEffect(() => {
    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, []);

  // Calculate the maximum index the slider can translate to
  const maxIndex = Math.max(0, testimonials.length - slidesToShow);

  const nextSlide = () => {
    // Scrolls one slide at a time, up to the maximum index
    setCurrentIndex((prev) =>
      Math.min(prev + 1, maxIndex)
    );
  };

  const prevSlide = () => {
    // Scrolls one slide at a time, down to index 0
    setCurrentIndex((prev) =>
      Math.max(prev - 1, 0)
    );
  };

  const handleOpen = (url) => {
    // Extracts video ID from common YouTube short and long URLs
    const videoIdMatch = url.match(/(?:youtu\.be\/|v=)([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (videoId) {
      setCurrentVideo(videoId);
      setOpen(true);
    }
  };

  // Determine if the next/prev buttons should be disabled
  const isPrevDisabled = currentIndex === 0;
  const isNextDisabled = currentIndex >= maxIndex;

  return (
    <div className="custom-slider-container">
      <h2>Customer Testimonials</h2>

      <div className="custom-slider">
        <button
          className="arrow prev"
          onClick={prevSlide}
          disabled={isPrevDisabled}
          // The "disabled" attribute will be styled in the CSS
        >
          &#10094;
        </button>

        <div className="slides-wrapper">
          <div
            className="slides-inner"
            style={{
              // Width must be 100% of the number of slides * one slide's proportional width (100 / slidesToShow)
              // (e.g. 5 slides / 4 visible slides) * 100% = 125% width
              width: `${(testimonials.length / slidesToShow) * 100}%`,
              // Translate by the currentIndex multiplied by the visible width of one slide (100 / testimonials.length)%
              // This is the percentage relative to the slides-inner width.
              transform: `translateX(-${(currentIndex * 100) / testimonials.length}%)`,
            }}
          >
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="slide"
                // Each slide's width is 100% / total number of slides
                style={{ width: `${100 / testimonials.length}%` }}
                onClick={() => handleOpen(item.video)}
              >
                <img src={item.thumb} alt={`Testimonial ${idx + 1}`} />
                <div className="play-icon">&#9654;</div> {/* Play button visual */}
              </div>
            ))}
          </div>
        </div>

        <button
          className="arrow next"
          onClick={nextSlide}
          disabled={isNextDisabled}
        >
          &#10095;
        </button>
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