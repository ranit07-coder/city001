import React from 'react';
import './HappeningNow.css';
import { FiAlertCircle, FiPower, FiMapPin } from 'react-icons/fi';

const HappeningNow = ({ reports, getIncidentIcon }) => {
  return (
    <>
      <div className="filter-section">
        <label htmlFor="area-select">Filter by area:</label>
        <select id="area-select">
          <option>All Areas</option>
          <option>Salt Lake</option>
          <option>Park Street</option>
          <option>New Town</option>
        </select>
      </div>
      
      {/* Display user reports first */}
      <div className="alerts-container">
        {reports && reports.length > 0 ? (
          reports.map((report, index) => (
            <AlertCard
              key={`report-${index}`}
              icon={getIncidentIcon(report.type)}
              title={report.title || "Incident Report"}
              location={report.location || "Location not specified"}
              time={report.timestamp ? new Date(report.timestamp).toRelativeTimeString() : "Recently"}
              description={report.description || "No description provided"}
              label={report.level >= 3 ? "Urgent" : "Info"}
              labelClass={report.level >= 3 ? "urgent" : "info"}
              actions={[report.action || "No specific actions provided"]}
              duration={report.impact || "Duration not specified"}
              reports={`Reported by user at ${new Date(report.timestamp).toLocaleTimeString()}`}
              helpful="Helpful (0)"
            />
          ))
        ) : (
          <p className="no-reports-message">No user reports yet. Be the first to report an incident!</p>
        )}
        
        {/* Static alerts with enhanced styling */}
        <AlertCard
          icon={<FiAlertCircle className="icon-glow" />}
          title="Traffic Jam on EM Bypass"
          location="EM Bypass"
          time="2 minutes ago"
          description="Heavy traffic reported. Use alternate routes."
          label="Urgent"
          labelClass="urgent"
          actions={["Take alternate route via AJC Bose Road"]}
          duration="Expected to clear in 45 minutes"
          reports="Reported by 23 people"
          helpful="Helpful (15)"
        />

        <AlertCard
          icon={<FiPower className="icon-glow" />}
          title="Power Cut in Salt Lake"
          location="Salt Lake Sector V"
          time="8 minutes ago"
          description="Electricity is out in some areas. CESC is working on it."
          label="Important"
          labelClass="important"
          actions={["Use backup power if available"]}
          duration="Expected to be fixed in 2 hours"
          reports="Reported by 8 people"
          helpful="Helpful (12)"
        />

        <AlertCard
          icon={<FiMapPin className="icon-glow" />}
          title="Street Festival at Victoria Memorial"
          location="Victoria Memorial"
          time="15 minutes ago"
          description="Fun cultural event happening now. Come join!"
          label="Info"
          labelClass="info"
          actions={["Parking is limited - use public transport"]}
          duration="Event runs until 8 PM"
          reports="Reported by 12 people"
          helpful="Helpful (34)"
        />
      </div>
    </>
  );
};

// AlertCard component (re-using the same component)
const AlertCard = ({ icon, title, location, time, description, label, labelClass, actions, duration, reports, helpful }) => (
  <div className={`alert-card ${labelClass}-card`}>
    <div className="alert-header">
      <div className="alert-main">
        <div className="icon-container">
          {icon}
        </div>
        <div>
          <div className="alert-title-gradient">{title}</div>
          <div className="alert-meta">
            <span>{location}</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
      <span className={`alert-label ${labelClass}`}>{label}</span>
    </div>
    <div className="alert-description">{description}</div>
    <div className="alert-what">
      <div className="what-title">What to do</div>
      <ul>
        {actions.map((action, index) => (
          <li key={index}>{action}</li>
        ))}
      </ul>
      <div className="howlong-title">How long</div>
      <ul>
        <li>{duration}</li>
      </ul>
    </div>
    <div className="alert-footer">
      <span>{reports}</span>
      <span className="helpful">{helpful}</span>
    </div>
  </div>
);

export default HappeningNow;