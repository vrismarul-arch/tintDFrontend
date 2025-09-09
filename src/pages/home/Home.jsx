import { Skeleton } from "antd";
import toast from "react-hot-toast";
import TrendingServices from "../services/trendind/trendingservices";
import Adsbanner from "../home/addbanner/AdsBanner";
import Categories from "./categories/Categories";
import Hero from "./hero/Hero";

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
    </div>
  );
}
