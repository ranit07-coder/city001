import React, { useState, useEffect } from "react";
import "./Event.css";
import {
  AlertCircle,
  Car,
  MapPin,
  Construction,
  CloudDrizzle,
  Trash2
} from "lucide-react";

// Map issue types to icons
const getIcon = (type) => {
  switch (type.toLowerCase()) {
    case "pothole":
      return <Construction size={20} />;
    case "traffic jam":
    case "traffic":
      return <Car size={20} />;
    case "waterlogging":
    case "flood":
      return <CloudDrizzle size={20} />;
    case "garbage":
      return <Trash2 size={20} />;
    case "accident":
      return <AlertCircle size={20} />;
    default:
      return <AlertCircle size={20} />;
  }
};

// Smart parsing of Gemini/Manual descriptions
const parseDescription = (description) => {
  if (!description || typeof description !== "string") {
    return { type: "Citizen Reported Incident", location: "Unspecified" };
  }

  const cleaned = description
    .replace(/^Detected:/i, "")
    .replace(/\.+$/, "")
    .trim();

  const keywords = ["near", "at", "in", "around"];
  for (let keyword of keywords) {
    const parts = cleaned.split(new RegExp(`\\s+${keyword}\\s+`, "i"));
    if (parts.length === 2) {
      return {
        type: parts[0].trim().charAt(0).toUpperCase() + parts[0].trim().slice(1),
        location: parts[1].trim()
      };
    }
  }

  return {
    type: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
    location: "Unspecified"
  };
};

const PredictiveAlerts = ({ events }) => {
  const generatePredictions = (events) => {
    const predictions = [];
    
    // Group events by area
    const areaEvents = events.reduce((acc, event) => {
      if (!acc[event.location]) {
        acc[event.location] = [];
      }
      acc[event.location].push(event);
      return acc;
    }, {});

    // Analyze patterns
    Object.entries(areaEvents).forEach(([area, events]) => {
      // Multiple similar events in same area
      const typeCounts = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {});

      Object.entries(typeCounts).forEach(([type, count]) => {
        if (count >= 3) {
          predictions.push({
            type: 'pattern',
            message: `Multiple ${type} reports in ${area} indicate a persistent issue`,
            severity: 'high'
          });
        }
      });
    });

    return predictions;
  };

  const predictions = generatePredictions(events);

  return predictions.length > 0 ? (
    <div className="predictions-section">
      <h3>📊 Predictive Alerts</h3>
      {predictions.map((pred, i) => (
        <div key={i} className={`prediction-card ${pred.severity}`}>
          {pred.message}
        </div>
      ))}
    </div>
  ) : null;
};

const Event = () => {
  const [events, setEvents] = useState([]);
  const [aggregatedEvents, setAggregatedEvents] = useState({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("events")) || [];
    setEvents(stored);

    // Aggregate similar events
    const aggregated = stored.reduce((acc, event) => {
      const key = `${event.type}-${event.location}`;
      if (!acc[key]) {
        acc[key] = {
          ...event,
          sources: 1,
          reports: [event]
        };
      } else {
        acc[key].sources++;
        acc[key].reports.push(event);
        if (event.level > acc[key].level) {
          acc[key].level = event.level;
        }
      }
      return acc;
    }, {});

    setAggregatedEvents(aggregated);
  }, [events]); // Add events as a dependency

  // Update the handleClearAll function
  const handleClearAll = () => {
    localStorage.removeItem("events");
    setEvents([]);
    setAggregatedEvents({}); // Add this line to clear aggregated events
  };

  return (
    <div className="event">
      <div className="event-header">
        <h2 className="event-title">Live Event Feed</h2>
        {Object.keys(aggregatedEvents).length > 0 && (
          <button onClick={handleClearAll} className="clear-button">
            🗑️ Clear All
          </button>
        )}
      </div>

      {Object.values(aggregatedEvents).map((event, index) => (
        <div className="event-card" key={index}>
          <div className="icon-box">{getIcon(event.type)}</div>
          <div className="event-content">
            <div className="event-name">{event.type}</div>
            <div className="event-description">
              <div>📍 {event.location}</div>
              {event.impact && <div>⏱️ {event.impact}</div>}
              {event.action && <div>💡 {event.action}</div>}
            </div>
            <div className="event-footer">
              <span>👥 {event.sources} reports</span>
              <span className="event-timestamp">
                {new Date(event.reports[0].timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className={`event-level level-${event.level}`}>
            Level {event.level}
          </div>
        </div>
      ))}
      <PredictiveAlerts events={events} />
    </div>
  );
};

export default Event;
