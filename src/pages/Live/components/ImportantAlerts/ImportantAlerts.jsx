import React from 'react';
import './ImportantAlerts.css';
import { FiAlertCircle } from 'react-icons/fi';

const ImportantAlerts = ({ getImportantAlerts, getIncidentIcon }) => {
  return (
    <>
      <div className="important-header">
        <FiAlertCircle className="important-icon" />
        <h2>Important & Urgent Alerts</h2>
      </div>

      <div className="alerts-container">
        {getImportantAlerts().map((alert, index) => (
          <AlertCard
            key={`important-${index}`}
            icon={alert.icon || getIncidentIcon(alert.type)}
            title={alert.title}
            location={alert.location}
            time={alert.time}
            description={alert.description}
            label={alert.label}
            labelClass={alert.labelClass}
            actions={alert.actions}
            duration={alert.duration}
            reports={alert.reports}
            helpful={alert.helpful}
          />
        ))}
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

export default ImportantAlerts;