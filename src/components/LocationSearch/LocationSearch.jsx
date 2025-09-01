  // src/components/LocationSearch/LocationSearch.jsx
  import React from "react";
  import { Input, Select } from "antd";
  import { EnvironmentOutlined, SearchOutlined } from "@ant-design/icons";
  import "./LocationSearch.css";

  const { Option } = Select;

  const LocationSearch = () => {
    return (
      <div className="location-search-container">
        {/* Location dropdown */}
        <div className="location-wrapper">
          <EnvironmentOutlined className="location-icon" />
          <Select
            defaultValue="Nungambakkam, Chennai"
            className="uc-location"
            suffixIcon={null}
          >
            <Option value="nungambakkam">Nungambakkam, Chennai</Option>
            <Option value="adyar">Adyar, Chennai</Option>
          </Select>
        </div>

        {/* Search input */}
        <Input
          placeholder="Search for services (e.g. Facial, Kitchen)"
          prefix={<SearchOutlined className="search-icon" />}
          className="uc-search"
        />
      </div>
    );
  };

  export default LocationSearch;
