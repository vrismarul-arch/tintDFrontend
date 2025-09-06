import React, { useRef, useState, useEffect } from "react";

import "./Salonservicesdrawer.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Collapse, Spin } from "antd";
import api from "../../../../api"; // ✅ your axios instance

const { Panel } = Collapse;

export default function Salonservicesdrawer({
  open,
  onClose,
  service,   // expects { _id, name, price, ... }
  count = 0,
  onCountChange
}) {
  const sliderRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch service details when drawer opens
useEffect(() => {
  const fetchDetails = async () => {
    if (service?._id && open) {
      try {
        setLoading(true);
        const res = await api.get(`/api/admin/services/${service._id}`);
        setDetails(res.data);
      } catch (err) {
        console.error("Failed to fetch service details", err);
      } finally {
        setLoading(false);
      }
    }
  };
  fetchDetails();
}, [service, open]);

  if (!service) return null;

  const scroll = (direction) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth"
      });
    }
  };

  const handleScroll = () => {
    if (sliderRef.current) {
      setShowLeft(sliderRef.current.scrollLeft > 10);
    }
  };

  return (
    <div
      className={`drawer-overlay ${open ? "show" : ""}`}
      onClick={onClose}
      style={{ padding: "20px",marginTop:"50px" }}
    >
      <div
        className={`drawer-content ${open ? "open" : ""}`}
        style={{ padding: "20px", marginTop: "80px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Spin size="large" />
          </div>
        ) : details ? (
          <>
            {/* Header */}
            <div className="drawer-top">
              <div>
                <h2 className="service-title">{details.name}</h2>
                <p className="service-subtitle">{details.description}</p>
                <div className="price-row">
                  <span className="price">₹{details.price}</span>
                  {details.originalPrice && (
                    <>
                      <span className="old-price">₹{details.originalPrice}</span>
                      <span className="discount">{details.discount}% OFF</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Overview */}
            {details.overview?.length > 0 && (
              <>
                <h3 className="section-title">Overview</h3>
                <div className="overview-grid">
                  {details.overview.map((item, idx) => (
                    <div className="overview-item" key={idx}>
                      {item.img && <img src={item.img} alt={item.title} />} <br />
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Procedure */}
            {details.procedureSteps?.length > 0 && (
              <>
                <h3 className="section-title">Procedure</h3>
                <div className="procedure-slider-container">
                  <button
                    className={`scroll-btn left ${showLeft ? "show" : ""}`}
                    onClick={() => scroll("left")}
                  >
                    <LeftOutlined />
                  </button>

                  <div
                    className="procedure-slider"
                    ref={sliderRef}
                    onScroll={handleScroll}
                  >
                    {details.procedureSteps.map((step, index) => (
                      <div className="procedure-card" key={index}>
                        {step.img && (
                          <img
                            src={step.img}
                            alt={step.title}
                            className="procedure-img"
                          />
                        )}
                        <h4 className="procedure-title">{step.title}</h4>
                        <p className="procedure-desc">{step.desc}</p>
                        <div className="procedure-step">
                          {index + 1}/{details.procedureSteps.length}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    className="scroll-btn right"
                    onClick={() => scroll("right")}
                  >
                    <RightOutlined />
                  </button>
                </div>
              </>
            )}

            {/* Things To Know */}
            {details.thingsToKnow?.length > 0 && (
              <>
                <h3 className="section-title">Things To Know</h3>
                <div className="things-grid">
                  {details.thingsToKnow.map((item, idx) => (
                    <div className="things-card" key={idx}>
                      <h4 className="things-title">{item.title}</h4>
                      <p className="things-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* FAQ Section */}
            {details.faqs?.length > 0 && (
              <>
                <h3 className="section-title">Frequently Asked Questions</h3>
                <Collapse accordion>
                  {details.faqs.map((faq, idx) => (
                    <Panel header={faq.question} key={idx}>
                      <p>{faq.answer}</p>
                    </Panel>
                  ))}
                </Collapse>
              </>
            )}

            {/* Precautions & Aftercare */}
            {details.precautionsAftercare?.length > 0 && (
              <>
                <h3 className="section-title precautions-title">
                  Precautions & Aftercare
                </h3>
                <div className="precautions-grid">
                  {details.precautionsAftercare.map((item, idx) => (
                    <div className="precaution-card" key={idx}>
                      <div className="precaution-content">
                        <h4 className="precaution-title">{item.title}</h4>
                        <p className="precaution-desc">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="drawer-footer">
              <button className="done-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </>
        ) : (
          <p className="text-center p-4">Service details not found</p>
        )}
      </div>
    </div>
  );
}
