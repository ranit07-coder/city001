import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportSomething.css';
import download from '../../assets/download.png';
import bell from '../../assets/bell.png';

// Functional component for the Report Something page
const ReportSomething = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    incidentType: 'traffic-jam-accident',
    description: '',
    photo: null,
    location: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting report:', formData);
    // Add your submission logic here
    navigate('/');
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="report-page">
      <nav className="navbar">
        <img src={download} alt="" className='pic' />
        <div className='navbar-left'>
          <div className='city'>UrbanLance</div>
          <div className='urbancity'>Bengaluru Live Intelligence</div>
        </div>
        <div className='datetime'>
          <div className='time'>
            {currentTime.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit', 
              hour12: false 
            })}
          </div>
          <div className='date'>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              day: '2-digit',
              month: 'short'
            })}
          </div>
        </div>
        <button className='bell-button'>
          <img src={bell} alt="" className='bell' />
        </button>
      </nav>

      <main className="report-content">
        <form onSubmit={handleSubmit} className="report-form">
          <header className="report-header">
            <h1 className="report-title">Report an Incident</h1>
            <button type="button" className="report-close-button" onClick={handleClose}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </header>

          <section className="report-section">
            <label htmlFor="incidentType" className="report-label">What's happening?</label>
            <div className="report-select-wrapper">
              <select 
                id="incidentType" 
                name="incidentType"
                className="report-select"
                value={formData.incidentType}
                onChange={handleInputChange}
              >
                <option value="traffic-jam-accident">Traffic Jam or Accident</option>
                <option value="pothole">Pothole</option>
                <option value="water-logging">Water Logging</option>
                <option value="crime">Crime</option>
                <option value="other">Other</option>
              </select>
            </div>
          </section>

          <section className="report-section">
            <label htmlFor="description" className="report-label">Tell us more</label>
            <textarea
              id="description"
              name="description"
              className="report-textarea"
              placeholder="What exactly is happening? Where is it?"
              rows="5"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </section>

          <footer className="report-footer">
            <div className="report-actions">
              <div className="action-group-left">
                <button type="button" className="report-action-button photo-button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
                    <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3H4.5a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" />
                  </svg>
                  Add Photo
                </button>
                <button type="button" className="cancel-button" onClick={handleClose}>
                  Cancel
                </button>
              </div>
              
              <div className="action-group-right">
                <button type="button" className="report-action-button location-button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path fillRule="evenodd" d="M11.54 3.47a.75.75 0 0 1 1.06 0l8.932 8.932a.75.75 0 0 1 0 1.06l-8.932 8.932a.75.75 0 0 1-1.06 0l-8.932-8.932a.75.75 0 0 1 0-1.06l8.932-8.932Z" />
                  </svg>
                  Add Location
                </button>
                <button type="submit" className="send-button">
                  Send Reports
                </button>
              </div>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
};

export default ReportSomething;
