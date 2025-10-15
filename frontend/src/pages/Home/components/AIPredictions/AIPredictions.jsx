import React, { useEffect, useState } from 'react';
import './AIPredictions.css';
import locationIcon from '../../assets/location.png';
import clockIcon from '../../assets/clock.png';
import { api } from '../../../../lib/api';

const SeverityBadge = ({ level }) => (
  <span className={`severity-badge ${level}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
);

const AIPredictions = () => {
  const [windowLabel, setWindowLabel] = useState('Next 6 hours');
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { window, predictions } = await api("/api/predictions");
        if (mounted) {
          setWindowLabel(window || 'Next 6 hours');
          setItems(predictions || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="ai-container">
      <div className="ai-header">
        <h3>AI Predictions</h3>
        <span>{windowLabel}</span>
      </div>

      {items.map((p, i) => (
        <div className="ai-card" key={i}>
          <div className="ai-card-left">
            <div className="ai-title-row">
              <h4>{p.title}</h4>
              <SeverityBadge level={p.severity || 'low'} />
            </div>
            <p className="ai-description">{p.description}</p>
          </div>

          <div className="cards">
            <div className="ai-meta">
              <div className="location">
                <img src={locationIcon} alt="loc" />
              </div>
              <div className="hours">{p.area}</div>
            </div>

            <div className="ai-card-right">
              <div className="confidence">{p.confidence}%<span> confidence</span></div>
            </div>

            <div className="time1">
              <div><img src={clockIcon} alt="clock" className='timeimg' /></div>
              <div>{p.window}</div>
            </div>
          </div>

          <div className="progress-wrapper">
            <div className="progress-track">
              <div
                className="progress-bar"
                style={{
                  width: `${p.confidence}%`,
                  backgroundColor:
                    (p.severity === 'high' && '#ff4d4f') ||
                    (p.severity === 'medium' && '#facc15') ||
                    '#22c55e'
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIPredictions;
