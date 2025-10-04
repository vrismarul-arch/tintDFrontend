import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../../api"; // Adjust path as needed

export default function BreadcrumbComponent() {
  const location = useLocation();
  const { id } = useParams(); // get partner ID from route
  const [partner, setPartner] = useState(null);

  // Fetch partner info if ID exists
  useEffect(() => {
    if (id) {
      const fetchPartner = async () => {
        try {
          const { data } = await api.get(`/api/admin/partners/${id}`);
          setPartner(data.partner); // assuming API returns { partner: {...} }
        } catch (err) {
          console.error("Failed to fetch partner:", err);
        }
      };
      fetchPartner();
    }
  }, [id]);

  const pathSnippets = location.pathname.split("/").filter((i) => i);

  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathSnippets.map((segment, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSnippets.length - 1;

      // If this segment matches the partner ID, show partner name + ID
      if (partner && segment === (partner.partnerId || partner._id)) {
        return {
          title: (
            <span style={{ fontWeight: "600", color: "#1677ff" }}>
              {partner.name} ({partner.partnerId || partner._id})
            </span>
          ),
        };
      }

      // Otherwise, capitalize segment
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      return {
        title: isLast ? (
          <span style={{ fontWeight: "600" }}>{label}</span>
        ) : (
          <Link to={url}>{label}</Link>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ margin: "16px 0", fontSize: "15px" }}
    />
  );
}
