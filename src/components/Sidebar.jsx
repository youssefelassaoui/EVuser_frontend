import React, { useState, useEffect } from "react";

import MarkersMap from "./map";
import { FaBars, FaTimes } from "react-icons/fa";

import AddChargerModal from "./AddChargerModal";

import CustomizedAccordions from "./Accordioncpt";
// import AccordionDetails from '@mui/material/AccordionDetails';
// import AccordionSummary from '@mui/material/AccordionSummary';

// import { NavLink } from "react-router-dom";
import { Grid, Stack } from "@mui/material";
// import { faLeftLong } from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [powerFilter, setPowerFilter] = useState(0);
  const [selectedConnectors, setSelectedConnectors] = useState([]);

  // Example check for unnecessary re-renders
  useEffect(() => {
    console.log("MarkersMap rendering with", selectedConnectors);
  }, [selectedConnectors]); // Debugging to track re-renders

  const handlePowerChange = (newValue) => {
    setPowerFilter(newValue);
  };
  const handleConnectorChange = (connectors) => {
    setSelectedConnectors(connectors);
};

  return (
    <>
      {/* style={{width: isOpen ? "400px" : "50px"}} className="sidebar"÷ */}
      {/* style={{width: isOpen ? "74.2%" : "96.2%"}} */}

      <Grid container>
        {!isOpen && (
          <Grid item xs={0.3}>
            <Stack height={"100%"}>
              <FaBars
                onClick={toggle}
                style={{ padding: 13, fontSize: "23px" }}
              />
            </Stack>
          </Grid>
        )}
        <Grid item xs={isOpen ? 3 : 0}>
          {isOpen && (
            <Stack direction={"column"}>
              <div className="">
                <Stack
                  direction={"row"}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <a
                    href="http://localhost:3001/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      alt="..."
                      src={require("../assets/img/logo.png")}
                      height="50px"
                      style={{ padding: "10px" }}
                      className="logo"
                    />
                  </a>

                  {/* <h1 style={{display: isOpen ? "block" : "none"}} className="logo">Logo</h1> */}
                  <FaTimes onClick={toggle} style={{ padding: "10px" }} />
                </Stack>

                <div
                  style={{
                    marginLeft: isOpen ? "306px" : "0px",
                    marginTop: isOpen ? "-15px" : "0px",
                  }}
                  className="bars"
                ></div>
                <div
                  style={{
                    display: isOpen ? "block" : "none",
                    marginTop: isOpen ? "50px" : "none",
                  }}
                ></div>
                <CustomizedAccordions
                  onChange={handlePowerChange}
                  onConnectorChange={handleConnectorChange}
                />
                <AddChargerModal />
              </div>
            </Stack>
          )}
        </Grid>
        <Grid item xs={isOpen ? 8.9 : 11.6}>
          <MarkersMap
            powerFilter={powerFilter}
            selectedConnectors={selectedConnectors}
          />
        </Grid>
      </Grid>
      {/* <Accordioncpt/> */}
      {/* <MapWrapper /> */}
    </>
  );
};

export default Sidebar;
