import React, { useState } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet';

const FindUser = ({ isLocating, setIsLocating }) => {
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

  export default FindUser;