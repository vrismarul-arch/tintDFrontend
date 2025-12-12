// TestimonialSlider.jsx
import React, { useState, useEffect, useRef } from "react";
import "./TestimonialSlider.css";

const TestimonialSlider = () => {
  const data = [
    {
      name: "Video 1",
      subtitle: "Celebrity Review",
      video: "https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/1.mp4",
    },
    {
      name: "Video 2",
      subtitle: "Celebrity Experience",
      video: "https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/2.mp4",
    },
    {
      name: "Video 3",
      subtitle: "Client Testimonial",
      video: "https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/4.mp4",
    },
    {
      name: "Video 4",
      subtitle: "Client Testimonial",
      video: "https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/Tintd%20Ai%20reel%207.mp4",
    },
    {
      name: "Video 5",
      subtitle: "Client Testimonial",
      video: "https://bwglgjteqloufayiaadv.supabase.co/storage/v1/object/public/tintd/Tintd%20Ai%20reel%204.mp4",
    },
  ];

  const [offset, setOffset] = useState(0);
  const [playing, setPlaying] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentOffset = useRef(0);

  const CARD_WIDTH = 280;
  const GAP = 30;
  const VISIBLE = 4;
  const STEP = CARD_WIDTH + GAP;
  const MAX_OFFSET = -(data.length - VISIBLE) * STEP;

  // Auto slide
  useEffect(() => {
    if (playing !== null || isDragging) return;

    const timer = setInterval(() => {
      setOffset((prev) => {
        return prev <= MAX_OFFSET ? 0 : prev - STEP;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [playing, isDragging, MAX_OFFSET]);

  const goTo = (newOffset) => {
    const bounded = Math.max(MAX_OFFSET, Math.min(0, newOffset));
    setOffset(bounded);
    currentOffset.current = bounded;
  };

  const next = () => go(offset <= MAX_OFFSET ? 0 : offset - STEP);
  const prev = () => go(offset >= 0 ? MAX_OFFSET : offset + STEP);

  // Touch & Mouse Drag handlers
  const handleStart = (clientX) => {
    setIsDragging(true);
    startX.current = clientX - currentOffset.current;
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const x = clientX - startX.current;
    setOffset(x);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentOffset.current - offset;
    if (Math.abs(diff) > 70) {
      if (diff > 0) next();
      else prev();
    } else {
      go(currentOffset.current); // snap back
    }
  };

  return (
    <div className="celeb-container">
       <div className="category-header">
              <h2 className="categories-title">Celebrities love us</h2>
              <hr className="custom-hr" />
            </div>

      <div className="celeb-slider">
        <button className="arrow left" onClick={prev}>
          ❮
        </button>

        <div
          className="cards-window"
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          <div
            className="cards-wrapper"
            style={{
              transform: `translateX(${offset}px)`,
              transition: isDragging ? "none" : "transform 0.4s ease",
            }}
          >
            {data.map((item, i) => (
              <div key={i} className="celeb-card">
                <video
                  className="celeb-video"
                  controls
                  poster=""
                  onPlay={() => setPlaying(i)}
                  onPause={() => setPlaying(null)}
                  onEnded={() => setPlaying(null)}
                >
                  <source src={item.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

               
              </div>
            ))}
          </div>
        </div>

        <button className="arrow right" onClick={next}>
          ❯
        </button>
      </div>

      {/* Dim background when video is playing */}
      {playing !== null && (
        <div className="overlay" onClick={() => setPlaying(null)} />
      )}
    </div>
  );
};

export default TestimonialSlider;