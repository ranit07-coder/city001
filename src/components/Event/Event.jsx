import React from "react";
import "./Event.css";
import { AlertCircle, Car, MapPin, Construction, CloudDrizzle, Trash2 } from "lucide-react";

const getIcon = (type) => {
  switch (type.toLowerCase()) {
    case "pothole": return <Construction size={20} />;
    case "traffic jam":
    case "traffic": return <Car size={20} />;
    case "waterlogging":
    case "flood": return <CloudDrizzle size={20} />;
    case "garbage": return <Trash2 size={20} />;
    case "accident": return <AlertCircle size={20} />;
    default: return <AlertCircle size={20} />;
  }
};

const parseDescription = (description) => {
  if (!description || !description.toLowerCase().startsWith("detected:")) {
    return { type: "Civic Alert", location: "Unspecified Area" };
  }
  const cleaned = description.replace("Detected:", "").trim();
  const [issue, ...locationParts] = cleaned.split(" near ");
  return {
    type: issue.charAt(0).toUpperCase() + issue.slice(1),
    location: locationParts.join(" near ") || "Unknown"
  };
};

const Event = () => {
  const latestEvent = JSON.parse(localStorage.getItem("latestEvent"));

  return (
    <div className="event">
      <div className="event-header">
        <h2 className="event-title">Live Event Feed</h2>
      </div>

      {latestEvent && (() => {
        const { type, location } = parseDescription(latestEvent.description);
        return (
          <div className="event-card">
            <div className="icon-box">
              {getIcon(type)}
            </div>
            <div className="event-content">
              <div className="event-name">{type} reported</div>
              <div className="event-description">📍 {location}</div>
              <div className="event-footer">
                <span>{latestEvent.location}</span>
                <span>👥 {latestEvent.sources} source</span>
              </div>
            </div>
            <div className={`event-level level-${latestEvent.level}`}>Level {latestEvent.level}</div>
          </div>
        );
      })()}
    </div>
  );
};

export default Event;
