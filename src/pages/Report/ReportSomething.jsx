import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportSomething.css';
import download from '../../assets/download.png';
import bell from '../../assets/bell.png';

const GEMINI_API_KEY = "AIzaSyAcbDCRBsGMY1JTAc5yHHAeAYWjRNRwo50";

const SYSTEM_PROMPT = `You are UrbanLens AI, an advanced city monitoring agent for Bengaluru. Analyze the image to:

1. IDENTIFY PRIMARY ISSUE (Choose closest match):
- Traffic Jam (Level 2)
- Major Accident (Level 4)
- Road Damage/Pothole (Level 2)
- Waterlogging/Flooding (Level 3)
- Garbage Accumulation (Level 2)
- Tree Fall (Level 3)
- Power Infrastructure (Level 3)
- Public Safety (Level 4)

2. LOCATE near VERIFIED LANDMARKS:
- Major Roads: MG Road, Old Airport Road, Outer Ring Road
- Tech Hubs: Electronic City, Whitefield, Manyata
- Markets: KR Market, Commercial Street
- Junctions: Silk Board, Hebbal, Marathahalli
- Areas: Indiranagar, Koramangala, HSR Layout

3. PREDICT IMPACT:
- Estimate duration
- Affected radius
- Suggested actions

Respond EXACTLY in this format:
Detected: [Issue Type] near [Landmark]
Impact: [Duration] | [Radius] affected
Action: [Specific recommendation]`;

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
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === "location") fetchLocationSuggestions(value);
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query) return setLocationSuggestions([]);
    const url = `https://api.maptiler.com/geocoding/${query}.json?key=KdLhMN46zBrXqGDvET6g&language=en&country=IN&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    const suggestions = data.features.map(f => f.place_name);
    setLocationSuggestions(suggestions);
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
              description: `${type} detected near ${location}. ${action.replace('Action:', '').trim()}`,
              location: location.trim(),
              impact: impact.replace('Impact:', '').trim(),
              action: action.replace('Action:', '').trim(),
              level: getIncidentLevel(type),
              timestamp: new Date().toISOString()
            }));
          } catch (error) {
            console.error("Failed to parse AI response:", error);
            alert("Failed to analyze image. Please try again or enter details manually.");
          }
        } else {
          console.warn("Gemini returned no result.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("AI analysis failed:", err);
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

    // Create the event object
    const newEvent = {
      title: formattedType,
      description: formData.description || `${formattedType} reported`,
      location: formData.location || "Unknown Area",
      level: getIncidentLevel(formattedType),
      sources: 1,
      type: formattedType,
      area: formData.location || "Unknown Area",
      timestamp: new Date().toISOString(),
      impact: formData.impact || null,
      action: formData.action || null
    };

    try {
      const existing = JSON.parse(localStorage.getItem("events") || "[]");
      localStorage.setItem("events", JSON.stringify([newEvent, ...existing]));
      navigate("/");
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to submit report. Please try again.");
    }

    // Test code
    localStorage.setItem('test', 'test');
    localStorage.getItem('test');
  };

  const handleClose = () => navigate("/");

  return (
    <div className="report-page">
      <nav className="navbar">
        <img src={download} alt="logo" className='pic' />
        <div className='navbar-left'>
          <div className='city'>UrbanLense</div>
          <div className='urbancity'>Bengaluru Live Intelligence</div>
        </div>
        <div className='datetime'>
          <div className='time'>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
          <div className='date'>{currentTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
        </div>
        <button className='bell-button'><img src={bell} alt="bell" className='bell' /></button>
      </nav>

      <main className="report-content">
        <form onSubmit={handleSubmit} className="report-form">
          <header className="report-header">
            <h1 className="report-title">Report an Incident</h1>
            <button type="button" className="report-close-button" onClick={handleClose}>✕</button>
          </header>

          <section className="report-section">
            <label htmlFor="incidentType" className="report-label">What's happening?</label>
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
            <textarea id="description" name="description" className="report-textarea" placeholder="What exactly is happening? Where is it?" rows="5" value={formData.description} onChange={handleInputChange}></textarea>
          </section>

          <section className="report-section">
            <label htmlFor="location" className="report-label">Location</label>
            <input id="location" name="location" type="text" className="report-input" placeholder="Start typing area (e.g. Indiranagar)" value={formData.location} onChange={handleInputChange} autoComplete="off" />
            {locationSuggestions.length > 0 && (
              <ul className="location-suggestions">
                {locationSuggestions.map((loc, i) => (
                  <li key={i} onClick={() => handleSuggestionClick(loc)}>{loc}</li>
                ))}
              </ul>
            )}
          </section>

          {previewUrl && (
            <div className="photo-preview">
              <img src={previewUrl} alt="Preview" className="preview-img" />
            </div>
          )}

          <footer className="report-footer">
            <div className="report-actions">
              <label htmlFor="photo-upload" className="report-action-button photo-button">
                <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                📷 Add Photo
              </label>
              <button type="submit" className="send-button">Send Report</button>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
};

export default ReportSomething;