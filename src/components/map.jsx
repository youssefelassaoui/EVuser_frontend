import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import osm from "./osm-providers";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoCompassOutline } from "react-icons/io5";
import useGeoLocation from "./useGeolocation";
import L from "leaflet";
import axios from "axios";
import wellknown from "wellknown";

import "leaflet/dist/leaflet.css";
import {
  Stack,
  Button,
  TextField,
  OutlinedInput,
  IconButton,
  InputAdornment,
} from "@mui/material";

const markerIcon = new L.Icon({
  iconUrl: require("../assets/img/currentlocation_img.png"),
  iconSize: [40, 40],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});

const evstationIcon_fast = new L.Icon({
  iconUrl: require("../assets/img/evstationIcon.png"),
  iconSize: [50, 50],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});
const evstationIcon_slow = new L.Icon({
  iconUrl: require("../assets/img/evstationicon_slow.png"),
  iconSize: [50, 50],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});
const evstationIcon_super_rapid = new L.Icon({
  iconUrl: require("../assets/img/evstationicon_super_rapid.png"),
  iconSize: [50, 50],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});
const defaultIcon = new L.Icon({
  iconUrl: require("../assets/img/logo.png"),
  iconSize: [50, 50],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});


const MarkersMap = () => {
  const [center, setCenter] = useState({ lat: 32.420882, lng: -7.1394574 });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const location = useGeoLocation();
  const [stations, setStations] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/");
        const parsedStations = response.data.map((station) => {
          const wktData = station.geom.match(/\(\(([^)]+)\)\)/)[1];
          const [longitude, latitude] = wktData.split(" ").map(Number);
          return { ...station, latitude, longitude };
        });
        setStations(parsedStations);
      } catch (error) {
        console.error("Error fetching station data:", error);
      }
    };

    fetchStations();
  }, []);

  const mapRef = useRef();

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleAutocomplete = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchValue}`
      );

      console.log(response.data); // Log the response data
      setAutocompleteResults(response.data);
      console.log(response.data);
      console.log("Search Value:", searchValue);
    } catch (error) {
      console.error("Error fetching autocomplete results:", error);
    }
  };
  useEffect(() => {
    console.log("Autocomplete Results:", autocompleteResults);
  }, [autocompleteResults]);

  const handleResultSelect = (result) => {
    mapRef.current.leafletElement.flyTo([result.lat, result.lon], 13);
    setSearchValue("");
    setAutocompleteResults([]);
  };

  const showMyLocation = () => {
    if (location.loaded) {
      if (mapRef.current) {
        const map = mapRef.current.leafletElement;
        if (map) {
          map.flyTo([location.coordinates.lat, location.coordinates.lng], 13, {
            animate: true,
          });
        } else {
          console.log("Leaflet map element not yet available.");
        }
      } else {
        console.log("Map reference not yet available.");
      }
    } else {
      console.log(location.error?.message);
    }
  };

  return (
    <Stack direction={"row"} height={"100%"}>
      <Stack direction={"column"} height={"100%"} width={"100%"}>
        <MapContainer center={center} zoom={7} zoomControl={false} ref={mapRef}>
          <TileLayer
            url={osm.maptiler.url}
            attribution={osm.maptiler.attribution}
          />

          {location.loaded && !location.error && (
            <Marker
              icon={markerIcon}
              position={[location.coordinates.lat, location.coordinates.lng]}
            ></Marker>
          )}

          {stations.map((station) => {
            let icon;
            if (station.power >= 50) {
              icon = evstationIcon_super_rapid;
            } else if (station.power >= 7 && station.power <50) {
              icon = evstationIcon_fast;
            } else if (station.power >= 2 && station.power <= 6) {
              icon = evstationIcon_slow;
            } 

            return (
              <Marker
                key={station.gid}
                position={[station.latitude, station.longitude]}
                icon={icon}
              >
                <Popup>
                  <div>
                    <h4>{station.name}</h4>
                    <p>{station.address}</p>
                    <p>Power: {station.power}</p>
                    <p>Voltage: {station.voltage}</p>
                    <p>Connector: {station.connector}</p>
                    <p>Quantity: {station.quantity}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <Stack
          direction={"row"}
          position={"absolute"}
          alignItems={"center"}
          zIndex={1000}
          spacing={3}
          justifyContent={"space-between"}
        >
          <OutlinedInput
            placeholder="  Search..."
            value={searchValue}
            onChange={handleSearchChange}
            style={{
              position: "relative",
              backgroundColor: "white",
              border: "none",
              left: "70px",
              marginTop: "20px",
              width: "320px",
              height: "50px",
              borderRadius:
                autocompleteResults.length > 0 ? "25px 25px 0 0" : "25px",
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton edge="end">
                  <FaSearch />
                </IconButton>
              </InputAdornment>
            }
          >
            {/* <Button color="primary" style={{position:"absolute", zIndex:99}} onClick={handleAutocomplete}>
            <FaSearch />
          </Button> */}
          </OutlinedInput>
          <div
            onClick={showMyLocation}
            className="location-icon"
            style={{ left: "380px", marginTop: "20px" }}
          >
            <IoCompassOutline />
          </div>
        </Stack>

        <div
          className="circle-container"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          <FaUser className="user-icon" />
        </div>
      </Stack>
    </Stack>
  );
};

export default MarkersMap;
