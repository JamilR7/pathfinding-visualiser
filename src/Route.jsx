import { useEffect } from 'react'
import { useMap } from 'react-leaflet';
import L, { Map, map } from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';

const Route = () => {
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

  export default Route;