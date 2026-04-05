import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import Navbar from './components/Navbar/Dashboard-Navbar.jsx'
import icons8greendot from './assets/icons8-green-dot-48.png'
import icons8warningdot from './assets/icons8-warning-48.png'
import icons8growth from './assets/icons8-growth-60.png'
import happiness from './assets/happiness.png'
import Map from './components/Map/Map.jsx'
import Event from './components/Event/Event.jsx'
import AIPredictions from './components/AIPredictions/AIPredictions.jsx'

const Home = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    predictions: 0,
    cityMood: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch stats on load
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stats") // adjust URL if needed
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.warn("API offline, using mock stats:", err.message);
        setStats({
          total: 124,
          highPriority: 12,
          predictions: 5,
          cityMood: 78,
        });
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const handleClickHere = () => {
    navigate('/kolkata-live')
  }

  return (
    <div className="home">
      <Navbar />

      <div className="main-box">
        <div className='status'>Live Status</div>

        {loading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <div className='event-box'>
              <div className="event-info">
                <img src={icons8greendot} alt="" className='dot' />
                <div className='dotevent'>Active Events</div>
              </div>
              <div className='dotnumevent'>{stats.total}</div>
            </div>

            <div className='priority-box'>
              <div className="priority-info">
                <img src={icons8warningdot} alt="" className='warning' />
                <div className='warningevent'>High Priority</div>
              </div>
              <div className='warningnumevent'>{stats.highPriority}</div>
            </div>

            <div className='Predictions-box'>
              <div className="prediction-info">
                <img src={icons8growth} alt="" className='prediction' />
                <div className='Predictionsevent'>Predictions</div>
              </div>
              <div className='Predictionsnumevent'>{stats.predictions}</div>
            </div>

            <div className='line'></div>

            <div className="mood-box">
              <div className="mood">
                <img src={happiness} alt="" className='emoji' />
                <div className="citymood">City Mood</div>
              </div>

              <div className="mood-info">
                <div className="moode">Positive</div>
                <div className="moodee">{stats.cityMood}%</div>
              </div>
            </div>
          </>
        )}
      </div>

      <button 
        className="button" 
        onClick={handleClickHere}
      >
        <div className='button-text'>View Live Feed</div>
      </button>

      <div className="map-box">
        <Map />
      </div>

      <div className="event-section">
        <Event />
      </div>

      <div className="AI-prediction">
        <AIPredictions />
      </div>
    </div>
  )
}

export default Home
