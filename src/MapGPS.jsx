import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import FindUser from './FindUser';
import Route from './Route';
//routing
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
//api
import axios from 'axios'


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

        //grabbing ways
        const ways = res.data.elements.filter(element => element.type === 'way' && element.tags && element.tags.highway);
        console.log('Ways:', ways);

        const nodesMap = {}; //storing lat lon coordinates for all nodes
        const nodeUsageCount = {}; //checking whether a node is shared between other ways hence an intersection point
        const adjacencyList = {};

        //algorithm to determine intersection points
        ways.forEach(way => {
          way.nodes.forEach(nodeId => {
            if (nodeUsageCount[nodeId]) {
              nodeUsageCount[nodeId]++;
            }
            else {
              nodeUsageCount[nodeId] = 1;
            }
          });
        });

        //sets are unique so add intersection points into a set
        const IntersectionNodes = new Set(
          Object.keys(nodeUsageCount).filter(nodeId => nodeUsageCount[nodeId] > 1)
        );

        console.log('Intersections:', IntersectionNodes);

        function calculateDistance(currentLat, currentLon, nextLat, nextLon) {
          //Harvesine Formula Implementation

          const earthRadius = 6371e3;
          const convertToRadians = angle => (angle * Math.PI) / 180;

          const φ1 = convertToRadians(currentLat);
          const φ2 = convertToRadians(nextLat);
          const Δφ = convertToRadians(nextLat - currentLat);
          const Δλ = convertToRadians(nextLon - currentLon);

          const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
          const c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1 - a));

          return earthRadius * c;
        }

        //grabbing the node array making up ways and then for each node in that array we search for its corresponding nodeId to grab the lat and lon
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

        ways.forEach(way => {
          const wayNodes = way.nodes;
          const checkOneWay = way.tags.oneway === 'yes' || way.tags.oneway === 'true';

          for (let i = 0; i < wayNodes.length - 1; i++) {
            const currentNodeId = wayNodes[i];
            const nextNodeId = wayNodes[i+1];

            const currentNode = nodesMap[currentNodeId];
            const nextNode = nodesMap[nextNodeId];
            
            let distance;

            if (currentNode && nextNode) {
              distance = calculateDistance(
                currentNode.lat,
                currentNode.lon,
                nextNode.lat,
                nextNode.lon
            );
            }

            if (!adjacencyList[currentNodeId]) {
              adjacencyList[currentNodeId] = [];
            }

            adjacencyList[currentNodeId].push({
              neighbor: nextNodeId,
              distance: distance,
            });

            if (!checkOneWay) {
              if (!adjacencyList[nextNodeId]) {
                adjacencyList[nextNodeId] = [];
              }

              adjacencyList[nextNodeId].push({
                neighbour: currentNodeId,
                distance: distance,
            });
          }
        }
      });

        console.log("Adjacency List: ", adjacencyList);
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