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

const Event = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("events")) || [];
    setEvents(stored);
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem("events");
    setEvents([]);
  };

  return (
    <div className="event">
      <div className="event-header">
        <h2 className="event-title">Live Event Feed</h2>
        {events.length > 0 && (
          <button onClick={handleClearAll} className="clear-button">
            🗑️ Clear All
          </button>
        )}
      </div>

      {events.map((event, index) => {
        const { type, location } = parseDescription(event.description);
        return (
          <div className="event-card" key={index}>
            <div className="icon-box">{getIcon(type)}</div>
            <div className="event-content">
              <div className="event-name">{type} reported</div>
              <div className="event-description">📍 {location}</div>
              <div className="event-footer">
                <span>{event.location || location}</span>
                <span>👥 {event.sources} source</span>
              </div>
            </div>
            <div className={`event-level level-${event.level}`}>Level {event.level}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Event;
