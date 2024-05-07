import React, { useState } from "react";

const ConnectorIcons = () => {
  const [selectedIcons, setSelectedIcons] = useState([]);

  // Function to toggle selection of an icon
  const toggleIconSelection = (icon) => {
    if (selectedIcons.includes(icon)) {
      setSelectedIcons(selectedIcons.filter((selected) => selected !== icon));
    } else {
      setSelectedIcons([...selectedIcons, icon]);
    }
  };

  // Function to handle "Select All" checkbox
  const handleSelectAll = () => {
    if (selectedIcons.length === icons.length) {
      setSelectedIcons([]);
    } else {
      setSelectedIcons(icons.map((icon) => icon.alt));
    }
  };

  // Define your icons with src and alt attributes
  const icons = [
    {
      src: require("../assets/img/chademo.svg").default,
      alt: "Connector 1",
      label: "Chademo",
    },
    {
      src: require("../assets/img/combo_css_type2_euro_1.svg").default,
      alt: "Connector 2",
      label: "Combo CSS Type2 Euro",
    },
    {
      src: require("../assets/img/domestique_plug.svg").default,
      alt: "Connector 3",
      label: "Domestique ",
      
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
      label: "Type 1 J1772",
    },
    {
      src: require("../assets/img/tesla.svg").default,
      alt: "Connector 7",
      label: "Tesla",
    },
    {
      src: require("../assets/img/cce_plug.svg").default,
      alt: "Connector 8",
      label: "CCE Plug",
    },
  ];

  return (
    <div className="connector-icons-container">
      <div className="select-all">
        {/* Select All checkbox */}
        <input
          type="checkbox"
          checked={selectedIcons.length === icons.length}
          onChange={handleSelectAll}
        />
        <label>Select All</label>
      </div>
      <div className="icon-grid">
        {icons.map((icon, index) => (
          <div key={index} className="icon-wrapper">
            {/* Icon */}
            <img
              src={icon.src}
              alt={icon.alt}
              style={{
                width: "50px",
                height: "50px",
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
            <label style={{ fontSize: "12px" }}>{icon.label}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectorIcons;
