import React, { useState, useEffect } from "react";
import { Stack, Grid, Checkbox, Typography } from "@mui/material";

const ConnectorIcons = ({ onConnectorChange, onSelectAll }) => {
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
      label: "Shukko",
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

  // Initialize selectedIcons state with all connector labels
  const [selectedIcons, setSelectedIcons] = useState(
    icons.map((icon) => icon.label)
  );

  // Handle icon selection toggle
  const toggleIconSelection = (label) => {
    const newSelection = selectedIcons.includes(label)
      ? selectedIcons.filter((selected) => selected !== label)
      : [...selectedIcons, label];
    setSelectedIcons(newSelection);
    onConnectorChange(newSelection); // Notify the parent component
  };

  // Handle select/deselect all
  const handleSelectAll = () => {
    const allIcons = icons.map((icon) => icon.label);
    const newSelectedIcons =
      selectedIcons.length === allIcons.length ? [] : allIcons;
    setSelectedIcons(newSelectedIcons);
    onSelectAll(newSelectedIcons.length === allIcons.length);
  };

  // Effect to set all selected on initial mount
  useEffect(() => {
    onSelectAll(true);
  }, [onSelectAll]); // Include onSelectAll in the dependency array

  return (
    <Stack direction="column">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-start"
        spacing={0.5}
      >
        <Checkbox
          checked={selectedIcons.length === icons.length}
          indeterminate={
            selectedIcons.length > 0 && selectedIcons.length < icons.length
          }
          onChange={handleSelectAll}
        />
        <Typography>
          <b>All Connectors</b>
        </Typography>
      </Stack>
      <Grid container spacing={1}>
        {icons.map((icon, index) => (
          <Grid item xs={4} key={index}>
            <Stack direction="column" alignItems="center">
              <img
                src={icon.src}
                alt={icon.label}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  cursor: "pointer",
                  border: selectedIcons.includes(icon.label)
                    ? "2px solid green"
                    : "none",
                  backgroundColor: selectedIcons.includes(icon.label)
                    ? "rgba(0, 255, 0, 0.2)"
                    : "transparent",
                }}
                onClick={() => toggleIconSelection(icon.label)}
              />
              <Typography variant="body2">{icon.label}</Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default ConnectorIcons;
