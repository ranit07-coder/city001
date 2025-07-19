import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import filter from '../../assets/filter.png';
import navigation from '../../assets/navigation.png';

const Map = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapInstance.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=KdLhMN46zBrXqGDvET6g`,
        center: [77.5946, 12.9716], // Bengaluru coordinates
        zoom: 12,
        attributionControl: true
      });

      // Wait for map to load before adding marker
      mapInstance.current.on('load', () => {
        // Add navigation controls
        mapInstance.current.addControl(
          new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true
          })
        );

        // Add initial marker
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
  }, []);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setLngLat([longitude, latitude]);
        }

        // Fly to user location
        mapInstance.current.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          essential: true,
          duration: 2000 // Animation duration in milliseconds
        });

        setError(null);
      },
      (error) => {
        setError('Unable to get your location. Please check your permissions.');
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <div className="map">
      <button className="filter">
        <div className="map-filter">
          <img src={filter} alt="" className='filterimg' />
        </div>
        <div className="filter-title">Filters</div>
      </button>

      <button className="location" onClick={handleLocationClick}>
        <div className="my-location">
          <img src={navigation} alt="" className='navigation' />
        </div>
        <div className="location-title">My Location</div>
      </button>

      {error && <div className="error-message">{error}</div>}
      <div ref={mapRef} className="map-container" />
    </div>
  );
};

export default Map;

