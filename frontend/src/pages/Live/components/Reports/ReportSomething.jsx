import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportSomething.css';
import download from './assets/download.png';
import bell from './assets/bell.png';
import dotsMenu from './assets/dots-menu.png';
import { FiArrowLeft, FiCamera, FiMapPin, FiSend, FiX, FiAlertCircle } from 'react-icons/fi';

const GEMINI_API_KEY = "AIzaSyAcbDCRBsGMY1JTAc5yHHAeAYWjRNRwo50";

const SYSTEM_PROMPT = `You are UrbanLens AI, an advanced city monitoring agent for Kolkata. Analyze the image to:

2. LOCATE near VERIFIED LANDMARKS:
- Major Roads: EM Bypass, AJC Bose Road, Park Street
- Tech Hubs: Salt Lake Sector V, New Town, Park Street
- Markets: New Market, Gariahat, South City Mall
- Junctions: Park Circus, Exide Crossing, Esplanade
- Areas: Salt Lake, New Town, Ballygunge
`;

const ReportSomething = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    incidentType: 'traffic-jam-accident',
    description: '',
    photo: null,
    location: '',
    impact: '',
    action: '',
    level: 2,
    timestamp: new Date().toISOString()
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Add animation effect when component mounts
  useEffect(() => {
    const form = document.querySelector('.report-form');
    if (form) {
      setTimeout(() => {
        form.classList.add('form-visible');
      }, 100);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "location") fetchLocationSuggestions(value);
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query) return setLocationSuggestions([]);
    const url = `https://api.maptiler.com/geocoding/${query}.json?key=KdLhMN46zBrXqGDvET6g&language=en&country=IN&limit=5`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const suggestions = data.features.map(f => f.place_name);
      setLocationSuggestions(suggestions);
    } catch (err) {
      console.error("Failed to fetch location suggestions:", err);
      setLocationSuggestions([]);
    }
  };

  const handleSuggestionClick = (location) => {
    setFormData(prev => ({ ...prev, location }));
    setLocationSuggestions([]);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({ ...prev, photo: file }));
    setPreviewUrl(URL.createObjectURL(file));
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: SYSTEM_PROMPT },
                  {
                    inlineData: {
                      mimeType: file.type,
                      data: base64Image
                    }
                  }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        setIsAnalyzing(false);

        if (aiText) {
          try {
            const [detection, impact, action] = aiText.split('\n');
            const [type, location] = detection.replace('Detected:', '').trim().split(' near ');
            
            if (!type || !location) {
              throw new Error('Invalid AI response format');
            }

            setFormData(prev => ({
              ...prev,
              incidentType: type.toLowerCase().trim(),
              description: `${type} detected near ${location}`,
              location: location.trim(),
              impact: impact.replace('Impact:', '').trim(),
              action: action.replace('Action:', '').trim(),
              level: getIncidentLevel(type),
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error("Failed to parse AI response:", error);
            showNotification("Failed to analyze image. Please try again or enter details manually.", "error");
          }
        } else {
          console.warn("Gemini returned no result.");
          showNotification("Could not analyze image. Please provide details manually.", "warning");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsAnalyzing(false);
      console.error("AI analysis failed:", err);
      showNotification("Image analysis failed. Please try again.", "error");
    }
  };

  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
      setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }, 100);
  };

  const getIncidentLevel = (type) => {
    const levels = {
      'Traffic Jam': 2,
      'Traffic jam': 2,
      'Major Accident': 4,
      'Accident': 4,
      'Pothole': 2,
      'Water Logging': 3,
      'Waterlogging': 3,
      'Crime': 4,
      'Garbage': 2,
      'Tree Fall': 3,
      'Power Issue': 3,
      'Public Safety': 4,
      'Other Issue': 2
    };
    
    const normalizedType = type.toLowerCase().trim();
    return levels[type] || levels[Object.keys(levels).find(key => 
      key.toLowerCase() === normalizedType
    )] || 2;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Format the incident type
    const incidentMap = {
      'traffic-jam-accident': 'Traffic Jam',
      'pothole': 'Pothole',
      'water-logging': 'Water Logging',
      'crime': 'Crime',
      'other': 'Other Issue'
    };

    // Get the formatted incident type
    const formattedType = incidentMap[formData.incidentType] || formData.incidentType;

    // Create the report object
    const newReport = {
      title: formattedType,
      description: formData.description || `${formattedType} reported`,
      location: formData.location || "Unknown Area",
      level: getIncidentLevel(formattedType),
      type: formattedType,
      timestamp: new Date().toISOString(),
      impact: formData.impact || null,
      action: formData.action || null
    };

    try {
      // Store in a separate storage key for reports
      const reports = JSON.parse(localStorage.getItem("reports") || "[]");
      localStorage.setItem("reports", JSON.stringify([newReport, ...reports]));
      
      // Show success animation
      showNotification("Report submitted successfully!", "success");
      
      // Add delay for animation
      setTimeout(() => {
        // Navigate back to kolkata-live page
        navigate("/kolkata-live");
      }, 1000);
      
    } catch (error) {
      console.error("Failed to save report:", error);
      showNotification("Failed to submit report. Please try again.", "error");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Add exit animation
    const form = document.querySelector('.report-form');
    if (form) {
      form.classList.remove('form-visible');
      form.classList.add('form-exit');
      setTimeout(() => {
        navigate("/kolkata-live");
      }, 300);
    } else {
      navigate("/kolkata-live");
    }
  };

  return (
    <div className="report-page">
      <div className="navbar">
        <img src={download} alt="" className="pic" />
        <div className="navbar-left">
          <div className="city">UrbanLens</div>
          <div className="urbancity">Kolkata Live Intelligence</div>
        </div>
        <div className="datetime">
          <div className="time">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <div className="date">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              day: '2-digit',
              month: 'short'
            })}
          </div>
        </div>
        <button className="bell-button"><img src={bell} alt="" className="bell" /></button>
        <button className="menu-button"><img src={dotsMenu} alt="" className="dots-menu" /></button>
      </div>

      <main className="report-content">
        <form onSubmit={handleSubmit} className="report-form">
          <header className="report-header">
            <div className="report-title-container">
              <button type="button" onClick={handleClose} className="back-button" aria-label="Go back">
                <FiArrowLeft />
              </button>
              <h1 className="report-title">Report an Incident</h1>
            </div>
            <button type="button" className="report-close-button" onClick={handleClose} aria-label="Close form">
              <FiX />
            </button>
          </header>

          <section className="report-section">
            <label htmlFor="incidentType" className="report-label">
              <FiAlertCircle className="input-icon" />
              What's happening?
            </label>
            <div className="report-select-wrapper">
              <select id="incidentType" name="incidentType" className="report-select" value={formData.incidentType} onChange={handleInputChange}>
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

          <section className="report-section">
            <label htmlFor="action" className="report-label">What to do?</label>
            <textarea 
              id="action" 
              name="action" 
              className="report-textarea" 
              placeholder="What should people do about this situation?" 
              rows="3" 
              value={formData.action} 
              onChange={handleInputChange}
            ></textarea>
          </section>

          <section className="report-section">
            <label htmlFor="impact" className="report-label">How long?</label>
            <textarea 
              id="impact" 
              name="impact" 
              className="report-textarea" 
              placeholder="How long do you expect this situation to last?" 
              rows="2" 
              value={formData.impact} 
              onChange={handleInputChange}
            ></textarea>
          </section>

          <section className="report-section">
            <label htmlFor="location" className="report-label">
              <FiMapPin className="input-icon" />
              Location
            </label>
            <input id="location" name="location" type="text" className="report-input" placeholder="Start typing area (e.g. Salt Lake)" value={formData.location} onChange={handleInputChange} autoComplete="off" />
            {locationSuggestions.length > 0 && (
              <ul className="location-suggestions">
                {locationSuggestions.map((loc, i) => (
                  <li className="suggestion-item" key={i} onClick={() => handleSuggestionClick(loc)}>{loc}</li>
                ))}
              </ul>
            )}
          </section>

          {previewUrl && (
            <div className={`photo-preview ${isAnalyzing ? 'analyzing' : ''}`}>
              <img src={previewUrl} alt="Preview" className="preview-img" />
              {isAnalyzing && <div className="analyzing-overlay">
                <div className="loading-spinner"></div>
                <p>Analyzing image...</p>
              </div>}
            </div>
          )}

          <footer className="report-footer">
            <div className="report-actions">
              <label htmlFor="photo-upload" className="report-action-button photo-button">
                <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                <FiCamera className="button-icon" /> Add Photo
              </label>
              <button type="submit" className="send-button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="button-spinner"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="button-icon" /> Send Report
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
};

export default ReportSomething;