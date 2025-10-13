import React, { useState, useEffect } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./Testimonial.css";

const testimonials = [
  {
    name: "Arul Kumar",
    role: "CEO, Company A",
    message: "This service blew my mind! Amazing experience.",
    avatar: "https://i.pravatar.cc/150?img=10",
  },
  {
    name: "Priya Sharma",
    role: "Marketing Head, Company B",
    message: "Absolutely fantastic support and quality.",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Rahul Singh",
    role: "Developer, Company C",
    message: "Highly recommend! Smooth and professional.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
];

const TestimonialItem = ({ testimonial }) => (
  <div className="testimonial-card">
    <div className="testimonial-card-header">
      <img src={testimonial.avatar} alt={testimonial.name} />
      <div>
        <h3>{testimonial.name}</h3>
        <span>{testimonial.role}</span>
      </div>
    </div>
    <p>"{testimonial.message}"</p>
  </div>
);

const Testimonial = () => {
  const [current, setCurrent] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Navigation handlers
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  const nextSlide = () =>
    setCurrent((prev) => (prev + 1) % testimonials.length);

  return (
    <section className="testimonial-section">
      {/* Header */}
      <div className="testimonial-header-section">
        <h2 className="testimonial-title">Our Clients</h2>
        <hr className="testimonial-hr" />
      </div>

      {/* Cards + Arrows */}
      <div className="testimonial-container">
        <button className="testimonial-arrow left" onClick={prevSlide}>
          <LeftOutlined />
        </button>

        {testimonials.map((t, index) => (
          <div
            key={index}
            className={`testimonial-card-wrapper ${
              index === current ? "active" : "inactive"
            }`}
          >
            <TestimonialItem testimonial={t} />
          </div>
        ))}

        <button className="testimonial-arrow right" onClick={nextSlide}>
          <RightOutlined />
        </button>
      </div>

      {/* Dots */}
      <div className="testimonial-dots">
        {testimonials.map((_, index) => (
          <button
            key={index}
            className={index === current ? "active" : ""}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default Testimonial;