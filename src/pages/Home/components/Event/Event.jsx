import React, { useState, useEffect, useRef } from 'react';
import './Event.css';
import car from '../../assets/car.png';
import drop from '../../assets/drop.png';
import musicalnote from '../../assets/musical-note.png';
import { FiAlertCircle, FiActivity, FiShoppingBag, FiMapPin, FiCoffee, FiX, FiMaximize2, FiCalendar, FiMap, FiWind, FiDroplet, FiSun, FiEye } from 'react-icons/fi';

const Event = () => {
  const [events, setEvents] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [detailedEvents, setDetailedEvents] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Reference to track if a weather alert has been added
  const weatherAlertAddedRef = useRef(false);
  
  // Helper function to ensure we don't add duplicate events
  const addUniqueEvents = (prevEvents, newEvents) => {
    // Create a Set of existing IDs for quick lookup
    const existingIds = new Set(prevEvents.map(event => event.id));
    // Filter out any new events that already exist
    const uniqueEvents = newEvents.filter(event => !existingIds.has(event.id));
    
    console.log(`Adding ${uniqueEvents.length} unique events out of ${newEvents.length} total`);
    
    if (uniqueEvents.length === 0) {
      return prevEvents; // Don't update state if no new unique events
    }
    
    // Return new array with unique events added
    return [...uniqueEvents, ...prevEvents];
  };
  
  // API keys
  const TOMTOM_API_KEY = "uQ2mJGxEuFpWVbbUfU6goaH8tJIDbVeK";
  const OPENWEATHER_API_KEY = "a83cdc3683b5ed725b5a7d17e7e24046";
  const GEMINI_API_KEY = "AIzaSyAcbDCRBsGMY1JTAc5yHHAeAYWjRNRwo50";
  
  // Kolkata center coordinates
  const kolkataCenter = { lat: 22.5726, lng: 88.3639 };
  
  // Kolkata bounding box for TomTom API (roughly covers the city)
  // Format: minLon,minLat,maxLon,maxLat
  const kolkataBoundingBox = "88.2636,22.4950,88.4645,22.6293";
  
  // Main traffic areas in Kolkata
  const mainTrafficAreas = [
    { name: "Howrah Bridge", coordinates: { lat: 22.5851, lng: 88.3468 } },
    { name: "Park Street", coordinates: { lat: 22.5547, lng: 88.3494 } },
    { name: "Salt Lake", coordinates: { lat: 22.5697, lng: 88.4260 } },
    { name: "EM Bypass", coordinates: { lat: 22.5148, lng: 88.3962 } }
  ];
  
  // Extended list of areas for "Load More Events" view
  const extendedTrafficAreas = [
    { name: "New Town", coordinates: { lat: 22.6293, lng: 88.4645 } },
    { name: "Sealdah Station", coordinates: { lat: 22.5675, lng: 88.3682 } },
    { name: "Science City", coordinates: { lat: 22.5378, lng: 88.3964 } },
    { name: "Gariahat", coordinates: { lat: 22.5173, lng: 88.3654 } },
    { name: "Esplanade", coordinates: { lat: 22.5586, lng: 88.3513 } },
    { name: "Ballygunge", coordinates: { lat: 22.5319, lng: 88.3658 } },
    { name: "Rajarhat", coordinates: { lat: 22.6211, lng: 88.4683 } },
    { name: "Behala", coordinates: { lat: 22.4986, lng: 88.3152 } },
    { name: "Shyambazar", coordinates: { lat: 22.5970, lng: 88.3713 } },
    { name: "Garia", coordinates: { lat: 22.4645, lng: 88.3877 } }
  ];
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Reset weather alert ref when component mounts or events change
  useEffect(() => {
    weatherAlertAddedRef.current = false;
  }, []);
  
  // Initialize data fetching on component mount
  useEffect(() => {
    console.log("Component mounted, starting data fetch...");
    initializeDataFetching();
  }, []);
  
  // Initialize all data fetching
  const initializeDataFetching = () => {
    // Skip if already loading
    if (isLoading) {
      console.log("Already loading data, skipping initialize");
      return;
    }
    
    // Clear existing events and reset weather alert ref
    setEvents([]);
    setDetailedEvents([]);
    weatherAlertAddedRef.current = false;
    setIsLoading(true);
    
    // Fetch real weather data
    fetchWeatherData();
    
    // Fetch traffic incidents from TomTom API
    fetchTomTomTrafficIncidents();
    
    // Set loading to false after reasonable timeout if no events appear
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };

  // Fetch real weather data from OpenWeather API
  const fetchWeatherData = async () => {
    console.log("Fetching real weather data from OpenWeather API...");
    try {
      // Check if we already have a weather event
      const existingWeatherEvent = events.find(e => e.id === 'weather-1');
      if (existingWeatherEvent) {
        console.log("Weather event already exists, not adding another one");
        return; // Skip if we already have a weather event
      }
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Kolkata&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        console.error(`Weather API error: ${response.status}`);
        throw new Error(`Weather API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Weather data received:", data);
      
      if (data.weather && data.weather[0]) {
        // Determine weather severity based on conditions
        const severity = getWeatherSeverity(data);
        
        // Convert wind direction to compass direction
        const windDirection = getWindDirection(data.wind.deg);
        
        // Format visibility in km
        const visibilityKm = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'Unknown';
        
        const weatherEvent = {
          id: 'weather-1',
          icon: drop,
          bg: getSeverityColor(severity),
          title: `${data.weather[0].main} in Kolkata`,
          description: getWeatherDescription(data),
          location: '📍 City-wide',
          sources: '👥 OpenWeather API',
          level: `Level ${severity}`,
          levelClass: `level-${severity}`,
          timestamp: new Date(),
          detailedInfo: {
            temperature: `${Math.round(data.main.temp)}°C`,
            feelsLike: `${Math.round(data.main.feels_like)}°C`,
            humidity: `${data.main.humidity}%`,
            pressure: `${data.main.pressure} hPa`,
            windSpeed: `${data.wind.speed} m/s`,
            windDirection: windDirection,
            visibility: visibilityKm,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            weatherId: data.weather[0].id,
            description: data.weather[0].description
          }
        };
        
        setEvents(prev => addUniqueEvents(prev, [weatherEvent]));
        
        // Check for and add weather alert if needed (only once)
        if (!weatherAlertAddedRef.current && 
            (data.rain || data.snow || data.main.temp > 35 || data.main.temp < 10 || 
             data.weather[0].id < 700 || data.wind.speed > 10)) {
          // Create an alert based on this data
          addWeatherAlert(data);
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Weather API Error:', error);
    }
  };
  
  // Convert wind degrees to cardinal direction
  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  
  // Get weather description based on data
  const getWeatherDescription = (data) => {
    const temp = Math.round(data.main.temp);
    const feels = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    
    let weatherDesc = `Current temperature: ${temp}°C (feels like ${feels}°C). ${description}. Humidity: ${humidity}%.`;
    
    // Add wind information if significant
    if (data.wind && data.wind.speed > 5) {
      weatherDesc += ` Wind speed: ${data.wind.speed}m/s.`;
    }
    
    // Add visibility information if poor
    if (data.visibility && data.visibility < 5000) {
      weatherDesc += ` Poor visibility (${Math.round(data.visibility/1000)}km).`;
    }
    
    return weatherDesc;
  };
  
  // Get weather severity level (1-3)
  const getWeatherSeverity = (data) => {
    // Check for extreme conditions
    if (
      data.weather[0].id < 300 || // Thunderstorm 
      data.weather[0].id === 504 || // Extreme rain
      data.weather[0].id === 511 || // Freezing rain
      data.weather[0].id === 602 || // Heavy snow
      data.weather[0].id >= 700 && data.weather[0].id < 800 || // Atmosphere conditions (fog, etc)
      data.main.temp > 38 || // Very hot
      data.main.temp < 5 || // Very cold
      data.wind.speed > 10 // Strong wind
    ) {
      return 3;
    }
    
    // Check for moderate conditions
    if (
      data.weather[0].id >= 300 && data.weather[0].id < 400 || // Drizzle
      data.weather[0].id >= 500 && data.weather[0].id < 600 || // Rain
      data.weather[0].id >= 600 && data.weather[0].id < 700 || // Snow
      data.main.temp > 33 || // Hot
      data.main.temp < 10 || // Cold
      data.wind.speed > 5 // Moderate wind
    ) {
      return 2;
    }
    
    // Normal conditions
    return 1;
  };
  
  // Add weather alert for extreme conditions
  const addWeatherAlert = (data) => {
    // Mark that we've added a weather alert to prevent duplicates
    if (weatherAlertAddedRef.current) {
      console.log("Weather alert already added in this session, not adding another one");
      return;
    }
    
    weatherAlertAddedRef.current = true;
    
    let alertTitle, alertDesc, alertDetails;
    let alertPriority = 0;
    let alertData = {};
    
    // Check all conditions but only use the highest priority alert
    
    // Check for thunderstorms (highest priority)
    if (data.weather[0].id < 300) {
      alertTitle = "Thunderstorm Alert";
      alertDesc = "Thunderstorms detected in the area. Stay indoors and avoid open areas.";
      alertDetails = "Thunderstorms can cause lightning strikes, power outages, and flash flooding in Kolkata. Unplug electronic devices, avoid using landline phones, and stay away from windows and open areas during the storm.";
      alertPriority = 7;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    }
    
    // Check for extreme heat
    if (data.main.temp > 35 && alertPriority < 6) {
      alertTitle = "Heat Alert in Kolkata";
      alertDesc = `Temperature is very high at ${Math.round(data.main.temp)}°C. Stay hydrated and avoid prolonged sun exposure.`;
      alertDetails = "High temperatures can cause heat exhaustion and heat stroke. The elderly, children, and those with pre-existing health conditions are particularly vulnerable. Stay in cooled environments when possible and drink plenty of fluids.";
      alertPriority = 6;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    }
    
    // Check for extreme cold
    if (data.main.temp < 10 && alertPriority < 5) {
      alertTitle = "Cold Alert in Kolkata";
      alertDesc = `Temperature is low at ${Math.round(data.main.temp)}°C. Dress warmly if going outside.`;
      alertDetails = "Unusually cold temperatures for Kolkata can cause health issues, especially for those unaccustomed to cold weather. Wear layers, keep extremities covered, and check on elderly neighbors.";
      alertPriority = 5;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    }
    
    // Check for heavy rain
    if (data.rain && data.rain["1h"] > 5 && alertPriority < 4) {
      alertTitle = "Heavy Rain Alert";
      alertDesc = `Heavy rainfall detected (${data.rain["1h"]}mm). Expect water logging in low-lying areas.`;
      alertDetails = "Heavy rainfall can cause significant water logging in areas like Central Avenue, MG Road, and parts of Salt Lake. Underground metro stations and low-lying residential areas may experience flooding. Avoid unnecessary travel and stay away from waterlogged areas.";
      alertPriority = 4;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    } 
    
    // Check for any rainfall
    else if (data.weather[0].id >= 500 && data.weather[0].id < 600 && alertPriority < 3) {
      alertTitle = "Rain Alert";
      alertDesc = "Ongoing rainfall may cause water logging in parts of the city.";
      alertDetails = "Even moderate rainfall can affect traffic flow in key areas like EM Bypass, Park Street, and Howrah Bridge approaches. Water logging is common in low-lying areas. Plan your travel accordingly and allow extra time for commutes.";
      alertPriority = 3;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    }
    
    // Check for strong winds
    if (data.wind && data.wind.speed > 10 && alertPriority < 2) {
      alertTitle = "Strong Wind Alert";
      alertDesc = `Strong winds at ${data.wind.speed}m/s. Secure loose items outdoors.`;
      alertDetails = "Strong winds can damage temporary structures, bring down tree branches and create hazardous conditions. Avoid parking under trees, secure outdoor furniture, and be cautious of flying debris.";
      alertPriority = 2;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    }
    
    // Extremely unlikely, but check for snow (lowest priority)
    if (data.snow && alertPriority < 1) {
      alertTitle = "Unusual Snow Alert";
      alertDesc = "Unusual snow conditions reported. This is extremely rare for Kolkata.";
      alertDetails = "Snow in Kolkata would be an extremely unusual weather phenomenon requiring immediate attention. If you're seeing this alert, please verify with multiple sources as it may be a weather reporting error.";
      alertPriority = 1;
      alertData = {title: alertTitle, desc: alertDesc, details: alertDetails};
    }
    
    // Only create alert if we found a condition that needs alerting
    if (alertPriority > 0) {
      // Use the highest priority alert data
      const alertEvent = {
        id: `weather-alert-${Date.now()}`, // Use timestamp to make ID unique
        icon: <FiAlertCircle className="event-react-icon" />,
        bg: '#ef4444',
        title: alertData.title,
        description: alertData.desc,
        location: '📍 City-wide',
        sources: '👥 Weather Alert System',
        level: 'Level 3',
        levelClass: 'level-3',
        timestamp: new Date(),
        detailedInfo: {
          alertType: alertData.title.split(' ')[0],
          fullDescription: alertData.details,
          affectedAreas: ["Central Kolkata", "North Kolkata", "South Kolkata", "Salt Lake", "Howrah"],
          duration: "Expected to continue for next 3-6 hours",
          recommendations: alertData.details,
          data: data
        }
      };
      
      // Add the alert to the events list
      setEvents(prev => addUniqueEvents(prev, [alertEvent]));
      console.log("Weather alert added:", alertData.title);
    }
  };

  // Fetch traffic incidents from TomTom API
  const fetchTomTomTrafficIncidents = async () => {
    console.log("Fetching traffic incidents from TomTom API...");
    
    try {
      // TomTom Traffic Incidents API endpoint
      const response = await fetch(
        `https://api.tomtom.com/traffic/services/5/incidentDetails?key=${TOMTOM_API_KEY}&bbox=${kolkataBoundingBox}&fields={incidents{type,geometry{type,coordinates},properties{iconCategory,magnitudeOfDelay,events{description,code},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}`
      );
      
      if (!response.ok) {
        console.error(`TomTom API error: ${response.status}`);
        throw new Error(`TomTom API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("TomTom traffic incidents received:", data);
      
      // Process traffic incidents
      if (data && data.incidents && data.incidents.length > 0) {
        console.log(`Found ${data.incidents.length} traffic incidents`);
        
        // Create a temporary array to collect new events
        const newEvents = [];
        
        // Process each incident and create events
        data.incidents.forEach((incident, index) => {
          const event = createTrafficIncidentEvent(incident);
          if (event) newEvents.push(event);
        });
        
        // Add all events at once to prevent multiple re-renders
        setEvents(prev => addUniqueEvents(prev, newEvents));
        
        setIsLoading(false);
      } else {
        console.log("No traffic incidents found in the area");
        // If no incidents are found, try specific locations in Kolkata
        fetchTrafficForSpecificLocations(mainTrafficAreas);
      }
    } catch (error) {
      console.error('TomTom Traffic API Error:', error);
      // If TomTom API fails, try specific locations in Kolkata
      fetchTrafficForSpecificLocations(mainTrafficAreas);
    }
  };
  
  // Fetch traffic flow for specific locations in Kolkata
  const fetchTrafficForSpecificLocations = async (locationsList) => {
    console.log(`Fetching traffic flow for ${locationsList.length} Kolkata locations...`);
    
    try {
      // Array to collect all traffic events
      const newTrafficEvents = [];
      
      // Build a set of area names that already have events
      const processedAreas = new Set(
        events
          .filter(e => e.title && e.title.includes("Traffic Update:"))
          .map(e => e.title.replace("Traffic Update: ", ""))
      );
      
      console.log("Already processed traffic areas:", [...processedAreas]);
      
      // Create traffic events for common areas with the help of TomTom Traffic Flow API
      for (let i = 0; i < locationsList.length; i++) {
        const area = locationsList[i];
        
        // Skip if we already created an event for this area
        if (processedAreas.has(area.name)) {
          console.log(`Skipping ${area.name} as it already has traffic data`);
          continue;
        }
        
        // Mark this area as processed
        processedAreas.add(area.name);
        
        // TomTom Traffic Flow API endpoint for specific coordinates
        const response = await fetch(
          `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${area.coordinates.lat},${area.coordinates.lng}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Traffic flow data for ${area.name}:`, data);
          
          if (data && data.flowSegmentData) {
            const event = createTrafficFlowEvent(area.name, data.flowSegmentData);
            if (event) {
              newTrafficEvents.push(event);
            }
          }
        } else {
          console.error(`Failed to get traffic flow for ${area.name}: ${response.status}`);
        }
        
        // Add slight delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Add all events to the main feed
      if (newTrafficEvents.length > 0) {
        setEvents(prev => addUniqueEvents(prev, newTrafficEvents));
        console.log(`Added ${newTrafficEvents.length} new traffic events to the feed`);
        
        // If detailed view is open, also add to detailed events
        if (showDetailedView) {
          setDetailedEvents(prev => addUniqueEvents(prev, newTrafficEvents));
        }
      }
      
      setIsLoading(false);
      setIsLoadingMore(false);
    } catch (error) {
      console.error('TomTom Traffic Flow API Error:', error);
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };
  
  // Create event for TomTom traffic incident
  const createTrafficIncidentEvent = (incident) => {
    // Extract incident details
    const properties = incident.properties || {};
    const events = properties.events || [];
    const firstEvent = events.length > 0 ? events[0] : {};
    const description = firstEvent.description || "Traffic incident reported";
    const category = properties.iconCategory || "";
    const from = properties.from || "";
    const to = properties.to || "";
    const delay = properties.delay || 0;
    
    // Extract coordinates for detailed view map link
    const geometry = incident.geometry || {};
    const coordinates = geometry.coordinates || [];
    const latLong = coordinates.length > 0 ? coordinates[0].join(',') : null;
    
    // Determine severity based on delay and category
    let severity = 1;
    if (delay > 600) { // More than 10 minutes delay
      severity = 3;
    } else if (delay > 300) { // 5-10 minutes delay
      severity = 2;
    } else if (category.includes("ACCIDENT") || category.includes("HAZARD")) {
      severity = 3;
    } else if (category.includes("CONSTRUCTION") || category.includes("LANE_RESTRICTION")) {
      severity = 2;
    }
    
    // Determine title based on category
    let title = "Traffic Incident";
    if (category.includes("ACCIDENT")) {
      title = "Accident Reported";
    } else if (category.includes("CONSTRUCTION")) {
      title = "Road Construction";
    } else if (category.includes("LANE_RESTRICTION")) {
      title = "Lane Restriction";
    } else if (category.includes("JAM")) {
      title = "Traffic Jam";
    } else if (category.includes("HAZARD")) {
      title = "Road Hazard";
    } else if (category.includes("CLOSED")) {
      title = "Road Closure";
    }
    
    // Format location
    let location = '📍 Kolkata';
    if (from && to) {
      location = `📍 From ${from} to ${to}`;
    } else if (from) {
      location = `📍 At ${from}`;
    }
    
    // Create detailed recommendations based on incident type
    let recommendations = "Consider alternative routes if possible.";
    if (category.includes("ACCIDENT")) {
      recommendations = "Approach with caution. Allow emergency vehicles to pass. Consider alternative routes.";
    } else if (category.includes("CONSTRUCTION")) {
      recommendations = "Expect delays and possible detours. Follow construction zone speed limits and worker instructions.";
    } else if (category.includes("LANE_RESTRICTION")) {
      recommendations = "Prepare to merge. Follow traffic signs and maintain safe distances between vehicles.";
    } else if (category.includes("CLOSED")) {
      recommendations = "Road is closed. Find an alternative route immediately. Follow official detour signs if available.";
    }
    
    // Create a consistent ID based on location and category
    const incidentId = `tomtom-incident-${from.replace(/\s+/g, '-').toLowerCase()}-${category.toLowerCase()}`;
    
    // Create traffic incident event
    return {
      id: incidentId,
      icon: car,
      bg: getSeverityColor(severity),
      title: title,
      description: description,
      location: location,
      sources: '👥 TomTom Traffic',
      level: `Level ${severity}`,
      levelClass: `level-${severity}`,
      timestamp: properties.startTime ? new Date(properties.startTime) : new Date(),
      detailedInfo: {
        incidentType: title,
        fullDescription: description,
        category: category,
        from: from || "Unknown location",
        to: to || "N/A",
        delay: delay ? `${Math.round(delay/60)} minutes` : "Unknown",
        length: properties.length ? `${properties.length/1000} km` : "N/A",
        roadNumbers: properties.roadNumbers ? properties.roadNumbers.join(", ") : "N/A",
        startTime: properties.startTime ? new Date(properties.startTime).toLocaleString() : "N/A",
        endTime: properties.endTime ? new Date(properties.endTime).toLocaleString() : "Ongoing",
        coordinates: latLong,
        mapUrl: latLong ? `https://www.tomtom.com/en_gb/maps/map/?lat=${latLong.split(',')[1]}&lon=${latLong.split(',')[0]}&zoom=15` : null,
        recommendations: recommendations
      }
    };
  };
  
  // Create event for traffic flow in specific area
  const createTrafficFlowEvent = (areaName, flowData) => {
    // Create a consistent ID based on area name only (no timestamp)
    const eventId = `traffic-flow-${areaName.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Determine traffic severity based on flow data
    const currentSpeed = flowData.currentSpeed || 0;
    const freeFlowSpeed = flowData.freeFlowSpeed || 30;
    const confidence = flowData.confidence || 0.5;
    const roadName = flowData.roadName || "";
    
    // Calculate congestion as percentage reduction from free flow speed
    const congestionPercent = freeFlowSpeed > 0 ? 
      Math.round(100 * (1 - (currentSpeed / freeFlowSpeed))) : 0;
    
    // Determine severity based on congestion and confidence
    let severity = 1;
    let trafficDesc = "Traffic is flowing normally.";
    
    if (congestionPercent > 50 && confidence > 0.7) {
      severity = 3;
      trafficDesc = "Heavy congestion reported. Consider alternative routes.";
    } else if (congestionPercent > 25 || (congestionPercent > 40 && confidence > 0.5)) {
      severity = 2;
      trafficDesc = "Moderate traffic congestion. Expect some delays.";
    }
    
    // Create map link for the area
    const mapUrl = `https://www.tomtom.com/en_gb/maps/map/?lat=${flowData.coordinate?.latitude || ''}&lon=${flowData.coordinate?.longitude || ''}&zoom=15`;
    
    // Prepare detailed recommendations based on location and congestion
    let recommendations = "Normal traffic flow. No special measures needed.";
    
    if (congestionPercent > 50) {
      recommendations = `Heavy traffic in ${areaName}. Consider using public transport or alternative routes. If driving, maintain safe distances and expect significant delays.`;
      
      // Add location-specific recommendations
      if (areaName === "Howrah Bridge") {
        recommendations += " Ferry services might be faster during peak hours.";
      } else if (areaName === "Park Street") {
        recommendations += " Consider alternate routes via Loudon Street or AJC Bose Road.";
      } else if (areaName === "Salt Lake") {
        recommendations += " EM Bypass may provide a faster alternative depending on your destination.";
      } else if (areaName === "EM Bypass") {
        recommendations += " Consider using the metro if your destination is nearby a station.";
      }
    } else if (congestionPercent > 25) {
      recommendations = `Moderate traffic in ${areaName}. Plan for some delays in your journey.`;
    }
    
    // Create traffic flow event
    return {
      id: eventId, // Use consistent ID for the same area
      icon: car,
      bg: getSeverityColor(severity),
      title: `Traffic Update: ${areaName}`,
      description: `Current speed: ${currentSpeed} km/h (${congestionPercent}% below normal). ${trafficDesc}`,
      location: `📍 ${areaName}`,
      sources: '👥 TomTom Traffic Flow',
      level: `Level ${severity}`,
      levelClass: `level-${severity}`,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1800000)), // Random time in last 30 mins
      detailedInfo: {
        areaName: areaName,
        roadName: roadName || "Main road",
        currentSpeed: `${currentSpeed} km/h`,
        normalSpeed: `${freeFlowSpeed} km/h`,
        congestionPercent: `${congestionPercent}%`,
        confidence: `${Math.round(confidence * 100)}%`,
        coordinates: `${flowData.coordinate?.latitude || ''},${flowData.coordinate?.longitude || ''}`,
        trafficStatus: congestionPercent > 50 ? "Heavy" : congestionPercent > 25 ? "Moderate" : "Normal",
        mapUrl: mapUrl,
        recommendations: recommendations,
        updatedAt: new Date().toLocaleString()
      }
    };
  };
  
  // Handle load more events button
  const handleLoadMore = async () => {
    setShowDetailedView(true);
    setIsLoadingMore(true);
    setDetailedEvents([]);
    
    // Fetch more detailed traffic data for extended areas
    await fetchTrafficForSpecificLocations(extendedTrafficAreas);
    
    // Fetch extended weather forecast
    await fetchExtendedWeatherForecast();
    
    setIsLoadingMore(false);
  };
  
  // Fetch extended weather forecast
  const fetchExtendedWeatherForecast = async () => {
    try {
      console.log("Fetching extended weather forecast...");
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=Kolkata&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=8`
      );
      
      if (!response.ok) {
        throw new Error(`Weather forecast API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Extended weather forecast received:", data);
      
      // Create detailed forecast events
      if (data && data.list && data.list.length > 0) {
        // Group forecasts by day
        const forecastsByDay = {};
        
        data.list.forEach(forecast => {
          const date = new Date(forecast.dt * 1000);
          const day = date.toLocaleDateString();
          
          if (!forecastsByDay[day]) {
            forecastsByDay[day] = [];
          }
          
          forecastsByDay[day].push(forecast);
        });
        
        // Create a forecast event for each day
        Object.keys(forecastsByDay).forEach(day => {
          const forecasts = forecastsByDay[day];
          const firstForecast = forecasts[0];
          
          const date = new Date(firstForecast.dt * 1000);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          
          // Calculate average temperature and find max/min
          let totalTemp = 0;
          let maxTemp = -100;
          let minTemp = 100;
          let mainWeather = {};
          const weatherCounts = {};
          
          forecasts.forEach(f => {
            totalTemp += f.main.temp;
            maxTemp = Math.max(maxTemp, f.main.temp);
            minTemp = Math.min(minTemp, f.main.temp);
            
            // Count weather conditions to find the most common
            const weatherType = f.weather[0].main;
            if (!weatherCounts[weatherType]) {
              weatherCounts[weatherType] = 0;
            }
            weatherCounts[weatherType]++;
          });
          
          // Find most common weather condition
          let mostCommonWeather = '';
          let maxCount = 0;
          
          Object.keys(weatherCounts).forEach(weatherType => {
            if (weatherCounts[weatherType] > maxCount) {
              maxCount = weatherCounts[weatherType];
              mostCommonWeather = weatherType;
              forecasts.forEach(f => {
                if (f.weather[0].main === weatherType) {
                  mainWeather = f.weather[0];
                }
              });
            }
          });
          
          const avgTemp = totalTemp / forecasts.length;
          const severity = getWeatherForecastSeverity(mainWeather.id, maxTemp, minTemp);
          
          // Create forecast event with unique ID based on date
          const forecastEvent = {
            id: `forecast-${dayName.toLowerCase()}-${date.getTime()}`,
            icon: <FiCalendar className="event-react-icon" />,
            bg: getSeverityColor(severity),
            title: `${dayName} Weather Forecast`,
            description: `${mostCommonWeather}: ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C. ${mainWeather.description}.`,
            location: '📍 Kolkata',
            sources: '👥 OpenWeather Forecast',
            level: `Level ${severity}`,
            levelClass: `level-${severity}`,
            timestamp: date,
            detailedInfo: {
              day: dayName,
              date: date.toLocaleDateString(),
              averageTemp: `${Math.round(avgTemp)}°C`,
              minTemp: `${Math.round(minTemp)}°C`,
              maxTemp: `${Math.round(maxTemp)}°C`,
              weatherCondition: mostCommonWeather,
              weatherDescription: mainWeather.description,
              hourlyForecasts: forecasts.map(f => ({
                time: new Date(f.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                temp: `${Math.round(f.main.temp)}°C`,
                weather: f.weather[0].main,
                description: f.weather[0].description,
                humidity: `${f.main.humidity}%`,
                windSpeed: `${f.wind.speed} m/s`
              }))
            }
          };
          
          setDetailedEvents(prev => addUniqueEvents(prev, [forecastEvent]));
        });
      }
    } catch (error) {
      console.error('Extended Weather Forecast Error:', error);
    }
  };
  
  // Get severity level for weather forecast
  const getWeatherForecastSeverity = (weatherId, maxTemp, minTemp) => {
    // Check for extreme conditions
    if (
      weatherId < 300 || // Thunderstorm 
      weatherId === 504 || // Extreme rain
      weatherId === 511 || // Freezing rain
      weatherId === 602 || // Heavy snow
      weatherId >= 700 && weatherId < 800 || // Atmosphere conditions (fog, etc)
      maxTemp > 38 || // Very hot
      minTemp < 5 || // Very cold
      maxTemp - minTemp > 15 // Large temperature swing
    ) {
      return 3;
    }
    
    // Check for moderate conditions
    if (
      weatherId >= 300 && weatherId < 400 || // Drizzle
      weatherId >= 500 && weatherId < 600 || // Rain
      weatherId >= 600 && weatherId < 700 || // Snow
      maxTemp > 33 || // Hot
      minTemp < 10 // Cold
    ) {
      return 2;
    }
    
    // Normal conditions
    return 1;
  };
  
  // Get background color based on severity level
  const getSeverityColor = (level) => {
    switch(level) {
      case 3: return '#ef4444'; // Red for high severity
      case 2: return '#f59e0b'; // Orange for medium
      default: return '#3b82f6'; // Blue for low
    }
  };

  // Format timestamp
  const getTimeString = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
    return `${Math.floor(minutes/1440)}d ago`;
  };

  // Close detailed view
  const closeDetailedView = () => {
    setShowDetailedView(false);
    setDetailedEvents([]);
  };

  // Add this function to get congestion class
  const getCongestionClass = (percent) => {
    if (percent > 50) return "congestion-high";
    if (percent > 25) return "congestion-medium";
    return "congestion-low";
  };

  return (
    <>
      <div className="event-container">
        <div className="event-header">
          <div className="event-title">Live Event Feed</div>
          <div className="event-subtitle">
            Last updated: {currentTime.toLocaleTimeString()}
          </div>
        </div>

        <div className="event-scroll">
          {isLoading ? (
            <div className="loading-events">
              <div className="loading-spinner"></div>
              <p>Fetching live events from Kolkata...</p>
            </div>
          ) : events.length > 0 ? (
            // Filter out any duplicate events before rendering
            events
              .filter((event, index, self) => 
                index === self.findIndex(e => e.id === event.id)
              )
              .map(event => (
                <div key={event.id} className="event-card">
                  <div className="icon-box" style={{ backgroundColor: event.bg }}>
                    {typeof event.icon === 'object' ? (
                      event.icon
                    ) : (
                      <img src={event.icon} alt={`${event.title} Icon`} className="icon-img" />
                    )}
                  </div>
                  <div className="event-content">
                    <div className="event-name">{event.title}</div>
                    <div className="event-description">{event.description}</div>
                    <div className="event-footer">
                      <span>{event.location}</span>
                      <span>{event.sources}</span>
                      <span>⏱️ {getTimeString(event.timestamp)}</span>
                    </div>
                  </div>
                  <div className={`event-level ${event.levelClass}`}>{event.level}</div>
                </div>
              ))
          ) : (
            <div className="no-events">
              <p>No events found for Kolkata at the moment.</p>
              <button onClick={initializeDataFetching} className="retry-button">Retry</button>
            </div>
          )}
        </div>

        <div className="event-footer-btn" onClick={handleLoadMore}>
          Load More Events
        </div>
      </div>

      {/* Detailed Events Modal View */}
      {showDetailedView && (
        <div className="event-detailed-overlay">
          <div className="event-detailed-container">
            <div className="event-detailed-header">
              <h2>Detailed Events for Kolkata</h2>
              <button className="close-button" onClick={closeDetailedView}>
                <FiX />
              </button>
            </div>
            
            <div className="event-detailed-content">
              {isLoadingMore ? (
                <div className="loading-events">
                  <div className="loading-spinner"></div>
                  <p>Fetching detailed events...</p>
                </div>
              ) : detailedEvents.length > 0 ? (
                <>
                  {/* Weather Detail Card - Display at the top of the detailed view */}
                  {events.find(e => e.id === 'weather-1') && (
                    <div className="event-detailed-card">
                      <div className="event-detailed-title-row">
                        <div className="icon-box" style={{ backgroundColor: '#3b82f6' }}>
                          <FiDroplet className="event-react-icon" />
                        </div>
                        <div>
                          <h3>Current Weather Details</h3>
                          <p className="event-timestamp">Latest weather data for Kolkata</p>
                        </div>
                      </div>
                      
                      <div className="event-detailed-info">
                        {(() => {
                          const weatherEvent = events.find(e => e.id === 'weather-1');
                          if (!weatherEvent) return null;
                          
                          const info = weatherEvent.detailedInfo;
                          return (
                            <>
                              <p className="event-description-large">
                                {weatherEvent.description}
                              </p>
                              
                              <div className="weather-details-grid">
                                <div className="weather-detail-item">
                                  <FiDroplet />
                                  <span className="weather-detail-label">Humidity</span>
                                  <span className="weather-detail-value">{info.humidity}</span>
                                </div>
                                <div className="weather-detail-item">
                                  <FiWind />
                                  <span className="weather-detail-label">Wind</span>
                                  <span className="weather-detail-value">{info.windSpeed} ({info.windDirection})</span>
                                </div>
                                <div className="weather-detail-item">
                                  <FiEye />
                                  <span className="weather-detail-label">Visibility</span>
                                  <span className="weather-detail-value">{info.visibility}</span>
                                </div>
                                <div className="weather-detail-item">
                                  <FiSun />
                                  <span className="weather-detail-label">Sunrise</span>
                                  <span className="weather-detail-value">{info.sunrise}</span>
                                </div>
                                <div className="weather-detail-item">
                                  <FiSun />
                                  <span className="weather-detail-label">Sunset</span>
                                  <span className="weather-detail-value">{info.sunset}</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Regular detailed events */}
                  {detailedEvents
                    .filter((event, index, self) => 
                      // Keep only the first occurrence of an event with this ID
                      index === self.findIndex(e => e.id === event.id)
                    )
                    .map(event => (
                      <div key={event.id} className="event-detailed-card">
                        <div className="event-detailed-title-row">
                          <div className="icon-box" style={{ backgroundColor: event.bg }}>
                            {typeof event.icon === 'object' ? (
                              event.icon
                            ) : (
                              <img src={event.icon} alt={`${event.title} Icon`} className="icon-img" />
                            )}
                          </div>
                          <div>
                            <h3>{event.title}</h3>
                            <p className="event-timestamp">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                          <div className={`event-level ${event.levelClass}`}>{event.level}</div>
                        </div>
                        
                        <div className="event-detailed-info">
                          <p className="event-description-large">{event.description}</p>
                          
                          {event.detailedInfo && (
                            <div className="event-data-grid">
                              {Object.entries(event.detailedInfo).map(([key, value], index) => {
                                // Skip some fields that we don't want to display directly
                                if (
                                  key === 'recommendations' || 
                                  key === 'fullDescription' || 
                                  key === 'mapUrl' || 
                                  key === 'hourlyForecasts' ||
                                  key === 'data'
                                ) {
                                  return null;
                                }
                                
                                return (
                                  <div key={index} className="event-data-item">
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</strong> 
                                    <span>{value}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          
                          {/* Map link if available */}
                          {event.detailedInfo?.mapUrl && (
                            <div className="event-map-link">
                              <a href={event.detailedInfo.mapUrl} target="_blank" rel="noopener noreferrer">
                                <FiMap /> View on Map
                              </a>
                            </div>
                          )}
                          
                          {/* Hourly forecast if available */}
                          {event.detailedInfo?.hourlyForecasts && (
                            <div className="hourly-forecast">
                              <h4>Hourly Forecast</h4>
                              <div className="hourly-forecast-grid">
                                {event.detailedInfo.hourlyForecasts.map((hourly, index) => (
                                  <div key={index} className="hourly-forecast-item">
                                    <div className="hourly-time">{hourly.time}</div>
                                    <div className="hourly-temp">{hourly.temp}</div>
                                    <div className="hourly-weather">{hourly.weather}</div>
                                    <div className="hourly-wind">Wind: {hourly.windSpeed}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Traffic impact section */}
                          {event.detailedInfo?.areaName && (
                            <div className="traffic-impact">
                              <h4>
                                <FiMap /> Traffic Impact in {event.detailedInfo.areaName}
                              </h4>
                              <div className="event-data-grid">
                                <div className="event-data-item">
                                  <strong>Current Speed</strong>
                                  <span>{event.detailedInfo.currentSpeed}</span>
                                </div>
                                <div className="event-data-item">
                                  <strong>Normal Speed</strong>
                                  <span>{event.detailedInfo.normalSpeed}</span>
                                </div>
                                <div className="event-data-item">
                                  <strong>Congestion</strong>
                                  <span>{event.detailedInfo.congestionPercent}</span>
                                </div>
                                <div className="event-data-item">
                                  <strong>Status</strong>
                                  <span>{event.detailedInfo.trafficStatus}</span>
                                </div>
                              </div>
                              {event.detailedInfo.recommendations && (
                                <div className="event-recommendations">
                                  <h4>Traffic Recommendations</h4>
                                  <p>{event.detailedInfo.recommendations}</p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {event.detailedInfo?.recommendations && !event.detailedInfo?.areaName && (
                            <div className="event-recommendations">
                              <h4>Recommendations</h4>
                              <p>{event.detailedInfo.recommendations}</p>
                            </div>
                          )}
                          
                          {/* Full description if available */}
                          {event.detailedInfo?.fullDescription && (
                            <div className="event-full-description">
                              <h4>Details</h4>
                              <p>{event.detailedInfo.fullDescription}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="event-detailed-footer">
                          <span>{event.location}</span>
                          <span>{event.sources}</span>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <div className="no-events">
                  <p>No detailed events found at this time.</p>
                </div>
              )}

              {/* Traffic overview - keep only one instance */}
              {detailedEvents.some(event => event.detailedInfo?.areaName) && (
                <div className="event-detailed-card">
                  <div className="event-detailed-title-row">
                    <div className="icon-box" style={{ backgroundColor: '#3b82f6' }}>
                      <FiMap className="event-react-icon" />
                    </div>
                    <div>
                      <h3>Kolkata Traffic Overview</h3>
                      <p className="event-timestamp">Current traffic conditions across the city</p>
                    </div>
                  </div>
                  
                  <div className="event-detailed-info">
                    <p className="event-description-large">
                      Traffic conditions vary across different areas in Kolkata. Here's a summary of current traffic flow in key locations.
                    </p>
                    
                    <div className="traffic-areas">
                      {detailedEvents
                        .filter(event => event.detailedInfo?.areaName)
                        .filter((event, index, self) => 
                          // Keep only first occurrence of an event with this area name
                          index === self.findIndex(e => 
                            e.detailedInfo?.areaName === event.detailedInfo.areaName
                          )
                        )
                        .map((event, index) => {
                          const congestion = event.detailedInfo.congestionPercent?.replace('%', '') || "0";
                          return (
                            <div key={`area-${index}`} className="traffic-area-item">
                              <div className="traffic-area-name">{event.detailedInfo.areaName}</div>
                              <div className="traffic-congestion">
                                <span className={`traffic-congestion-indicator ${getCongestionClass(parseInt(congestion))}`}></span>
                                {event.detailedInfo.trafficStatus} ({event.detailedInfo.congestionPercent})
                              </div>
                              <div className="traffic-speed">Speed: {event.detailedInfo.currentSpeed}</div>
                            </div>
                          );
                        })
                      }
                    </div>
                    
                    <div className="event-map-link">
                      <a href={`https://www.tomtom.com/en_gb/maps/map/?lat=${kolkataCenter.lat}&lon=${kolkataCenter.lng}&zoom=13`} target="_blank" rel="noopener noreferrer">
                        <FiMap /> View Traffic Map
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Event;