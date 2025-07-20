import React from 'react';
import './Event.css';

// Import your icons (make sure the paths are correct)
import car from '../../assets/car.png';
import drop from '../../assets/drop.png';
import musicalnote from '../../assets/musical-note.png';

const Event = () => {
  return (
    <div className="event-container">
      <div className="event-header">
        <div className="event-title">Live Event Feed</div>
        <div className="event-subtitle">Real-time updates</div>
      </div>

      <div className="event-scroll">
        {/* Event 1 */}
        <div className="event-card">
          <div className="icon-box" style={{ backgroundColor: '#ef4444' }}>
            <img src={car} alt="Traffic Icon" className="icon-img" />
          </div>
          <div className="event-content">
            <div className="event-name">Heavy Traffic on Old Airport Road</div>
            <div className="event-description">
              Multiple reports of congestion near Marathahalli. Consider alternate routes via Outer Ring Road.
            </div>
            <div className="event-footer">
              <span>📍 Marathahalli Junction</span>
              <span>👥 12 sources</span>
            </div>
          </div>
          <div className="event-level level-4">Level 4</div>
        </div>

        {/* Event 2 */}
        <div className="event-card">
          <div className="icon-box" style={{ backgroundColor: '#3b82f6' }}>
            <img src={drop} alt="Rain Icon" className="icon-img" />
          </div>
          <div className="event-content">
            <div className="event-name">Light Rain Expected</div>
            <div className="event-description">
              Weather stations indicate 60% chance of rain in next 2 hours. Carry umbrellas.
            </div>
            <div className="event-footer">
              <span>📍 City-wide</span>
              <span>👥 4 sources</span>
            </div>
          </div>
          <div className="event-level level-2">Level 2</div>
        </div>

        {/* Event 3 */}
        <div className="event-card">
          <div className="icon-box" style={{ backgroundColor: '#f97316' }}>
            <img src={drop} alt="Water Icon" className="icon-img" />
          </div>
          <div className="event-content">
            <div className="event-name">Water Supply Interruption</div>
            <div className="event-description">
              Scheduled maintenance in HSR Layout. Water supply restored by 6 PM.
            </div>
            <div className="event-footer">
              <span>📍 HSR Layout</span>
              <span>👥 8 sources</span>
            </div>
          </div>
          <div className="event-level level-3">Level 3</div>
        </div>

        {/* Event 4 */}
        <div className="event-card">
          <div className="icon-box" style={{ backgroundColor: '#8b5cf6' }}>
            <img src={musicalnote} alt="Festival Icon" className="icon-img" />
          </div>
          <div className="event-content">
            <div className="event-name">Street Festival at Brigade Road</div>
            <div className="event-description">
              Cultural event causing road closures. Expect delays and enjoy the festivities!
            </div>
            <div className="event-footer">
              <span>📍 Brigade Road</span>
              <span>👥 25 sources</span>
            </div>
          </div>
          <div className="event-level level-1">Level 1</div>
        </div>
      </div>

      <div className="event-footer-btn">Load More Events</div>
    </div>
  );
};

export default Event;
