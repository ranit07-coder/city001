import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportSomething.css';
import download from '../../assets/download.png';
import bell from '../../assets/bell.png';

const GEMINI_API_KEY = "AIzaSyAcbDCRBsGMY1JTAc5yHHAeAYWjRNRwo50";
const MAPTILER_API_KEY = "KdLhMN46zBrXqGDvET6g";

const ReportSomething = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formData, setFormData] = useState({
    incidentType: 'traffic-jam-accident',
    description: '',
    photo: null,
    location: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
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

  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: value }));

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(value)}.json?key=${MAPTILER_API_KEY}&limit=5`
    );
    const data = await response.json();
    setSuggestions(data.features || []);
  };

  const handleSuggestionSelect = (place) => {
    setFormData(prev => ({ ...prev, location: place.formatted }));
    setSuggestions([]);
  };

  const analyzeImageWithGemini = async (imageFile) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const base64Image = reader.result.split(',')[1];
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=" + GEMINI_API_KEY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  text: `You are an advanced visual reasoning assistant built into a civic monitoring system designed for a smart city dashboard in Bengaluru, India. Your core responsibility is to analyze real-world urban or street-level images submitted by citizens and detect actionable civic incidents or infrastructure issues relevant to urban authorities, traffic managers, and general public.

The images may be captured via mobile phones and may contain varying quality or lighting conditions. Your analysis must focus on clearly visible, real, and practical problems that require awareness or attention.

Possible issues include (but are not limited to):
• Traffic jam or vehicle congestion
• Road accident or vehicle collision
• Potholes, road cracks, or road damage
• Waterlogging or flooded roads due to rain
• Drain overflow or sewage spillage
• Garbage dump or overflowing public bins
• Broken street lights or power pole collapse
• Construction debris, blocked roads, or dug-up areas
• Unusual crowd gathering, protest, or public event
• Fallen trees or poles obstructing roads
• Illegal parking or obstructive vehicles
• Hazardous smoke, fire, or explosion in public space
• Police barricades or blocked junctions
• Collapsed footpath or infrastructure danger

Output Format (Strict):
Detected: [issue type] near [urban landmark or area].
- Be very clear and short. Maximum 15 words.
- Mention only one issue per image — pick the most important.
- Choose real, believable locations (use signboards, shop names, banners, hoardings, metro names, road signs).
- Stick to Bengaluru urban context — e.g., “near Silk Board”, “near KR Market”, “Whitefield Metro”, etc.
- Write in neutral, civic-professional tone — this is an official civic data feed.

Additional Visual Rules:
- If there’s text on boards or metro signs, extract it and use it for area name.
- If you see multiple vehicles stopped, infer “traffic jam”.
- If water covers the road with ripples, puddles, or reflections → infer “waterlogging”.
- Cracked or broken asphalt with open holes = “pothole”.
- Bin with trash spilling out = “garbage overflow”.
- Standing crowd blocking a road = “crowd gathering” or “event”.
- A bike and person on the road = possibly “accident” if it looks like a fall or crash.

Do NOT:
- Make up locations that don’t exist
- Use vague language like “There might be…”
- Use subjective phrases like “very bad”, “messy”, “dangerous”
- Mention image quality or analysis confidence
- Use more than one sentence
- Add extra words like “Summary:” or “Here is the result”

Objective:
This image will be used by an agentic AI-powered civic dashboard to auto-report issues to the city’s live event feed. Your task is to make this one-liner usable as a real-time civic alert — like a tweet, short notification, or dashboard item.
Accuracy, brevity, and professionalism are mandatory.`
                },
                {
                  inlineData: {
                    mimeType: imageFile.type,
                    data: base64Image
                  }
                }
              ]
            }]
          })
        });
        const data = await response.json();
        try {
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          resolve(reply);
        } catch (err) {
          reject("Gemini response parsing failed");
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
      setPreviewUrl(URL.createObjectURL(file));
      const result = await analyzeImageWithGemini(file);
      console.log("Gemini AI Analysis:", result);
      setFormData(prev => ({ ...prev, description: result }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Final Report:', formData);
    localStorage.setItem("latestEvent", JSON.stringify({
      title: formData.incidentType,
      description: formData.description,
      location: formData.location,
      level: 3,
      sources: 1
    }));
    navigate("/");
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="report-page">
      <nav className="navbar">
        <img src={download} alt="" className='pic' />
        <div className='navbar-left'>
          <div className='city'>UrbanLense</div>
          <div className='urbancity'>Bengaluru Live Intelligence</div>
        </div>
        <div className='datetime'>
          <div className='time'>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</div>
          <div className='date'>{currentTime.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
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

          <section className="report-section" style={{ position: 'relative' }}>
            <label htmlFor="location" className="report-label">Where is it happening?</label>
            <input
              type="text"
              id="location"
              name="location"
              className="report-input"
              placeholder="e.g., Indiranagar, Bengaluru"
              value={formData.location || ""}
              onChange={handleLocationChange}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="location-suggestions">
                {suggestions.map((place, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionSelect(place)}
                    className="suggestion-item"
                  >
                    {place.formatted}
                  </li>
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
              <div className="action-group-left">
                <label htmlFor="photo-upload" className="report-action-button photo-button">
                  <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  📷 Add Photo
                </label>
                <button type="button" className="cancel-button" onClick={handleClose}>Cancel</button>
              </div>
              <div className="action-group-right">
                <button type="submit" className="send-button">Send Reports</button>
              </div>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
};

export default ReportSomething;
