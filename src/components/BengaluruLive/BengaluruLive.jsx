import React from 'react';
import './BengaluruLive.css';
import { FiAlertCircle, FiPower, FiMapPin, FiCloudRain, FiX } from 'react-icons/fi';

const BengaluruLive = ({ onClose }) => {
  return (
    <div className="bengaluru-live-page">
      <div className="top-nav">
        <div className="top-left">
          <div className="top-title">Bengaluru Live</div>
          <div className="nav-tabs">
            <button className="active-tab">Happening Now</button>
            <button>My Area</button>
            <button>Important Alerts</button>
          </div>
        </div>
        <button className="close-icon" onClick={onClose} title="Close">
          <FiX size={20} color="#000" />
        </button>
      </div>

      <div className="filter-section">
        <label htmlFor="area-select">Filter by area:</label>
        <select id="area-select">
          <option>All Areas</option>
          <option>Whitefield</option>
          <option>Koramangala</option>
          <option>HSR Layout</option>
        </select>
      </div>

      <AlertCard
        icon={<FiAlertCircle className="icon-glow" />}
        title="Traffic Jam on Airport Road"
        location="Old Airport Road"
        time="2 minutes ago"
        description="Heavy traffic reported. Use Outer Ring Road instead."
        label="Urgent"
        labelClass="urgent"
        actions={["Take alternate route via Outer Ring Road"]}
        duration="Expected to clear in 45 minutes"
        reports="Reported by 23 people"
        helpful="Helpful (15)"
      />

      <AlertCard
        icon={<FiPower className="icon-glow" />}
        title="Power Cut in HSR Layout"
        location="HSR Layout"
        time="8 minutes ago"
        description="Electricity is out in some areas. BESCOM is working on it."
        label="Important"
        labelClass="important"
        actions={["Use backup power if available"]}
        duration="Expected to be fixed in 2 hours"
        reports="Reported by 8 people"
        helpful="Helpful (12)"
      />

      <AlertCard
        icon={<FiMapPin className="icon-glow" />}
        title="Street Festival at Cubbon Park"
        location="Cubbon Park"
        time="15 minutes ago"
        description="Fun cultural event happening now. Come join!"
        label="Info"
        labelClass="info"
        actions={["Parking is limited - use public transport"]}
        duration="Event runs until 8 PM"
        reports="Reported by 12 people"
        helpful="Helpful (34)"
      />

      <AlertCard
        icon={<FiCloudRain className="icon-glow" />}
        title="Heavy Rain in Koramangala"
        location="Koramangala"
        time="5 minutes ago"
        description="Roads are flooded. Avoid driving if possible."
        label="Urgent"
        labelClass="urgent"
        actions={["Stay indoors or use main roads only"]}
        duration="Rain expected for next 2 hours"
        reports="Reported by 19 people"
        helpful="Helpful (28)"
      />
    </div>
  );
};

const AlertCard = ({ icon, title, location, time, description, label, labelClass, actions, duration, reports, helpful }) => (
  <div className="alert-card">
    <div className="alert-header">
      <div className="alert-main">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {icon}
          <div>
            <div className="alert-title-gradient">{title}</div>
            <div className="alert-meta">{location} • {time}</div>
          </div>
        </div>
      </div>
      <span className={`alert-label ${labelClass}`}>{label}</span>
    </div>
    <div className="alert-description">{description}</div>
    <div className="alert-what">
      <div className="what-title">What to do:</div>
      <ul>
        {actions.map((action, index) => (
          <li key={index}>{action}</li>
        ))}
      </ul>
      <div className="howlong-title">How long:</div>
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

export default BengaluruLive;
