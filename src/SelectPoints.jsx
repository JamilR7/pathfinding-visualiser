import React, { useState } from 'react'
import { Marker, Popup, useMapEvents } from 'react-leaflet';

const SelectPoints = ({ selectedPoints, setSelectedPoints }) => {
    const map = useMapEvents({
        click(e) { 
            if (selectedPoints.length < 2) {
                setSelectedPoints([...selectedPoints, e.latlng]);
            }
            else
            {
                setSelectedPoints([e.latlng]);
            }
        }
    });
    return null;
}

export default SelectPoints;