 import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { IoFilterCircleOutline } from "react-icons/io5";
import Slider from "@mui/material/Slider";
import { GrMapLocation } from "react-icons/gr";
import ConnectorIcons from "./ConnectorIcons"; // Import ConnectorIcons component
import { Stack, Grid } from "@mui/material"; // Import Stack and Grid
import evstationIcon_slow from "./map";



const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "20px",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Add shadow
  marginBottom: theme.spacing(0), // Add space between each accordion item
  // "&:hover": {
  //   backgroundColor: theme.palette.action.hover, // Change background color on hover
  // },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark",
  // ? "rgba(255, 255, 255, .05)"
  // : "rgba(0, 0, 0, .03)",
  flexDirection: "row-verse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
    borderRadius: "10px",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(2),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export default function CustomizedAccordions({ onChange, onConnectorChange }) {
  const [expanded, setExpanded] = React.useState("panel1");
  const [powerValue, setPowerValue] = React.useState(0);
  const handlePowerChange = (event, newValue) => {
    setPowerValue(newValue); // Update power value state
  };
  const handleConnectorChange = (selectedConnectors) => {
    console.log("Received selected connectors in Accordion:", selectedConnectors);
    onConnectorChange(selectedConnectors);
};


  // Function to format the value of the slider
  const valuetext = (value) => {
    return `${value} kW`;
  };

  // Function to handle the power filter change and pass it to the parent component
  const handleFilterChange = () => {
    console.log("Final power value being sent:", powerValue);
    onChange(powerValue);
};


  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  return (
    <Stack spacing={2}>
      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
          sx={{
            "&:hover": {
              backgroundColor: "#e6f7ff", // Light blue background on hover
              cursor: "pointer",
              borderRadius: expanded === "panel1" ? "20px 20px 0 0" : "20px", // Adjust border radius
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Add shadow on hover
            },
            borderRadius: expanded === "panel1" ? "20px 20px 0 0" : "0", // Adjust border radius
            // Apply border radius when accordion is open
            backgroundColor: expanded === "panel1" ? "#e6f7ff" : "transparent", // Light blue background when accordion is open
          }}
        >
          <Typography style={{ display: "flex", alignItems: "center" }}>
            <GrMapLocation
              color="green"
              fontSize={20}
              style={{ marginRight: "20px" }}
            />
            Map Legend
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Grid item xs={4}>
              <Stack direction="column" alignItems="center">
                <img
                  src={require("../assets/img/evstationicon_slow.svg").default}
                  alt="EV Station Icon"
                  style={{ width: "50px", height: "50px" }}
                />
                <Typography variant="body2">Slow Charging</Typography>
              </Stack>
            </Grid>
            {/* Image 1 */}
            <Grid item xs={4}>
              <Stack direction="column" alignItems="center">
                <img
                  src={require("../assets/img/evstationIcon.svg").default}
                  alt="EV Station Icon"
                  style={{ width: "50px", height: "50px" }}
                />
                <Typography variant="body2">Fast Charging</Typography>
              </Stack>
            </Grid>
            {/* Image 2 */}

            {/* Image 3 */}
            <Grid item xs={4}>
              <Stack direction="column" alignItems="center">
                <img
                  src={
                    require("../assets/img/evstationicon_super_rapid.svg")
                      .default
                  }
                  alt="EV Station Icon"
                  style={{ width: "50px", height: "50px" }}
                />
                <Typography variant="body2">Super Rapid Charging</Typography>
              </Stack>
            </Grid>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary
          aria-controls="panel2d-content"
          id="panel2d-header"
          sx={{
            "&:hover": {
              backgroundColor: "#e6f7ff", // Light blue background on hover
              cursor: "pointer",
              borderRadius: expanded === "panel2" ? "20px 20px 0 0" : "20px", // Adjust border radius
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Add shadow on hover
            },
            borderRadius: expanded === "panel2" ? "20px 20px 0 0" : "0", // Adjust border radius
            // Apply border radius when accordion is open
            backgroundColor: expanded === "panel2" ? "#e6f7ff" : "transparent", // Light blue background when accordion is open
          }}
        >
          <Typography
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <IoFilterCircleOutline
              color="green"
              fontSize={27}
              style={{ width: "27px", height: "27px", marginRight: "12px" }} // Adjust width and height as needed
            />
            Filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {" "}
            <Grid
              item
              xs={12}
              sm={12}
              style={{ position: "relative", marginBottom: "20px" }}
            >
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "20px",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Power
                </Typography>
                <Slider
                  onChange={handlePowerChange}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="auto"
                  shiftStep={0}
                  min={0}
                  max={160}
                  onChangeCommitted={handleFilterChange}
                />
                <Typography
                  variant="subtitle1"
                  style={{
                    position: "absolute",
                    top: "31px",
                    right: "12px",
                    fontSize: "0.8rem",
                  }}
                >
                  kW
                </Typography>
              </div>
            </Grid>
            <Grid item xs={12} sm={12}>
              <div
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "20px",
                }}
              >
                <ConnectorIcons onConnectorChange={handleConnectorChange} />
              </div>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}