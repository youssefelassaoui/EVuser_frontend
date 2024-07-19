import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from "react-leaflet";
import osm from "./osm-providers";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoCompassOutline } from "react-icons/io5";
import useGeoLocation from "./useGeolocation";
import L from "leaflet";
import axios from "axios";
import PlaceIcon from "@mui/icons-material/Place"; //localisation
import BoltIcon from "@mui/icons-material/Bolt"; //power
import PowerIcon from "@mui/icons-material/Power"; //connector
import { CircularProgress } from "@mui/material";
import "leaflet/dist/leaflet.css";
import { MenuItem, Paper } from "@mui/material";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import GoogleMapsAutocomplete from "./AutoCompleteInput";

import {
  Stack,
  OutlinedInput,
  IconButton,
  InputAdornment,
} from "@mui/material";

import TopoIcon from "../assets/img/topo.png";
import SatelliteIcon from "../assets/img/satellite.png";
import BrightIcon from "../assets/img/bright.png";

const pinDropIcon = new L.Icon({
  iconUrl: require("../assets/img/file.png"),
  iconSize: [40, 40],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});

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

const MarkersMap = React.memo(({ powerFilter, selectedConnectors }) => {
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
  const [selectedStation, setSelectedStation] = useState(null);
  const boundingBox = [
    [40.7128, -74.006], // Southwest corner [latitude, longitude]
    [40.748817, -73.985428], // Northeast corner [latitude, longitude]
  ];

  useEffect(() => {
    setLoading(true);
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8001/");
        const parsedStations = response.data.map((station) => {
          const wktData = station.geom.match(/\(\(([^)]+)\)\)/)[1];
          const [longitude, latitude] = wktData.split(" ").map(Number);
          return {
            ...station,
            latitude,
            longitude,
            connectorType: station.connector  // Confirm this is the correct field and has data
        };
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
    station =>
        (selectedConnectors.length === 0 ||
         selectedConnectors.some(connector => 
             connector.slice(0, 3).toLowerCase() === (station.connectorType?.slice(0, 3).toLowerCase()))) &&
        station.power >= powerFilter
);


  
  
console.log("Selected Connectors:", selectedConnectors);
console.log("Filtered Stations Count:", filteredStations.length);
filteredStations.forEach(station => {
    console.log(`Station Name: ${station.name}, Connector Type: ${station.connectorType}`);
});
console.log("Selected Connectors:", selectedConnectors.map(conn => conn.slice(0, 3).toLowerCase()));
stations.forEach(station => {
    console.log(`Station Name: ${station.name}, Connector Type First 3: ${station.connectorType?.slice(0, 3).toLowerCase()}`);
});

  


  const handleAddressSelect = async (address, placeId) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            placeId: placeId,
            key: "AIzaSyCuga0rxBnch_BCzWW1NA8WJdrTcvdfbpo",
          },
        }
      );

      if (response.data && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        const newCenter = L.latLng(lat, lng);
        setCenter(newCenter); // Update the center state

        if (mapRef.current) {
          mapRef.current.flyTo(newCenter, 13); // Adjust the zoom level as necessary
        }
      } else {
        console.log("No results found");
      }
    } catch (error) {
      console.error("Failed to fetch coordinates:", error);
    }
  };

  const handleRoute = (station) => {
    const destination = [station.latitude, station.longitude];
    const start = location.loaded
      ? [location.coordinates.lat, location.coordinates.lng]
      : null;

    if (!start) {
      alert("Current location is not loaded.");
      return;
    }

    // If the station currently has a route displayed, clicking it again should remove the route.
    if (selectedStation === station.gid && routingControlRef.current) {
      // Clear existing routing control
      if (routingControlRef.current) {
        routingControlRef.current.getPlan().setWaypoints([]);
        routingControlRef.current.remove(); // Ensuring we use the correct method to remove the routing control
        routingControlRef.current = null;
      }

      // Reset selected station
      setSelectedStation(null);
      return;
    }

    // Clear any existing route before setting a new one,
    // which ensures that only one route is displayed at a time.
    if (routingControlRef.current) {
      routingControlRef.current.getPlan().setWaypoints([]);
      routingControlRef.current.remove(); // Make sure to use remove() method to properly clear the route from the map
      routingControlRef.current = null;
    }

    // Set up new routing control only if a new route is to be created
    if (mapRef.current && selectedStation !== station.gid) {
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
        createMarker: () => null,
        geocoder: L.Control.Geocoder.nominatim(),
        addWaypoints: false,
        draggableWaypoints: false,
        itinerary: false,
      }).addTo(map);

      // Event listener for when a route is found
      routingControl.on("routesfound", function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        const routeCoords = routes[0].coordinates;
        const midIndex = Math.floor(routeCoords.length / 2);
        const middlePoint = routeCoords[midIndex];

        // Popup content with Material Icon
        const popupContent = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div>
              <strong>Distance:</strong> ${(
                summary.totalDistance / 1000
              ).toFixed(2)} km<br>
              <strong>Duration:</strong> ${Math.round(
                summary.totalTime / 60
              )} minutes
            </div>
          </div>
        `;

        // Marker at the route midpoint
        L.marker(middlePoint, {
          icon: L.divIcon({
            className: "", // Custom class for styling if needed
            iconSize: L.point(30, 30), // Small icon size for the map marker
          }),
        })
          .addTo(map)
          .bindPopup(popupContent)
          .openPopup();
      });

      // Store the routing control reference
      routingControlRef.current = routingControl;
      setSelectedStation(station.gid);
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
  const corner1 = L.latLng(18.0, -18.0); // Southwest corner (includes Mauritania)
  const corner2 = L.latLng(38.0, 5.0); // Northeast corner (near Oujda)

  return (
    <Stack direction={"row"} height={"100%"}>
      <Stack
        direction={"column"}
        height={"100%"}
        width={"100%"}
        position={"relative"}
      >
        <MapContainer
          center={center}
          zoom={7}
          minZoom={6}
          maxZoom={18}
          zoomControl={false}
          ref={mapRef}
          // bounds={boundingBox}
          maxBounds={[corner1, corner2]} // Limit panning to these boundsnsure boundingBox is correctly calculated based on your data
        >
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

          {/* Marker for current location */}
          {location.loaded && !location.error && (
            <Marker
              icon={markerIcon}
              position={[location.coordinates.lat, location.coordinates.lng]}
            />
          )}

          {/* Loading Indicator */}
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

          {/* Station Markers */}
          {!loading &&
            filteredStations.map((station) => (
              <Marker
                key={station.gid}
                position={[station.latitude, station.longitude]}
                icon={
                  selectedStation === station.gid
                    ? pinDropIcon
                    : station.power >= 50
                    ? evstationIcon_super_rapid
                    : station.power >= 7
                    ? evstationIcon_fast
                    : evstationIcon_slow
                }
              >
                <Popup>
                  <Stack spacing={1}>
                    {/* Station Name */}
                    <Stack direction="row" alignItems="center">
                      <h4 style={{ margin: "0" }}>{station.name}</h4>
                    </Stack>
                    {/* Station Address */}
                    <Stack direction="row" alignItems="center">
                      <PlaceIcon
                        style={{ marginRight: "5px", color: "#023047" }}
                      />
                      <p style={{ margin: "0" }}>{station.address}</p>
                    </Stack>
                    {/* Power Info */}
                    <Stack direction="row" alignItems="center">
                      <BoltIcon
                        style={{ marginRight: "5px", color: "#023047" }}
                      />
                      <p style={{ margin: "0" }}>
                        {station.power} Kw{" "}
                        {station.voltage ? ` / ${station.voltage} V` : ""}
                      </p>
                    </Stack>
                    {/* Connector Info */}
                    <Stack direction="row" alignItems="center">
                      <PowerIcon
                        style={{ marginRight: "5px", color: "#023047" }}
                      />
                      <p style={{ margin: "0" }}>
                        {station.connector} ({station.quantity})
                      </p>
                    </Stack>
                    {/* Routing Button */}
                    <button onClick={() => handleRoute(station)}>
                      {selectedStation === station.gid
                        ? "Stop Routing"
                        : "Route Here"}
                    </button>
                  </Stack>
                </Popup>
              </Marker>
            ))}
        </MapContainer>

        <Stack
          direction={"row"}
          position={"absolute"}
          alignItems={"center"}
          zIndex={1000}
          spacing={5}
          justifyContent={"space-between"}
          left={"120px"}
          marginTop={"26px"}
          // justify-content: center;
          // align-items: center;
        >
          <div style={{ width: "320px" }}>
            <GoogleMapsAutocomplete
              setAddress={handleAddressSelect}
              placeholder="Search in Morocco..."
              style={{ backgroundColor: "white", borderRadius: "8px", borderRadius : "25px" }} // Specific styles
              isMap={true}  // Ensure the specific styles and icons for the map are applied

            />
          </div>

          <div
            onClick={showMyLocation}
            className="location-icon"
            style={{ left: "300px" }}
            // style={{ left: "380px", marginTop: "20px" }}
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
});

export default MarkersMap;
