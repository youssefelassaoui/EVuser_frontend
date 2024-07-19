import { useState, useEffect, useCallback } from "react";

const useGeoLocation = (onLocationReceived) => {
  const [location, setLocation] = useState({
    loaded: false,
    coordinates: { lat: "", lng: "" },
  });

  const onSuccess = useCallback(
    (location) => {
      setLocation({
        loaded: true,
        coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      });
      if (onLocationReceived) {
        onLocationReceived(location.coords.latitude, location.coords.longitude);
      }
    },
    [onLocationReceived]
  );

  const onError = useCallback((error) => {
    setLocation({
      loaded: true,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      onError({
        code: 0,
        message: "Geolocation not supported",
      });
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, [onSuccess, onError]);

  return location;
};

export default useGeoLocation;
