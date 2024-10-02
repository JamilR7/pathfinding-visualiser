import React, { useState } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

function FindUser({ isLocating, setIsLocating }) {
  const [position, setPosition] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const map = useMapEvents({
    locationfound: (location) => {
      if (isLocating) {
        setPosition(location.latlng)
        setAccuracy(location.accuracy); // Store the accuracy in meters
        map.flyTo(location.latlng, map.getZoom());
        setIsLocating(false);
      }
    }
  })

  if (isLocating) {
    map.locate({ maximumAge: 0, enableHighAccuracy: true });
  }

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        You are here
        Accuracy: {accuracy ? `${accuracy} meters` : 'Unknown'} {/* Display the accuracy */}
      </Popup>
    </Marker>
  )

}

function MapGPS() {

  const [isLocating, setIsLocating] = useState(false);

  const handleButtonClick = () => {
    setIsLocating(true);
  };

  return (
    <div>
      <button
        className='FindUserButton'
        onClick={handleButtonClick}
      >
        Detect location
      </button>
      <MapContainer style={{ height: "500px", width: "800%" }} center={[54.0104, -2.7877]} zoom={15} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.505, -0.09]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <Marker position={[54.00375, -2.788841]}></Marker>
        <Marker position={[54.0102751, -2.7854227]}></Marker>
        <Marker position={[54.010122, -2.7852353]}></Marker>
        <Marker position={[54.007509, -2.784629]}></Marker>
        <FindUser isLocating={isLocating} setIsLocating={setIsLocating}></FindUser>
        <FindUser isLocating={isLocating} setIsLocating={setIsLocating}></FindUser>
      </MapContainer>
    </div>
  );
}

export default MapGPS
