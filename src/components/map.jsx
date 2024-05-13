import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import osm from "./osm-providers";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoCompassOutline } from "react-icons/io5";
import useGeoLocation from "./useGeolocation";
import L from "leaflet";
import axios from "axios";
import PlaceIcon from "@mui/icons-material/Place"; //localisation
import BoltIcon from "@mui/icons-material/Bolt"; //power
import PowerIcon from "@mui/icons-material/Power"; //connector
import { CircularProgress, LinearProgress } from "@mui/material";
import "leaflet/dist/leaflet.css";
import DirectionsIcon from "@mui/icons-material/Directions";
import { MenuItem, Paper } from "@mui/material";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import "@maptiler/sdk/dist/maptiler-sdk.css";

import {
  Stack,
  OutlinedInput,
  IconButton,
  InputAdornment,
} from "@mui/material";

import TopoIcon from "../assets/img/topo.png"
import SatelliteIcon from "../assets/img/satellite.png"
import BrightIcon from "../assets/img/bright.png"

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

const MarkersMap = ({ powerFilter, selectedConnectors }) => {
  const [center, setCenter] = useState({ lat: 32.420882, lng: -7.1394574 });
  const location = useGeoLocation();
  const [stations, setStations] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [routeStart, setRouteStart] = useState("");
  const currentRoutingControl = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/");
        const parsedStations = response.data.map((station) => {
          const wktData = station.geom.match(/\(\(([^)]+)\)\)/)[1];
          const [longitude, latitude] = wktData.split(" ").map(Number);
          return { ...station, latitude, longitude, kada: station.connector };
        });
        setStations(parsedStations);
        setTimeout(() => {
          setLoading(false); // Set loading to false after 6 seconds
        }, 100); // Set loading to false after data fetching is done
      } catch (error) {
        console.error("Error fetching station data:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchStations();
    console.log("Selected Connectors in Map:", selectedConnectors); // Should update based on selections
  }, [powerFilter, selectedConnectors]); // Consider if selectedConnectors should trigger a re-fetch or not

  const mapRef = useRef();

  const filteredStations = stations.filter(
    (station) =>
      (selectedConnectors.length === 0 ||
        selectedConnectors.includes(station.connectorType)) &&
      station.power >= powerFilter
  );

  useEffect(() => {
    console.log("Rendering markers with connectors:", selectedConnectors);
    console.log("And power filter:", powerFilter);
  }, [selectedConnectors, powerFilter]);

  const handleSearchChange = async (e) => {
    const searchValue = e.target.value;
    setSearchValue(searchValue);
    if (searchValue) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ma&q=${searchValue}`
        );
        console.log("Autocomplete response:", response.data);
        setAutocompleteResults(response.data);
      } catch (error) {
        console.error("Error fetching autocomplete results:", error);
      }
    } else {
      setAutocompleteResults([]);
    }
  };

  const handleAutocomplete = async () => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ma&q=${searchValue}`
      );
      setAutocompleteResults(response.data);
    } catch (error) {
      console.error("Error fetching autocomplete results:", error);
    }
  };

  const handleResultSelect = (result) => {
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo([result.lat, result.lon], 13, {
        animate: true,
      });
      setSearchValue(""); // Clears the search input after selection
      setAutocompleteResults([]); // Clears the results after selection
    }
  };
  const handleRoute = (destination) => {
    const start =
      routeStart ||
      (location.loaded
        ? [location.coordinates.lat, location.coordinates.lng]
        : null);
    if (!start) {
      alert("Start location is not specified or current location not loaded.");
      return;
    }

    // Check if a routing control already exists and remove it
    if (routingControlRef.current) {
      routingControlRef.current.getPlan().setWaypoints([]); // Optionally clear waypoints
      routingControlRef.current.removeFrom(mapRef.current); // Correctly remove the control from the map
      routingControlRef.current = null; // Clear the ref
    }

    if (mapRef.current) {
      const map = mapRef.current;
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(start[0], start[1]),
          L.latLng(destination[0], destination[1]),
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "#6FA1EC", weight: 4 }],
        },
        createMarker: () => null, // Suppress marker creation
        geocoder: L.Control.Geocoder.nominatim(),
      }).addTo(map);

      // Listen to the 'routesfound' event
      routingControl.on('routesfound', function(e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        // Extract coordinates from the route's coordinates to find the midpoint
        const routeCoords = routes[0].coordinates;
        const midIndex = Math.floor(routeCoords.length / 2);
        const middlePoint = routeCoords[midIndex];

        // Create popup content with vehicle icon
        const popupContent = `
          <div>
            <img src="path/to/your/vehicle-icon.png" style="width: 24px; height: 24px; vertical-align: middle;">
            <span>Distance: ${(summary.totalDistance / 1000).toFixed(2)} km</span><br>
            <span>Duration: ${Math.round(summary.totalTime / 60)} minutes</span>
          </div>
        `;

        // Create a marker at the midpoint
        L.marker(middlePoint, {
          icon: L.divIcon({
            iconUrl: require("../assets/img/logo.png"),

            className: '', // No default leaflet class for custom styling
            html: popupContent,
            iconSize: L.point(150, 50) // Adjust size based on your content
          })
        }).addTo(map).bindPopup(popupContent).openPopup();
      });

      // Store the routing control in the ref
      routingControlRef.current = routingControl;
    }
};



  const showMyLocation = () => {
    if (location.loaded && mapRef.current) {
      const map = mapRef.current;
      map.flyTo([location.coordinates.lat, location.coordinates.lng], 13, {
        animate: true,
      });
    } else {
      console.log(
        location.error ? location.error.message : "Location data not loaded."
      );
    }
  };

  return (
    <Stack direction={"row"} height={"100%"}>
      <Stack direction={"column"} height={"100%"} width={"100%"}>
        <MapContainer center={center} zoom={7} zoomControl={false} ref={mapRef}>
          <LayersControl position="bottomleft">
            <LayersControl.BaseLayer checked name="Topo">
              <TileLayer
                url={osm.maptiler.url}
                attribution={osm.maptiler.attribution}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=QCJjsLjC3wi0UX43hcRA"
                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under CC BY SA.'
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Bright">
              <TileLayer
                url="https://api.maptiler.com/maps/bright-v2/256/{z}/{x}/{y}.png?key=QCJjsLjC3wi0UX43hcRA"
                attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under CC BY SA.'
              />
            </LayersControl.BaseLayer>
           
          </LayersControl>

          {/* Existing markers and components remain unchanged */}
          {location.loaded && !location.error && (
            <Marker
              icon={markerIcon}
              position={[location.coordinates.lat, location.coordinates.lng]}
            ></Marker>
          )}

          {loading && (
            <div
              style={{
                textAlign: "center",
                marginTop: "14px",
                position: "absolute",
                zIndex: "1000",
                left: "10PX",
              }}
            >
              <CircularProgress />
            </div>
          )}

          {!loading &&
            filteredStations.map((station) => {
              let icon;
              if (station.power >= 50) {
                icon = evstationIcon_super_rapid;
              } else if (station.power >= 7 && station.power < 50) {
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
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center">
                        <h4 style={{ margin: "0" }}>{station.name}</h4>
                      </Stack>
                      <Stack direction="row" alignItems="center">
                        <PlaceIcon
                          style={{ marginRight: "5px", color: "#023047" }}
                        />
                        <p style={{ margin: "0" }}>{station.address}</p>
                      </Stack>
                      <Stack direction="row" alignItems="center">
                        <BoltIcon
                          style={{ marginRight: "5px", color: "#023047" }}
                        />
                        <p style={{ margin: "0" }}>
                          {station.power} Kw{" "}
                          {station.voltage ? ` / ${station.voltage} V` : ""}
                        </p>
                      </Stack>
                      <Stack direction="row" alignItems="center">
                        <PowerIcon
                          style={{ marginRight: "5px", color: "#023047" }}
                        />
                        <p style={{ margin: "0" }}>
                          {station.connector} ({station.quantity})
                        </p>
                      </Stack>
                      <button
                        onClick={() =>
                          handleRoute([station.latitude, station.longitude])
                        }
                      >
                        Route Here
                      </button>
                    </Stack>
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
          <div style={{ position: "relative", width: "320px" }}>
            <OutlinedInput
              placeholder="Search in Morocco..."
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
                  <IconButton edge="end" onClick={handleAutocomplete}>
                    <FaSearch />
                  </IconButton>
                </InputAdornment>
              }
            />
            {autocompleteResults.length > 0 && (
              <Paper
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  maxHeight: "400px",
                  overflowY: "auto",
                  marginLeft: "70px",
                  zIndex: 10,
                }}
              >
                {autocompleteResults.map((result) => (
                  <MenuItem
                    key={result.place_id}
                    onClick={() => handleResultSelect(result)}
                  >
                    {result.display_name}
                  </MenuItem>
                ))}
              </Paper>
            )}
          </div>

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
