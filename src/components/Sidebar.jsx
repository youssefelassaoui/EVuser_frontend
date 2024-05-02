import React, { useState } from 'react';
import MapWrapper from '../pages/MapWrapper';
import MarkersMap from './map';
import {
    FaTh,
    FaBars,
    FaTimes,
    FaUserAlt,
    FaRegChartBar,
    FaCommentAlt,
    FaShoppingBag,
    FaThList
}from "react-icons/fa";

import Input from '@mui/joy/Input';


import Accordioncpt from './Accordioncpt';
// import AccordionDetails from '@mui/material/AccordionDetails';
// import AccordionSummary from '@mui/material/AccordionSummary';

import { NavLink } from 'react-router-dom';


const Sidebar = ({children}) => {
    const[isOpen ,setIsOpen] = useState(false);
    const toggle = () => setIsOpen (!isOpen);
    
    // const menuItem=[
    //     {
    //         path:"/",
    //         name:"Dashboard",
    //         icon:<FaTh/>
    //     },
    //     {
    //         path:"/MapWrapper",
    //         name:"MapWrapper",
    //         icon:<FaUserAlt/>
    //     },
    //     {
    //         path:"/analytics",
    //         name:"Analytics",
    //         icon:<FaRegChartBar/>
    //     },
    //     {
    //         path:"/comment",
    //         name:"Comment",
    //         icon:<FaCommentAlt/>
    //     },
    //     {
    //         path:"/product",
    //         name:"Product",
    //         icon:<FaShoppingBag/>
    //     },
    //     {
    //         path:"/productList",
    //         name:"Product List",
    //         icon:<FaThList/>
    //     }
    // ]
    return (
        <div className="container">
           <div style={{width: isOpen ? "400px" : "50px"}} className="sidebar">
               <div className="top_section">
               <img
                  alt="..."
                  src={require("../assets/img/logo.png")}
                  height="50px"
                  style={{display: isOpen ? "block" : "none"}} className="logo">

                  </img>
                
                   {/* <h1 style={{display: isOpen ? "block" : "none"}} className="logo">Logo</h1> */}
                   
                   <div style={{marginLeft: isOpen ? "306px" : "0px" , marginTop: isOpen ? "-15px" : "0px"}} className="bars">
                   {isOpen ? <FaTimes onClick={toggle} /> : <FaBars onClick={toggle} />}
                   </div>
                   
               </div>
               <div style={{display: isOpen ? "block" : "none" , marginTop: isOpen ? "50px" : "none"}}>
               <Accordioncpt /> 
               

              
               </div>
              
             
               {/* {
                   menuItem.map((item, index)=>(
                       <NavLink to={item.path} key={index} className="link" activeclassName="active">
                           <div className="icon">{item.icon}</div>
                           <div style={{display: isOpen ? "block" : "none"}} className="link_text">{item.name}</div>
                       </NavLink>
                   ))
               } */}
           </div>
           {/* <Accordioncpt/> */}
           <div style={{width: isOpen ? "74.2%" : "96.2%"}}>

    
 
           <MarkersMap/>
          {/* <MapWrapper /> */}
          </div>
        </div>
    );
};

export default Sidebar;