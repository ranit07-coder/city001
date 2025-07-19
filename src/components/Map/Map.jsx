import React from 'react';
import './map.css';
import filter from '../../assets/filter.png';
import navigation from '../../assets/navigation.png';

const Map = () => {
  return (
    <div className="map">

      <button className="filter">
        <div className="map-filter">
          <img src={filter} alt="" className='filterimg' />
        </div>
        <div className="filter-title">Filters</div>
      </button>

      <button className="location">
        <div className="my-location">
          <img src={navigation} alt="" className='navigation' />
        </div>
        <div className="location-title">My Location</div>
      </button>

    </div>
  );
};

export default Map;

