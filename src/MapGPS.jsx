import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
//routing
import L, { Map, map } from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import axios from 'axios'


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

function Route() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(53.4280054, -2.1992618),
        L.latLng(54.007509, -2.784629)
      ],
      routeWhileDragging: true
    }).addTo(map)

    return () => map.removeControl(routingControl);
  }, [map])
  return null;
}




function MapGPS() {

  const [isLocating, setIsLocating] = useState(false);
  const [roadData, setRoadData] = useState(null);

  const handleButtonClick = () => {
    setIsLocating(true);
  };

  useEffect(() => {

    const query = `
    [out:json];
    way["highway"](around:500,54.00375, -2.788841);

    out body;
    >;
    out skel qt;
  `;

    axios.post('https://overpass-api.de/api/interpreter', (query))
      .then(res => {
        setRoadData(res.data)
        console.log(res.data)
      })
      .catch(err => {

      })
  }, []);


  return (
    <div>
      <button
        className='FindUserButton'
        onClick={handleButtonClick}
      >
        Detect location
      </button>
      {roadData ? <p>Road data loaded!</p> : <p>Loading road data...</p>}
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
        <Route />
      </MapContainer>
    </div>
  );
}

export default MapGPS

// learn to use axios
// write overpass query
// call query using overpass
// start with highway data
