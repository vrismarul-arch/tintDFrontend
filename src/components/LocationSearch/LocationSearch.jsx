  import React, { useState, useEffect, useRef } from "react";
  import {
    GoogleMap,
    Marker,
    useJsApiLoader,
    Autocomplete,
  } from "@react-google-maps/api";
  import { Modal, Drawer, Button } from "antd";
  import { EnvironmentOutlined } from "@ant-design/icons";

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

    if (loadError) return <p>❌ Map failed to load</p>;
    if (!isLoaded) return <p>⏳ Loading map...</p>;

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
                width: "100%",
                height: "40px",
                padding: "0 12px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
          </Autocomplete>
        </div>

        {/* 🌍 Map */}
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

        {/* 📍 Info */}
        <div style={{ marginTop: 12, padding: "8px" }}>
          <b>📍 Address:</b> {address || "Fetching..."} <br />
          {location && (
            <>
              <b>Lat:</b> {location.lat.toFixed(5)} | <b>Lng:</b>{" "}
              {location.lng.toFixed(5)}
            </>
          )}
          <br />
          <Button
            type="dashed"
            style={{ marginTop: 8 }}
            onClick={getCurrentLocation}
          >
            🎯 Use Current Location
          </Button>
        </div>
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
            <EnvironmentOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />
            <span style={{ fontWeight: "bold", marginLeft: 6 }}>
              {address ? address.split(",")[0] : "Select Location"}
            </span>
          </div>
        )}

        {/* 📱 Mobile → Modal */}
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

        {/* 💻 Desktop → Drawer */}
        {!isMobile && (
          <Drawer
            title="Pick Your Location"
            open={isOpen}
            onClose={() => setIsOpen(false)}
            width={500}
            destroyOnClose
          >
            {LocationContent}
          </Drawer>
        )}
      </>
    );
  };

  export default LocationSearch;  