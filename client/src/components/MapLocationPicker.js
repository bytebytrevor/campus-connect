import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>You selected this location</Popup>
        </Marker>
    );
};

const MapLocationPicker = ({ onLocationSelect, initialPosition = null }) => {
    const [position, setPosition] = useState(initialPosition);

    useEffect(() => {
        if (position) {
            onLocationSelect(position);
        }
    }, [position, onLocationSelect]);

    // Default center on Nairobi, Kenya
    const defaultCenter = [-1.2864, 36.8172];

    return (
        <div className="w-full h-48 sm:h-64 border border-gray-300 rounded-lg overflow-hidden">
            <MapContainer
                center={position || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
            {position && (
                <div className="p-2 bg-gray-100 text-sm">
                    Selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
};

export default MapLocationPicker;