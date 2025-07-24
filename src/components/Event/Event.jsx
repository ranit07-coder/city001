import React from "react";
import { FaCarCrash, FaBolt, FaWater, FaExclamationTriangle, FaUserSecret } from "react-icons/fa";
import "./Event.css";

const Event = () => {
  const latestEvent = JSON.parse(localStorage.getItem("latestEvent"));

  const renderIcon = (type) => {
    switch (type) {
      case "traffic-jam-accident":
        return <FaCarCrash size={24} color="#ef4444" />;
      case "pothole":
        return <FaExclamationTriangle size={24} color="#f59e0b" />;
      case "water-logging":
        return <FaWater size={24} color="#3b82f6" />;
      case "crime":
        return <FaUserSecret size={24} color="#a855f7" />;
      default:
        return <FaBolt size={24} color="#10b981" />;
    }
  };

  return (
    <div className="event-container">
      <div className="event-header">
        <h2 className="event-title">Live Event Feed</h2>
      </div>

      {latestEvent && (
        <div className="event-card">
          <div className="icon-box">
            {renderIcon(latestEvent.title)}
          </div>
          <div className="event-content">
            <div className="event-name">{latestEvent.title}</div>
            <div className="event-description">{latestEvent.description}</div>
            <div className="event-footer">
              <span>📍 {latestEvent.location}</span>
              <span>👥 {latestEvent.sources} source</span>
            </div>
          </div>
          <div className="event-level level-3">Level {latestEvent.level}</div>
        </div>
      )}
    </div>
  );
};

export default Event;
