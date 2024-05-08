import React, { useState } from "react";
import { Stack, Grid, Checkbox, Typography } from "@mui/material";

const ConnectorIcons = () => {
  // Define your icons with src and alt attributes
  const icons = [
    {
      src: require("../assets/img/chademo.svg").default,
      alt: "Connector 1",
      label: "CHAdeMO",
    },
    {
      src: require("../assets/img/combo_css_type2_euro_1.svg").default,
      alt: "Connector 2",
      label: "CCS (Type 2)",
    },
    {
      src: require("../assets/img/domestique_plug.svg").default,
      alt: "Connector 3",
      label: "Shukko ",
    },
    {
      src: require("../assets/img/three_phase3.svg").default,
      alt: "Connector 4",
      label: "Three Phase",
    },
    {
      src: require("../assets/img/type_2.svg").default,
      alt: "Connector 5",
      label: "Type 2",
    },
    {
      src: require("../assets/img/type1_j1772.svg").default,
      alt: "Connector 6",
      label: "J-1772",
    },
    {
      src: require("../assets/img/tesla.svg").default,
      alt: "Connector 7",
      label: "Tesla",
    },
  ];

  const [selectedIcons, setSelectedIcons] = useState([]);

  // Function to toggle selection of an icon
  const toggleIconSelection = (icon) => {
    if (selectedIcons.includes(icon)) {
      setSelectedIcons(selectedIcons.filter((selected) => selected !== icon));
    } else {
      setSelectedIcons([...selectedIcons, icon]);
    }
    console.log("Selected icons:", selectedIcons); // Log selected icons
  };

  // Function to handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedIcons.length === icons.length) {
      setSelectedIcons([]);
    } else {
      setSelectedIcons(icons.map((icon) => icon.alt));
    }
    console.log("Selected icons:", selectedIcons); // Log selected icons
  };

  return (
    <Stack direction="column">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={0.5}
      >
        {/* Select All checkbox */}
        <Checkbox
          checked={selectedIcons.length === icons.length}
          indeterminate={
            selectedIcons.length > 0 && selectedIcons.length < icons.length
          }
          onChange={handleSelectAll} // Assuming this function handles the select all
        />
        <Typography>
          <b>All Connectors</b>
        </Typography>
      </Stack>

      <Grid container spacing={1}>
        {icons.map((icon, index) => (
          <Grid item xs={4} key={index}>
            <Stack direction="column" alignItems="center">
              {/* Icon */}
              <img
                src={icon.src}
                alt={icon.alt}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%", // Make border rounded like a circle
                  cursor: "pointer",
                  // Add pointer cursor
                  border: selectedIcons.includes(icon.alt)
                    ? "2px solid green"
                    : "none", // Add border if icon is selected

                  backgroundColor: selectedIcons.includes(icon.alt)
                    ? "rgba(0, 255, 0, 0.2)"
                    : "transparent",
                }}
                onClick={() => toggleIconSelection(icon.alt)} // Toggle selection on click
              />
              {/* Label */}
              <Typography variant="body2">{icon.label}</Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default ConnectorIcons;
