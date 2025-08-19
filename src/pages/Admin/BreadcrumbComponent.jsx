import { HomeOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumb.css";

export default function BreadcrumbComponent() {
  const location = useLocation();
  const pathSnippets = location.pathname.split("/").filter(i => i);

  // Build breadcrumb items dynamically
  const breadcrumbItems = [
    {
      title: (
        <Link to="/">
          <HomeOutlined />
        </Link>
      ),
    },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSnippets.length - 1;

      return {
        title: isLast ? (
          <span style={{ fontWeight: "600" }}>{_}</span>
        ) : (
          <Link to={url}>{_}</Link>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{
        margin: "16px 0",
        fontSize: "15px",
      }}
    />
  );
}
