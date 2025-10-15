import React, { useState, useEffect } from 'react';
import './KolkataLive.css';
import { FiPlus, FiTrash2, FiAlertCircle, FiPower, FiMapPin, FiCloudRain } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
// Fix imports to match the actual folder structure
import HappeningNow from './components/Reports/HappeningNow/HappeningNow';
import MyArea from './components/MyArea/MyArea';
import ImportantAlerts from './components/ImportantAlerts/ImportantAlerts';
import './components/Reports/HappeningNow/HappeningNow.css';
import './components/MyArea/MyArea.css';
import './components/ImportantAlerts/ImportantAlerts.css';

// Add relative time formatter if it doesn't exist
if (!Date.prototype.toRelativeTimeString) {
  Date.prototype.toRelativeTimeString = function() {
    const now = new Date();
    const diffMs = now - this;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return this.toLocaleDateString();
  };
}

// Add these helper functions at the top of your file, right before the KolkataLive component
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${ampm}`;
};

const groupForecastByDay = (forecast) => {
  const days = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  forecast.list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const day = date.getDay();
    const dayName = dayNames[day];
    
    const existingDay = days.find(d => d.day === dayName);
    if (existingDay) {
      existingDay.items.push(item);
    } else {
      days.push({
        day: dayName,
        items: [item]
      });
    }
  });
  
  return days;
};

const getWeatherIcon = (condition, size = 24) => {
  const iconClass = `weather-icon ${condition.toLowerCase()}`;
  
  switch (condition.toLowerCase()) {
    case 'clear':
      return <span className={iconClass} style={{fontSize: size}}>☀️</span>;
    case 'clouds':
      return <span className={iconClass} style={{fontSize: size}}>☁️</span>;
    case 'rain':
    case 'drizzle':
      return <span className={iconClass} style={{fontSize: size}}>🌧️</span>;
    case 'thunderstorm':
      return <span className={iconClass} style={{fontSize: size}}>⛈️</span>;
    case 'snow':
      return <span className={iconClass} style={{fontSize: size}}>❄️</span>;
    case 'mist':
    case 'fog':
    case 'haze':
      return <span className={iconClass} style={{fontSize: size}}>🌫️</span>;
    default:
      return <span className={iconClass} style={{fontSize: size}}>🌤️</span>;
  }
};

const KolkataLive = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('happeningNow');

  // Add location state
  const [userLocation, setUserLocation] = useState(null);
  const [userAreaName, setUserAreaName] = useState('');
  const [areaWeather, setAreaWeather] = useState(null);
  const [weatherForecast, setWeatherForecast] = useState(null);
  const [trafficIncidents, setTrafficIncidents] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  // API Keys
  const OPENWEATHER_API_KEY = 'a83cdc3683b5ed725b5a7d17e7e24046';
  const TOMTOM_API_KEY = 'uQ2mJGxEuFpWVbbUfU6goaH8tJIDbVeK';
  
  // Load reports from localStorage
  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem("reports") || "[]");
    setReports(storedReports);
  }, []);
  
  // Function to get user's location
  const getUserLocation = () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Fetch location name, weather, and traffic data
          getLocationName(latitude, longitude);
          fetchWeatherData(latitude, longitude);
          fetchTrafficData(latitude, longitude);
          
          setLastUpdated(new Date());
          setIsLoadingLocation(false);
        },
        error => {
          console.error("Error getting location:", error);
          setLocationError("Failed to get your location. Please check your browser permissions.");
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setLocationError("Location services are not available in your browser.");
      setIsLoadingLocation(false);
    }
  };

  // Get location name from coordinates using reverse geocoding
  const getLocationName = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${TOMTOM_API_KEY}`);
      const data = await response.json();
      
      if (data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0].address;
        let locationName = '';
        
        // Construct location name based on available address components
        if (address.municipalitySubdivision) {
          locationName = address.municipalitySubdivision;
        } else if (address.municipality) {
          locationName = address.municipality;
        } else if (address.countrySubdivision) {
          locationName = address.countrySubdivision;
        }
        
        setUserAreaName(locationName);
      } else {
        setUserAreaName('Your Location');
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setUserAreaName('Your Location');
    }
  };

  // Fetch weather data from OpenWeatherMap API
  const fetchWeatherData = async (lat, lng) => {
    try {
      // Current weather
      const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`);
      const weatherData = await weatherResponse.json();
      setAreaWeather(weatherData);
      
      // 5-day forecast
      const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`);
      const forecastData = await forecastResponse.json();
      setWeatherForecast(forecastData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  // Fetch traffic data from TomTom API
  const fetchTrafficData = async (lat, lng) => {
    try {
      // Traffic incidents within 5km radius
      const response = await fetch(`https://api.tomtom.com/traffic/services/5/incidentDetails?key=${TOMTOM_API_KEY}&bbox=${lng-0.1},${lat-0.1},${lng+0.1},${lat+0.1}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity,aci{probabilityOfOccurrence,trafficWeight,source},tmc{countryCode,tableNumber,direction,point},alertCodes}}}`);
      const data = await response.json();
      
      if (data && data.incidents) {
        setTrafficIncidents(data.incidents);
      } else {
        setTrafficIncidents([]);
      }
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      setTrafficIncidents([]);
    }
  };

  // Try to get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);
  
  // Add your smooth page transition effect
  useEffect(() => {
    // Create smooth page transitions
    const smoothPage = () => {
      document.body.style.transition = "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
      
      // Add smooth scroll behavior
      document.documentElement.style.scrollBehavior = "smooth";
      
      // Apply smooth transitions to all interactive elements
      const elements = document.querySelectorAll('.alert-card, .weather-metric, button, .forecast-item');
      elements.forEach(el => {
        el.style.transition = "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)";
      });
      
      // Apply staggered animation to containers
      const containers = document.querySelectorAll('.alerts-container, .weather-metrics-grid, .forecast-slider');
      containers.forEach((container, index) => {
        container.style.opacity = "0";
        setTimeout(() => {
          container.style.transition = "all 0.5s ease-out";
          container.style.opacity = "1";
        }, 100 + (index * 50));
      });
    };
    
    // Apply smoothing effect
    smoothPage();
    
    // Apply smoothing when tab changes
    const observer = new MutationObserver(smoothPage);
    observer.observe(document.querySelector('.content-container'), { childList: true, subtree: true });
    
    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [activeTab]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const nav = document.querySelector('.top-nav');
      if (nav) {
        const rect = nav.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        nav.style.setProperty('--mouse-x', `${x}%`);
        nav.style.setProperty('--mouse-y', `${y}%`);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleReportClick = () => {
    navigate('/report');
  };

  const handleClearAll = () => {
    localStorage.setItem("reports", "[]");
    setReports([]);
  };

  // Helper function that might be needed by child components
  const getIncidentIcon = (type) => {
    // Return appropriate icon based on incident type
    switch(type?.toLowerCase()) {
      case 'traffic':
      case 'traffic-jam':
      case 'traffic-jam-accident':
        return <FiAlertCircle className="icon-glow" />;
      case 'power':
      case 'power-cut':
        return <FiPower className="icon-glow" />;
      case 'weather':
      case 'rain':
      case 'storm':
        return <FiCloudRain className="icon-glow" />;
      default:
        return <FiAlertCircle className="icon-glow" />;
    }
  };
  
  // Function to get important alerts
  const getImportantAlerts = () => {
    const alerts = [
      {
        icon: <FiAlertCircle className="icon-glow" />,
        title: "Major Traffic Diversion",
        location: "EM Bypass",
        time: "Active now",
        description: "Major traffic diversion due to road repairs. Expect delays of 30-45 minutes.",
        label: "Urgent",
        labelClass: "urgent",
        actions: ["Take alternate route via AJC Bose Road", "Use public transportation if possible"],
        duration: "Expected to continue for next 2 days",
        reports: "Verified by authorities",
        helpful: "Helpful (45)"
      },
      {
        icon: <FiCloudRain className="icon-glow" />,
        title: "Heavy Rain Warning",
        location: "All Kolkata",
        time: "Next 24 hours",
        description: "Heavy rainfall expected. Possibility of localized waterlogging in low-lying areas.",
        label: "Important",
        labelClass: "important",
        actions: ["Avoid unnecessary travel", "Keep emergency supplies ready"],
        duration: "Warning in effect for next 24 hours",
        reports: "Meteorological Department Advisory",
        helpful: "Helpful (67)"
      }
    ];

    // Add traffic incidents from API if available
    if (trafficIncidents && trafficIncidents.length > 0) {
      trafficIncidents.slice(0, 2).forEach(incident => {
        let severity = "Info";
        let severityClass = "info";
        
        // Map severity based on magnitudeOfDelay if available
        if (incident.properties && incident.properties.magnitudeOfDelay) {
          const delay = incident.properties.magnitudeOfDelay;
          if (delay > 20) {
            severity = "Urgent";
            severityClass = "urgent";
          } else if (delay > 10) {
            severity = "Important";
            severityClass = "important";
          }
        }

        // Create alert object from traffic incident
        const trafficAlert = {
          icon: <FiAlertCircle className="icon-glow" />,
          title: incident.properties?.events?.[0]?.description || "Traffic Incident",
          location: incident.properties?.from || userAreaName,
          time: "Active now",
          description: `${incident.properties?.events?.[0]?.description || "Traffic issue"}. ${incident.properties?.delay ? `Delay of ${incident.properties.delay} minutes.` : ''}`,
          label: severity,
          labelClass: severityClass,
          actions: ["Consider alternate routes", "Check real-time traffic before traveling"],
          duration: incident.properties?.endTime ? `Expected to clear by ${new Date(incident.properties.endTime).toLocaleTimeString()}` : "Ongoing",
          reports: "TomTom Traffic Service",
          helpful: "Helpful (12)"
        };
        
        alerts.unshift(trafficAlert);
      });
    }
    
    return alerts;
  };
  
  return (
    <div className="kolkata-live-page">
      <div className="top-nav">
        <div className="nav-inner">
          <div className="top-left">
            <div className="top-title">Kolkata Live</div>
            <div className="nav-tabs">
              <button 
                className={activeTab === 'happeningNow' ? 'active-tab' : ''}
                onClick={() => setActiveTab('happeningNow')}
              >
                Happening Now
              </button>
              <button 
                className={activeTab === 'myArea' ? 'active-tab' : ''}
                onClick={() => setActiveTab('myArea')}
              >
                My Area
              </button>
              <button 
                className={activeTab === 'importantAlerts' ? 'active-tab' : ''}
                onClick={() => setActiveTab('importantAlerts')}
              >
                Important Alerts
              </button>
            </div>
          </div>
          
          <div className="top-right">
            <button 
              className="report-btn"
              onClick={() => navigate('/report-something')}
            >
              <FiPlus /> Report Something
            </button>
            <button 
              className="clear-btn"
              onClick={() => {
                localStorage.setItem("reports", "[]");
                setReports([]);
              }}
            >
              <FiTrash2 /> Clear All
            </button>
          </div>
        </div>
      </div>
      
      <div className="content-container">
        {activeTab === 'happeningNow' && 
          <HappeningNow 
            reports={reports} 
            getIncidentIcon={getIncidentIcon} 
          />
        }
        
        {activeTab === 'myArea' && 
          <MyArea 
            userAreaName={userAreaName}
            isLoadingLocation={isLoadingLocation}
            lastUpdated={lastUpdated}
            getUserLocation={getUserLocation}
            areaWeather={areaWeather}
            weatherForecast={weatherForecast}
            formatTime={formatTime}
            getWeatherIcon={getWeatherIcon}
            groupForecastByDay={groupForecastByDay}
            trafficIncidents={trafficIncidents}
          />
        }
        
        {activeTab === 'importantAlerts' && 
          <ImportantAlerts 
            getImportantAlerts={getImportantAlerts}
            getIncidentIcon={getIncidentIcon}
          />
        }
      </div>
    </div>
  );
};

export default KolkataLive;