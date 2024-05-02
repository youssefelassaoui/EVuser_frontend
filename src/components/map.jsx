import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Input, Button } from "reactstrap";
import osm from "./osm-providers";
import { FaSearch, FaUser } from "react-icons/fa";
import { IoCompassOutline } from "react-icons/io5";
import useGeoLocation from "./useGeolocation";
import L from "leaflet";
import axios from "axios";
import wellknown from "wellknown";

import "leaflet/dist/leaflet.css";

// Icon for the marker
const markerIcon = new L.Icon({
  iconUrl: require("../assets/img/currentlocation_img.png"),
  iconSize: [40, 40],
  iconAnchor: [17, 46],
  popupAnchor: [0, -46],
});

const evstationIcon = new L.Icon({
    iconUrl: require("../assets/img/evstationIcon.png"),
    iconSize: [50, 50],
    iconAnchor: [17, 46],
    popupAnchor: [0, -46],
  });


const MarkersMap = () => {
  const [center, setCenter] = useState({ lat: 32.420882, lng: -7.1394574 });
  const ZOOM_LEVEL = 7;
  
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const location = useGeoLocation();
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/");
        const parsedStations = response.data.map(station => {
          // Extract the WKT data from geom and parse it
          const wktData = station.geom.match(/\(\(([^)]+)\)\)/)[1];

          const [longitude , latitude ] = wktData.split(" ").map(Number);
console.log("Latitude:", latitude);
console.log("Longitude:", longitude);
          return { ...station, latitude, longitude };
        });
        setStations(parsedStations);
      } catch (error) {
        console.error("Error fetching station data:", error);
      }
    };
  
    fetchStations();
  }, []);

  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };
  const mapRef = useRef();
  const showMyLocation = () => {
    
    if (location.loaded ) {
        if (mapRef.current) {
            const map = mapRef.current.leafletElement;
            if (map) {
                map.flyTo(
                    [location.coordinates.lat, location.coordinates.lng],
                    ZOOM_LEVEL,
                    { animate: true }
                );
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
    <div className="row">
      <div className="col text-center">
        <div className="col">
          <MapContainer
            center={center}
            zoom={ZOOM_LEVEL}
            ref={mapRef}
         
            
          >
            <TileLayer url={osm.maptiler.url} attribution={osm.maptiler.attribution} />

            {location.loaded && !location.error && (
              <Marker
                icon={markerIcon}
                position={[location.coordinates.lat, location.coordinates.lng]}
                
              ></Marker>
            )}

{stations.map((station) => (
    <Marker key={station.gid} position={[station.latitude, station.longitude]} icon={evstationIcon}>
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
  ))}

            <Input className="search-container" size="md" placeholder="  Search..." variant="soft" />
            <Button color="primary" className="search-button">
              <FaSearch />
            </Button>

            <div className="location-icon" onClick={showMyLocation}>
              <IoCompassOutline />
            </div>
            <div className="circle-container" onClick={togglePopover}>
              <FaUser className="user-icon" />
            </div>

            {isPopoverOpen && (
              <div className="popover">
                <div>Welcome, User</div>
                <div>History</div>
                <div>Profile</div>
                <div>logout</div>
              </div>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MarkersMap;
