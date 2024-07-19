// Import necessary components and hooks
import React, { useState, useEffect, useRef } from "react";
import { TextField, Box,InputAdornment } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import parse from "autosuggest-highlight/parse";
import { debounce } from "@mui/material/utils";
import SearchIcon from '@mui/icons-material/Search';
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
  } from 'react-places-autocomplete';


// Ensure you have the Google Maps script loaded
const loadGoogleMaps = (apiKey) => {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById("google-maps-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.id = "google-maps-script";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load"));
      document.body.appendChild(script);
    } else {
      resolve();
    }
  });
};

const GoogleMapsAutocomplete = ({ setAddress, placeholder, label = "", style = {}, className = "", isMap = false }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const autocompleteService = useRef(null);
  const [address, setAddressLocal] = React.useState("");


  useEffect(() => {
    loadGoogleMaps("AIzaSyCuga0rxBnch_BCzWW1NA8WJdrTcvdfbpo")
      .then(() => {
        if (window.google && !autocompleteService.current) {
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
        }
      })
      .catch((error) =>
        console.error("AIzaSyCuga0rxBnch_BCzWW1NA8WJdrTcvdfbpo", error)
      );
  }, []);

  const fetch = useRef(
    debounce((request, callback) => {
      autocompleteService.current?.getPlacePredictions(request, callback);
    }, 200)
  ).current;

  useEffect(() => {
    if (inputValue === "") {
      setOptions([]);
      return;
    }

    fetch({ input: inputValue }, (results) => {
      setOptions(results || []);
    });
  }, [inputValue, fetch]);
  const handleSelect = async value => {
        setAddressLocal(value);
        geocodeByAddress(value)
            .then(results => getLatLng(results[0]))
            .then(latLng => console.log('Success', latLng))
            .catch(error => console.error('Error', error));

        setAddress(value);  // Pass the selected address back to the parent component
    };

    const handleChange = address => {
        setAddressLocal(address);
    };


  useEffect(() => {
    if (inputValue === "") {
      setOptions([]);
      return;
    }

    fetch({ input: inputValue }, (results) => {
      setOptions(results || []);
    });
  }, [inputValue, fetch]);

  

  return (
    <Autocomplete
    freeSolo
    inputValue={inputValue}
    onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
    options={options}
    getOptionLabel={(option) => typeof option === "string" ? option : option.description}
    renderInput={(params) => (
        <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        variant="outlined"
        fullWidth
        InputProps={{
          ...params.InputProps,
          style: isMap ? { backgroundColor: 'white', borderRadius: '25px' } : {},
          endAdornment: (
            <InputAdornment justify-content= "flex-end" position="absolute" >
              <SearchIcon />
            </InputAdornment>
          )
        }}
      />
    )}
    onChange={(event, newValue) => {
      setAddress(newValue?.description || "");
    }}
      renderOption={(props, option) => {
        const matches =
          option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match) => [match.offset, match.offset + match.length])
        );
        

        return (
          <li {...props}>
            <Box component="span" sx={{ fontWeight: "bold" }}>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{ fontWeight: part.highlight ? "bold" : "normal" }}
                >
                  {part.text}
                </span>
              ))}
            </Box>
            <Box component="span" sx={{ color: "text.secondary" }}>
              {option.structured_formatting.secondary_text}
            </Box>
          </li>
        );
      }}
    />
  );
};
export default GoogleMapsAutocomplete;
