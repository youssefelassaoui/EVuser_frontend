import React, { useState, useRef } from "react";
import {
  Button,
  TextField,
  FormControl,
  Box,
  Typography,
  Modal,
  Stack,
  Grid,
  
} from "@mui/material";
// import SimpleSnackbar from "./SnackbarAlert";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
// import osm from "./osm-providers";
import useGeoLocation from "./useGeolocation";
import { IoCompassOutline } from "react-icons/io5";
import GoogleMapsAutocomplete from "./AutoCompleteInput";
import CheckboxesTags from "./CheckboxesTags";
import { SnackbarProvider, useSnackbar } from "notistack";

function AddChargerModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [power, setPower] = useState("20");
  // const [connectorType, setConnectorType] = useState("");
  const [image, setImage] = useState(null);
  const location = useGeoLocation();
  const [center, setCenter] = useState({ lat: 32.420882, lng: -7.1394574 });
  const [selectedConnectors, setSelectedConnectors] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

  // const handleClick = () => {
  //   enqueueSnackbar("I love snacks.");
  // };

  const handleClickVariant = (variant) => () => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar("This is a success message!", { variant });
  };
  // Default to the first value or an empty string

  const handleChange = (event) => {
    setPower(event.target.value);
  };
  const [markerPosition, setMarkerPosition] = useState({
    lat: 32.420882,
    lng: -7.1394574,
  });
  const mapRef = useRef(null);
  const [markerVisible, setMarkerVisible] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };
  const handleMapClick = (event) => {
    setMarkerPosition(event.latlng);
    setMarkerVisible(true);
    fetchAddressFromCoords(event.latlng.lat, event.latlng.lng);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Initialize FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("address", address);
    formData.append("power", power);
    formData.append(
      "connectors",
      JSON.stringify(selectedConnectors.map((c) => ({ title: c.title })))
    );
    if (image) formData.append("image", image);

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      // Make POST request with axios
      const response = await axios
        .post("http://127.0.0.1:8001/api/chargers/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          console.log("Success:", response.data);
          handleCloseModal();
        })
        .catch((error) => {
          console.error(
            "Error during POST request:",
            error.response ? error.response.data : error
          );
        });

      // Check for successful response status (considering successful creation status code 201)
      if (response.status === 200 || response.status === 201) {
        console.log("Success:", response.data);
        handleCloseModal(); // Close modal on success
      }
    } catch (error) {
      if (error.response) {
        console.error("Error during POST request:", error.response.data);
        // Display error messages from the server to the user
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        console.error("Error during POST request:", error.message);
      }
    }
  };

  const handleMarkerDragEnd = async (event) => {
    const newPos = event.target.getLatLng();
    setMarkerPosition(newPos);
    fetchAddressFromCoords(newPos.lat, newPos.lng);
  };
  const pinDropIcon = new L.Icon({
    iconUrl: require("../assets/img/file.png"),
    iconSize: [40, 40],
    iconAnchor: [17, 46],
    popupAnchor: [0, -46],
  });

  const fetchAddressFromCoords = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      setAddress(response.data.display_name);
    } catch (error) {
      console.error("Failed to fetch address:", error);
    }
  };
  const showMyLocation = () => {
    if (location.loaded && !location.error) {
      const userLocation = {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
      };
      setMarkerPosition(userLocation);
      setMarkerVisible(true);
      mapRef.current.flyTo(userLocation, 13, { animate: true });
    } else {
      console.error(
        location.error ? location.error.message : "Location data not loaded."
      );
    }
  };
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
        setMarkerPosition(newCenter); // Update marker position
        setMarkerVisible(true); // Ensure the marker is visible

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
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{ mt: 2, ml: 2, borderRadius: "15px" }}
      >
        + Add Missing Charger
      </Button>
      <SnackbarProvider maxSnack={3}>
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", md: 400 },
              bgcolor: "background.paper",
              p: 4,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Add Missing Charger
            </Typography>
            <form onSubmit={handleFormSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Station Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  margin="normal"
                  size="small"
                />
                <GoogleMapsAutocomplete
                  setAddress={handleAddressSelect}
                  label="Address"
                />
                <TextField
                  type="text"
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Enter address"
                  required // Make the field required in HTML as a basic validation step
                />
                <Box
                  sx={{
                    height: 200,
                    "& .leaflet-container": { height: "100%", width: "100%" },
                  }}
                >
                  <MapContainer
                    center={center}
                    zoom={2}
                    minZoom={6}
                    maxZoom={18}
                    zoomControl={false}
                    ref={mapRef}
                    onClick={handleMapClick}
                  >
                    <TileLayer
                      url="https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=QCJjsLjC3wi0UX43hcRA"
                      attribution=""
                    />
                    {markerVisible && (
                      <Marker
                        position={markerPosition}
                        draggable={true}
                        icon={pinDropIcon}
                        onDragend={handleMarkerDragEnd}
                      >
                        <Popup>Drag me to adjust charger location</Popup>
                      </Marker>
                    )}
                    <div
                      onClick={showMyLocation}
                      className="location_icon_form"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        cursor: "pointer",
                        zIndex: "1000",
                      }}
                    >
                      <IoCompassOutline size="1.8em" />
                    </div>
                  </MapContainer>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Power"
                      value={power}
                      onChange={handleChange}
                      inputProps={{ min: "2", max: "200", step: "2" }}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <CheckboxesTags
                        selectedConnectors={selectedConnectors}
                        setSelectedConnectors={setSelectedConnectors}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>
                  Upload Image
                  <input type="file" hidden onChange={handleImageChange} />
                </Button>
                <React.Fragment>     

                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleClickVariant("success")}
                >
                  Submit
                </Button>
                </React.Fragment>    
              </Stack>
            </form>
          </Box>
        </Modal>
      </SnackbarProvider>
    </div>
  );
}

export default AddChargerModal;
