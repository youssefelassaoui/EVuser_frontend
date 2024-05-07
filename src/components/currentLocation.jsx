import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const useGeoLocation = (onLocationReceived) => {
    const [location, setLocation] = useState({
        loaded: false,
        coordinates: { lat: "", lng: "" },
    });

    useEffect(() => {
        const onSuccess = (location) => {
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
        };

        const onError = (error) => {
            setLocation({
                loaded: true,
                error: {
                    code: error.code,
                    message: error.message,
                },
            });
        };

        if (!("geolocation" in navigator)) {
            onError({
                code: 0,
                message: "Geolocation not supported",
            });
        }

        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }, [onLocationReceived]);

    return location;
};

const MyMap = () => {
    const location = useGeoLocation();
    const map = useMap();

    useEffect(() => {
        if (location.loaded) {
            map.flyTo([location.coordinates.lat, location.coordinates.lng], 13);
        }
    }, [location.loaded, location.coordinates, map]);

    return (
        <MapContainer center={[0, 0]} zoom={13} style={{ height: '400px' }}>
            <TileLayer
                url="https://api.maptiler.com/maps/topo-v2/256/{z}/{x}/{y}.png?key=QCJjsLjC3wi0UX43hcRA"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {location.loaded && (
                <Marker position={[location.coordinates.lat, location.coordinates.lng]}>
                    <Popup>Your current location</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MyMap;
