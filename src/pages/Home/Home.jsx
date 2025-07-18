import React from 'react'
import './Home.css'
import Navbar from '../../components/Navbar/Navbar'
import icons8greendot from '../../assets/icons8-green-dot-48.png'
import icons8warningdot from '../../assets/icons8-warning-48.png'
import icons8growth from '../../assets/icons8-growth-60.png'
const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <div className="main-box">
        <div className='status'>Live Status</div>

        <div className='event-box'>
          <div className="event-info">
            <img src={icons8greendot} alt="" className='dot' />
            <div className='dotevent'>Active Events</div>
          </div>
          <div className='dotnumevent'>28</div>
        </div>

        <div className='priority-box'>
          <div className="priority-info">
            <img src={icons8warningdot} alt="" className='warning' />
            <div className='warningevent'>High Priority</div>
          </div>
          <div className='warningnumevent'>5</div>
        </div>

        <div className='Predictions-box'>
          <div className="prediction-info">
            <img src={icons8growth} alt="" className='prediction' />
            <div className='Predictionsevent'>Predictions</div>
          </div>
          <div className='Predictionsnumevent'>3</div>
        </div>

      </div>
    </div>
  )
}

export default Home
