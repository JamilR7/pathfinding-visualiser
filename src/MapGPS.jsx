import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import FindUser from './FindUser';
import Route from './Route';
import SelectPoints from './selectPoints';
//routing
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
//api
import axios from 'axios'
//animation

function MapGPS() {

  const [isLocating, setIsLocating] = useState(false);
  const [roadData, setRoadData] = useState(null);
  const [path, setPath] = useState(null);
  const [adjacencyList, setAdjacencyList] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [nodesMap, setNodesMap] = useState(null)
  const [evaluatingNode, setEvaluatingNode] = useState([])
  const [isFinished, setIsFinished] = useState(false);

  const handleButtonClick = () => {
    setIsLocating(true);
  };

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


  useEffect(() => {

    const query = `
    [out:json];
    way["highway"](around:5000,51.75803,-1.26201);
    out body;     // First output for ways and their tags/nodes
    (._;>;);      // This grabs the related nodes (node IDs from ways)
    out skel qt;  // Output the node data with latitudes and longitudes
    `;

    axios.post('https://overpass-api.de/api/interpreter', (query))
      .then(res => {
        setRoadData(res.data)
        //console.log(res.data)

        //grabbing ways
        const ways = res.data.elements.filter(element => element.type === 'way' && element.tags && element.tags.highway);
        //console.log('Ways:', ways);

        const newNodesMap = {}; //storing lat lon coordinates for all nodes
        const nodeUsageCount = {}; //checking whether a node is shared between other ways hence an intersection point
        const adjacency = {};

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

        //console.log('Intersections:', IntersectionNodes);

        //grabbing the node array making up ways and then for each node in that array we search for its corresponding nodeId to grab the lat and lon
        res.data.elements.forEach(element => {
          if (element.type === 'way') {
            const wayNodes = element.nodes; //store the node array but we cant get coordinate from this 
            wayNodes.forEach(nodeId => {
              const node = res.data.elements.find(n => n.id === nodeId);
              if (node) {
                newNodesMap[nodeId] = { lat: node.lat, lon: node.lon };
              }
            })
          }
        })
        setNodesMap(newNodesMap);
        //console.log('Nodes:', newNodesMap);

        ways.forEach(way => {
          const wayNodes = way.nodes;
          const checkOneWay= false // = way.tags.oneway === 'yes' || way.tags.oneway === 'true';

          for (let i = 0; i < wayNodes.length - 1; i++) {
            const currentNodeId = wayNodes[i];
            const nextNodeId = wayNodes[i+1];

            const currentNode = newNodesMap[currentNodeId];
            const nextNode = newNodesMap[nextNodeId];
            
            let distance;

            if (currentNode && nextNode) {
              distance = calculateDistance(
                currentNode.lat,
                currentNode.lon,
                nextNode.lat,
                nextNode.lon
            );
            }

            if (!adjacency[currentNodeId]) {
              adjacency[currentNodeId] = [];
            }

            adjacency[currentNodeId].push({
              neighbour: nextNodeId,
              distance: distance,
            });

            if (!checkOneWay) {
              if (!adjacency[nextNodeId]) {
                adjacency[nextNodeId] = [];
              }

              adjacency[nextNodeId].push({
                neighbour: currentNodeId,
                distance: distance,
            });
          }
        }
      });

        setAdjacencyList(adjacency);
        //console.log("Adjacency List: ", adjacency);
      })
      .catch(err => {
        console.log(err)
      })
  }, []);

  class PriorityQueue {
    constructor() {
      this.elements = [];
    }

    enqueue(item, priority) {
      this.elements.push({ item, priority });
      this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
      return this.elements.shift().item; 
    }

    isEmpty() {
      return this.elements.length === 0;
    }

    contains(item) {
      return this.elements.some(element => element.item === item);
    }

    getElements() {
      return [...this.elements];
    }
  }

  function heuristic(start, end) {
    const lat1 = nodesMap[start].lat;
    const lon1 = nodesMap[start].lon;
    const lat2 = nodesMap[end].lat;
    const lon2 = nodesMap[end].lon;
    
    return calculateDistance(lat1, lon1, lat2, lon2);
  }

  function aStar(startNode, endNode, adjacencyList) {

    const openSet = new PriorityQueue();

    openSet.enqueue(startNode, 0)

    const cameFrom = {};

    const gScore = {};
    gScore[startNode] = 0;

    const fScore = {};

    fScore[startNode] = heuristic(startNode, endNode);

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue();

      if (cameFrom[current]) {
        const parent = cameFrom[current];
        
        const currentCoordinates = {
          lat: nodesMap[current].lat,
          lon: nodesMap[current].lon
        };
        
        const parentCoordinates = {
          lat: nodesMap[parent].lat,
          lon: nodesMap[parent].lon
        };
    
        setTimeout(() => {
          setEvaluatingNode(prevState => [
            ...prevState, 
            [parentCoordinates, currentCoordinates]
          ]);
        }, 2000);
      }

      if (current == endNode) {
        const path = [];
        let temp = current;
        while (temp in cameFrom) {
          path.push(temp);
          temp = cameFrom[temp];
        }
        path.push(startNode);
        return path.reverse();
     }

      const neighbours = adjacencyList[current] || [];
      neighbours.forEach(({ neighbour, distance }) => {

        const tentativeGScore = gScore[current] + distance;

        if (!(neighbour in gScore) || tentativeGScore < gScore[neighbour]) {
          cameFrom[neighbour] = current;
          gScore[neighbour] = tentativeGScore;

          fScore[neighbour] = gScore[neighbour] + heuristic(neighbour, endNode);

          if (!openSet.contains(neighbour)) {
            openSet.enqueue(neighbour, fScore[neighbour]);
          }
        }
      });
    }
  return null;
}

  function calculateNearestNode(lat, lon) {
    let nearestNode = null;
    let minDistance = Infinity;

    for (const nodeId in nodesMap) {
      const node = nodesMap[nodeId]
      const distance = calculateDistance(lat, lon, node.lat, node.lon);

      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = nodeId;
      }
    }
    return nearestNode;
  }

  useEffect(() => {
    if (startNode && endNode && adjacencyList) {
      const pathNodeIds = aStar(startNode, endNode, adjacencyList);
      if (pathNodeIds) {
        //console.log(pathNodeIds)
        const pathCoordinates = pathNodeIds.map(nodeId => {
          const node = nodesMap[nodeId];
          return {
            lat: node.lat,
            lon: node.lon,
          };
        });
        console.log(pathCoordinates)
        console.log(startNode, endNode)
        setIsFinished(true);

        setTimeout(() => {
          setPath(pathCoordinates);
        }, 2500);

      } else {
        console.log("No path has been found");
      }
    }
  }, [startNode, endNode, adjacencyList]);

  useEffect(() => {
    if (roadData && adjacencyList && selectedPoints.length > 1) {
      const start = calculateNearestNode(selectedPoints[0].lat, selectedPoints[0].lng);
      const end = calculateNearestNode(selectedPoints[1].lat, selectedPoints[1].lng);

      setStartNode(Number(start));
      setEndNode(Number(end));
      setEvaluatingNode([]);
      setPath([])
    }
  }, [selectedPoints, roadData, adjacencyList]);

  return (
    <div>
      <button
        className='FindUserButton'
        onClick={handleButtonClick}
      >
        Detect location
      </button>
      {roadData ? <p>Road data loaded!</p> : <p>Loading road data...</p>}
      <MapContainer style={{ height: "1000px", width: "800%" }} center={[51.758038, -1.26201]} zoom={15} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <SelectPoints selectedPoints={selectedPoints} setSelectedPoints={setSelectedPoints}/>
        {selectedPoints && selectedPoints.map((pos, id) => (
          <Marker key={id} position={pos}>
            <Popup>
              {id === 0 ? 'Start Point': 'End Point'}
            </Popup>
          </Marker>
        ))}
        <FindUser isLocating={isLocating} setIsLocating={setIsLocating}></FindUser>
        {evaluatingNode && <Polyline positions={evaluatingNode} 
            color="orange" 
            weight={3} 
            dashArray="5, 5"/>}
        {path && isFinished && <Polyline positions={path} color="green"/>}
      </MapContainer>
    </div>
  );
}

export default MapGPS

// For later use
// <Route />
// <Marker position={[51.761207, -1.267475]}></Marker>
// <Marker position={[51.76965, -1.254212]}></Marker>
// <Marker position={[51.74778, -1.23687]}></Marker>
// <Marker position={[51.749406, -1.26109]}></Marker>
// <Marker position={[51.758038, -1.26201]}></Marker>
//           <Popup>
// A pretty CSS3 popup. <br /> Easily customizable.
// </Popup>
