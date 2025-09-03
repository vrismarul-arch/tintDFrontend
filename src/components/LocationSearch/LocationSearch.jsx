import React, { useState, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";
import { Modal, Drawer, Button } from "antd";
import {
  EnvironmentOutlined,
  AimOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import "./LocationSearch.css";

const libraries = ["places"];
const fallbackCenter = { lat: 13.0827, lng: 80.2707 };

const LocationSearch = ({ isMobile }) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          reverseGeocode(coords);
        },
        (err) => console.error("Error getting location:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const reverseGeocode = (coords) => {
    if (!window.google || !window.google.maps) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results[0]) {
        setAddress(results[0].formatted_address);
      } else {
        setAddress("Address not found");
      }
    });
  };

  const handleMarkerDragEnd = (event) => {
    const newCoords = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setLocation(newCoords);
    reverseGeocode(newCoords);
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newCoords = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setLocation(newCoords);
        setAddress(place.formatted_address || place.name);
      }
    }
  };

  if (loadError)
    return (
      <p style={{ color: "red" }}>
        <CloseCircleOutlined style={{ marginRight: 6 }} />
        Map failed to load
      </p>
    );

  if (!isLoaded)
    return (
      <p>
        <LoadingOutlined spin style={{ marginRight: 6 }} />
        Loading map...
      </p>
    );

  const LocationContent = (
    <>
      {/* 🔍 Autocomplete Search */}
      <div style={{ margin: "10px" }}>
        <Autocomplete
          onLoad={(ref) => (autocompleteRef.current = ref)}
          onPlaceChanged={handlePlaceChanged}
        >
          <input
            type="text"
            placeholder="Search for a place..."
            style={{
              width: "90%",
              height: "40px",
              padding: "0 12px",
              fontSize: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
        </Autocomplete>
      </div>

      {/* Address Info */}
      <div
        style={{
          marginTop: 12,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          border: "1px solid #eee",
          borderRadius: "8px",
          background: "#fff",
        }}
      >
        {/* Address Row */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <EnvironmentOutlined
            style={{ color: "#a066e1", fontSize: 22, marginLeft: 6 }}
          />
          <b style={{ fontSize: 18 }}>Address:</b>
          <span style={{ fontSize: 16 }}>
            {address || (
              <>
                <LoadingOutlined spin style={{ marginRight: 6 }} /> Fetching...
              </>
            )}
          </span>
        </div>

        {/* Coordinates Row */}
        {location && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <b style={{ fontSize: 18 }}>Lat:</b> {location.lat.toFixed(5)}
            <b style={{ fontSize: 18 }}>Lng:</b> {location.lng.toFixed(5)}
          </div>
        )}

        {/* Button Row */}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            type="dashed"
            icon={<AimOutlined />}
            onClick={getCurrentLocation}
          >
            Use Current Location
          </Button>
        </div>
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: isMobile ? "calc(100vh - 200px)" : "calc(100vh - 160px)",
        }}
        center={location || fallbackCenter}
        zoom={15}
      >
        {location && (
          <Marker
            position={location}
            draggable={true}
            onDragEnd={handleMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </>
  );

  return (
    <>
      {/* Desktop trigger */}
      {!isMobile && (
        <div
          onClick={() => setIsOpen(true)}
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span style={{ fontWeight: "bold", marginLeft: 6 }}>
            {address ? address.split(",")[0] : "Select Location"}
          </span>
          <EnvironmentOutlined
            style={{ color: "#a066e1", fontSize: 22, marginLeft: 6 }}
          />
        </div>
      )}

      {/* Mobile → Modal */}
      {isMobile && (
        <Modal
          title="Pick Your Location"
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          footer={null}
          centered
          width="100%"
          style={{ top: 0, padding: 0 }}
          bodyStyle={{ height: "100vh", padding: 0 }}
        >
          {LocationContent}
        </Modal>
      )}

      {/* Desktop → Drawer */}
      {!isMobile && (
        <Drawer
          open={isOpen}
          onClose={() => setIsOpen(false)}
          width={620}
          placement="left"
          destroyOnClose
          closeIcon={false}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #eee",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              background: "#fff",
              zIndex: 10,
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
              <EnvironmentOutlined style={{ marginRight: 6 }} /> Choose Location
            </h3>
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: "#a066e1",
                borderColor: "#a066e1",
                color: "#fff",
              }}
            >
              Close
            </Button>
          </div>

          <div style={{ padding: "12px" }}>{LocationContent}</div>
        </Drawer>
      )}
    </>
  );
};

export default LocationSearch;
