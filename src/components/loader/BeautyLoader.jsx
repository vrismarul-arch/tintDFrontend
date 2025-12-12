import React, { useEffect, useState } from "react";
import "./BeautyLoader.css";

import icon from "/tintD.png";


export default function BeautyLoader({ duration = 6, onFinish = () => {} }) {
  const beautyItems = [icon];

  const [seconds, setSeconds] = useState(duration);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const secInterval = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(secInterval);
          onFinish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    const rotateInterval = setInterval(() => {
      setCurrent((i) => (i + 1) % beautyItems.length);
    }, 900);

    return () => {
      clearInterval(secInterval);
      clearInterval(rotateInterval);
    };
  }, []);

  return (
    <div className="beauty-bg">
      {/* glow layers */}
      

      <div className="beauty-card">
        <div className="floating-wrapper">
          <img
            key={current}
            src={beautyItems[current]}
            className="floating-item"
            alt="beauty item"
          />
        </div>

        <h3 className="loader-title">Your glow is loading…
</h3>

        <p className="loader-sub">
          Setting up your beauty world…
        </p>

        <div className="loader-bar">
          <div
            className="loader-bar-fill"
            style={{
              width: `${((duration - seconds) / duration) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
