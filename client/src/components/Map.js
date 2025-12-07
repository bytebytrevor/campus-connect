import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ events, buildings, onMarkerClick }) => {
  const position = [34.0722, -118.4452]; // Default position (UCLA)

  return (
    <MapContainer center={position} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {buildings.map(building => (
        <Marker key={`building-${building.id}`} position={[building.coordinates.lat, building.coordinates.lng]}>
          <Popup>{building.name}</Popup>
        </Marker>
      ))}
      {events.map(event => {
        // Find building for event to get coordinates
        const building = buildings.find(b => b.name === event.location);
        if (!building) return null;

        return (
          <Marker 
            key={`event-${event.id}`} 
            position={[building.coordinates.lat, building.coordinates.lng]}
            eventHandlers={{
              click: () => {
                onMarkerClick(event);
              },
            }}
          >
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
