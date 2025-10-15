import React from 'react';
import './MyArea.css';
import { FiNavigation, FiThermometer, FiRefreshCw, FiEye, FiUmbrella, FiSunrise, FiSunset, FiClock, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import { WiHumidity, WiBarometer, WiStrongWind } from 'react-icons/wi';

const MyArea = ({ 
  userAreaName, 
  isLoadingLocation, 
  lastUpdated, 
  getUserLocation, 
  areaWeather, 
  weatherForecast,
  formatTime,
  getWeatherIcon,
  groupForecastByDay,
  trafficIncidents
}) => {
  return (
    <>
      <div className="my-area-header">
        <div className="location-info">
          <div className="location-display">
            <FiNavigation className="location-icon" />
            <h2>{isLoadingLocation ? "Detecting your location..." : userAreaName || "Your Location"}</h2>
          </div>
          {lastUpdated && (
            <div className="last-updated">
              <span className="update-label">Last updated:</span> 
              <span className="update-time">{lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <button 
          className="location-refresh-btn" 
          onClick={getUserLocation} 
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>
              <div className="mini-spinner"></div>
              <span>Locating...</span>
            </>
          ) : (
            <>
              <FiRefreshCw className="refresh-icon" />
              <span>Refresh Weather</span>
            </>
          )}
        </button>
      </div>

      {isLoadingLocation && !areaWeather ? (
        <div className="location-loading">
          <div className="loading-spinner"></div>
          <p>Finding weather data for your location...</p>
        </div>
      ) : areaWeather ? (
        <div className="weather-container">
          {/* Current Weather Card */}
          <div className="current-weather">
            <div className="weather-left">
              <div className="weather-temp-display">
                <span className="current-temp">{Math.round(areaWeather.main.temp)}</span>
                <span className="temp-unit">°C</span>
              </div>
              <div className="weather-details">
                <div className="feels-like">
                  <FiThermometer />
                  <span>Feels like {Math.round(areaWeather.main.feels_like)}°C</span>
                </div>
                <div className="weather-condition">
                  {getWeatherIcon(areaWeather.weather[0].main, 36)}
                  <span>{areaWeather.weather[0].description}</span>
                </div>
              </div>
            </div>
            <div className="weather-right">
              <div className="sun-times">
                <div className="sunrise">
                  <FiSunrise />
                  <span>{formatTime(areaWeather.sys.sunrise)}</span>
                </div>
                <div className="sunset">
                  <FiSunset />
                  <span>{formatTime(areaWeather.sys.sunset)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Metrics Grid */}
          <div className="weather-metrics-grid">
            <div className="weather-metric humidity">
              <WiHumidity />
              <div className="metric-data">
                <span className="metric-value">{areaWeather.main.humidity}%</span>
                <span className="metric-label">Humidity</span>
              </div>
            </div>
            <div className="weather-metric wind">
              <WiStrongWind />
              <div className="metric-data">
                <span className="metric-value">{Math.round(areaWeather.wind.speed * 3.6)} km/h</span>
                <span className="metric-label">Wind Speed</span>
              </div>
            </div>
            <div className="weather-metric pressure">
              <WiBarometer />
              <div className="metric-data">
                <span className="metric-value">{areaWeather.main.pressure} hPa</span>
                <span className="metric-label">Pressure</span>
              </div>
            </div>
            <div className="weather-metric visibility">
              <FiEye />
              <div className="metric-data">
                <span className="metric-value">{(areaWeather.visibility / 1000).toFixed(1)} km</span>
                <span className="metric-label">Visibility</span>
              </div>
            </div>
          </div>
          
          {/* Forecast Section */}
          {weatherForecast && (
            <div className="weather-forecast-section">
              <h3 className="forecast-title">Hourly Forecast</h3>
              <div className="forecast-slider">
                {weatherForecast.list.slice(0, 8).map((item, index) => (
                  <div className="forecast-item" key={index}>
                    <span className="forecast-time">{item.dt_txt.split(' ')[1].substring(0, 5)}</span>
                    <div className="forecast-icon">
                      {getWeatherIcon(item.weather[0].main, 28)}
                    </div>
                    <span className="forecast-temp">{Math.round(item.main.temp)}°C</span>
                    <div className="forecast-precipitation">
                      <FiUmbrella size={14} />
                      <span>{Math.round((item.pop || 0) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="forecast-title">5-Day Forecast</h3>
              <div className="daily-forecast-container">
                {groupForecastByDay(weatherForecast).slice(0, 5).map((day, index) => {
                  const maxTemp = Math.max(...day.items.map(item => item.main.temp));
                  const minTemp = Math.min(...day.items.map(item => item.main.temp));
                  const mainCondition = day.items[Math.floor(day.items.length / 2)].weather[0].main;
                  
                  return (
                    <div className="daily-forecast-item" key={index}>
                      <span className="day-name">{index === 0 ? 'Today' : day.day}</span>
                      <div className="day-icon">{getWeatherIcon(mainCondition, 28)}</div>
                      <div className="day-temps">
                        <span className="day-high">{Math.round(maxTemp)}°</span>
                        <span className="day-low">{Math.round(minTemp)}°</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Traffic Incidents Section */}
          <div className="traffic-section">
            <h3 className="traffic-title">
              <FiMapPin />
              <span>Traffic in Your Area</span>
            </h3>
            
            {trafficIncidents && trafficIncidents.length > 0 ? (
              <div className="traffic-incidents">
                {trafficIncidents.map((incident, index) => (
                  <div className="traffic-incident-card" key={index}>
                    <div className="incident-header">
                      <div className="incident-icon">
                        <FiAlertTriangle />
                      </div>
                      <div className="incident-title">
                        {incident.properties?.events?.[0]?.description || "Traffic Incident"}
                      </div>
                      <div className={`incident-severity ${getSeverityClass(incident)}`}>
                        {getSeverityLabel(incident)}
                      </div>
                    </div>
                    <div className="incident-location">
                      <FiMapPin />
                      <span>{incident.properties?.from || "Near your location"}</span>
                    </div>
                    <div className="incident-details">
                      <div className="incident-detail">
                        <FiClock />
                        <span>
                          {incident.properties?.startTime ? `Started: ${new Date(incident.properties.startTime).toLocaleTimeString()}` : "Ongoing"}
                        </span>
                      </div>
                      {incident.properties?.delay && (
                        <div className="incident-delay">
                          Delay: <strong>{incident.properties.delay} minutes</strong>
                        </div>
                      )}
                    </div>
                    {incident.properties?.events?.[0]?.description && (
                      <div className="incident-description">
                        {incident.properties.events[0].description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="traffic-no-incidents">
                <div className="traffic-icon">🚦</div>
                <p>No traffic incidents reported in your area.</p>
              </div>
            )}
          </div>
          
          <div className="weather-powered-by">
            Weather data from OpenWeatherMap | Traffic data from TomTom
          </div>
        </div>
      ) : (
        <div className="location-permission">
          <FiNavigation size={32} />
          <h3>Enable Location Services</h3>
          <p>Please enable location services to see weather forecast and traffic in your area.</p>
          <button className="location-btn" onClick={getUserLocation}>
            Allow Location Access
          </button>
        </div>
      )}
    </>
  );
};

// Helper functions for traffic incidents
const getSeverityClass = (incident) => {
  if (!incident.properties || !incident.properties.magnitudeOfDelay) return "severity-low";
  const delay = incident.properties.magnitudeOfDelay;
  if (delay > 20) return "severity-high";
  if (delay > 10) return "severity-medium";
  return "severity-low";
};

const getSeverityLabel = (incident) => {
  if (!incident.properties || !incident.properties.magnitudeOfDelay) return "Minor";
  const delay = incident.properties.magnitudeOfDelay;
  if (delay > 20) return "Severe";
  if (delay > 10) return "Moderate";
  return "Minor";
};

export default MyArea;