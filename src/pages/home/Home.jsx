import { Skeleton } from "antd";
import toast from "react-hot-toast";
import TrendingServices from "../services/trendind/trendingservices";
import Adsbanner from "../home/addbanner/AdsBanner";
import Categories from "./categories/Categories";
import Hero from "./hero/Hero";
import Testimonial from "../testimonial/Testimonial";
import TestimonialSlider from "../testimonial/TestimonialSlider";
import Tintpartner from "../b2b/tintpartner";

export default function Home() {
  return (
    <div
      className="home-container"
     
    >
      <Hero />
      <Categories toast={toast} />
      {/* Trending */}
      {/* Banner */}
      <div
        className="addbanner"
        style={{ padding: "20px", marginTop: "2rem", marginBottom: "2rem" }}
      >
      <TrendingServices toast={toast} />
      </div>
      <div
        className="addbanner"
        style={{ marginTop: "2rem", marginBottom: "2rem" }}
      >
        <Adsbanner />
      </div>
      <div
        className="addbanner"
        style={{ marginTop: "2rem", marginBottom: "2rem" }}
      >

        <Testimonial/>
      </div>
      <div
        className="addbanner"
        style={{ marginTop: "2rem", marginBottom: "2rem" }}
      >

        <TestimonialSlider/>
      </div>
      <div
        className="addbanner"
        style={{ marginTop: "2rem", marginBottom: "2rem" }}
      >

        <Tintpartner/>
      </div>
    </div>
  );
}
