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
        L.latLng(51.76335, -1.237869),
        L.latLng(51.75957, -1.23549)
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
    way["highway"](around:500,51.75803,-1.26201);
    out body;     // First output for ways and their tags/nodes
    (._;>;);      // This grabs the related nodes (node IDs from ways)
    out skel qt;  // Output the node data with latitudes and longitudes
    `;

    axios.post('https://overpass-api.de/api/interpreter', (query))
      .then(res => {
        setRoadData(res.data)
        console.log(res.data)

        const nodesMap = {};

        res.data.elements.forEach(element => {
          if (element.type === 'way') {
            const wayNodes = element.nodes; //store the node array but we cant get coordinate from this 
            wayNodes.forEach(nodeId => {
              const node = res.data.elements.find(n => n.id === nodeId);
              if (node) {
                nodesMap[nodeId] = { lat: node.lat, lon: node.lon };
              }
            })
          }
        })
        console.log('Nodes:', nodesMap);

      })
      .catch(err => {
        console.log(err)
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
      <MapContainer style={{ height: "500px", width: "800%" }} center={[51.758038, -1.26201]} zoom={15} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[51.758038, -1.26201]}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        <Marker position={[51.761207, -1.267475]}></Marker>
        <Marker position={[51.76965, -1.254212]}></Marker>
        <Marker position={[51.74778, -1.23687]}></Marker>
        <Marker position={[51.749406, -1.26109]}></Marker>
        <FindUser isLocating={isLocating} setIsLocating={setIsLocating}></FindUser>
        <Route />
      </MapContainer>
    </div>
  );
}

export default MapGPS

// learn adjacency list for graphs
// learn to build graph from coordinates
// learn the pathfinding algorithms 
// learn how to use deckGL