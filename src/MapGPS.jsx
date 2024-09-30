import React, { useState } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

function FindUser()
 {
    const [position, setPosition] = useState(null)
    const map = useMapEvents({
      click() {
        map.locate({enableHighAccuracy: true})
      },
      locationfound(e) {
        setPosition(e.latlng)
        map.flyTo(e.latlng, map.getZoom())
      },
    });

    return position === null ? null : (
      <Marker position = {position}>
        <Popup>You are here</Popup>
      </Marker>
    );
 }

function MapGPS(){

    return(
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
<FindUser></FindUser>
</MapContainer>
    );
}

export default MapGPS
