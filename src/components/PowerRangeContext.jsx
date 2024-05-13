// PowerRangeContext.js
import React, { createContext, useState, useContext } from 'react';

const PowerRangeContext = createContext();

export const PowerRangeProvider = ({ children }) => {
  const [powerRange, setPowerRange] = useState([0, 160]);

  return (
    <PowerRangeContext.Provider value={{ powerRange, setPowerRange }}>
      {children}
    </PowerRangeContext.Provider>
  );
};

export const usePowerRange = () => useContext(PowerRangeContext);
