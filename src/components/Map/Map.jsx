import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

const Map = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('streets');

  const mapStyles = {
    streets: 'https://api.maptiler.com/maps/streets/style.json?key=KdLhMN46zBrXqGDvET6g',
    satellite: 'https://api.maptiler.com/maps/satellite/style.json?key=KdLhMN46zBrXqGDvET6g',
    hybrid: 'https://api.maptiler.com/maps/hybrid/style.json?key=KdLhMN46zBrXqGDvET6g',
    basic: 'https://api.maptiler.com/maps/basic/style.json?key=KdLhMN46zBrXqGDvET6g',
    outdoor: 'https://api.maptiler.com/maps/outdoor/style.json?key=KdLhMN46zBrXqGDvET6g'
  };

  const changeMapStyle = (styleName) => {
    if (mapInstance.current && mapStyles[styleName]) {
      mapInstance.current.setStyle(mapStyles[styleName]);
      setCurrentStyle(styleName);
      setShowFilters(false);
    }
  };

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: mapStyles[currentStyle],
        center: [77.5946, 12.9716],
        zoom: 12,
        attributionControl: true
      });

      mapInstance.current.on('load', () => {
        mapInstance.current.addControl(
          new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true
          })
        );

        markerRef.current = new maplibregl.Marker({
          color: "#FF0000",
          draggable: false
        })
          .setLngLat([77.5946, 12.9716])
          .addTo(mapInstance.current);
      });
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, 
);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstance.current.setCenter([longitude, latitude]);
          mapInstance.current.setZoom(14);

          if (markerRef.current) {
            markerRef.current.remove();
          }

          markerRef.current = new maplibregl.Marker()
            .setLngLat([longitude, latitude])
            .addTo(mapInstance.current);
        },
        (error) => {
          setError(error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="map">
      <div className="map-controls">
        <div className="controls-container">
          <button className="filter" onClick={() => setShowFilters(!showFilters)}>
            Filters
          </button>
          
          {showFilters && (
            <div className="filter-options">
              <button onClick={() => changeMapStyle('streets')}>Streets</button>
              <button onClick={() => changeMapStyle('satellite')}>Satellite</button>
              <button onClick={() => changeMapStyle('hybrid')}>Hybrid</button>
              <button onClick={() => changeMapStyle('basic')}>Basic</button>
              <button onClick={() => changeMapStyle('outdoor')}>Outdoor</button>
            </div>
          )}

          <button className="location" onClick={handleLocationClick}>
            My Location
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      <div ref={mapRef} className="map-container" />
    </div>
  );
};

export default Map;