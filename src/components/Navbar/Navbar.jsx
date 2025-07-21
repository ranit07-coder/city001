import React, { useEffect, useState } from 'react'
import './Navbar.css'
import download from '../../assets/download.png'
import bell from '../../assets/bell.png'
import dotsMenu from '../../assets/dots-menu.png'
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleReportClick = () => {
    navigate('/report');
  };

  return (
    <>
      <div className='navbar'>
        <img src={download} alt="" className='pic' />
        <div className='navbar-left'>
          <div className='city'>UrbanLense</div>
          <div className='urbancity'>Bengaluru Live Intelligence</div>
        </div>
        <div className='datetime'>
          <div className='time'>
            {dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <div className='date'>
            {dateTime.toLocaleDateString('en-US', {
              weekday: 'short',
              day: '2-digit',
              month: 'short'
            })}
          </div>
        </div>
        
        <button className='bell-button'><img src={bell} alt="" className='bell' /></button>
        <button className='menu-button' onClick={() => setShowSidebar(!showSidebar)}>
          <img src={dotsMenu} alt="" className='dots-menu' />
        </button>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">
          <button className="sidebar-item" onClick={handleReportClick}>Report</button>
          <button className="sidebar-item">Services</button>
          <button className="sidebar-item">Contact</button>
          <button className="sidebar-item">Login</button>
          <button className="sidebar-item">Sign Up</button>
        </div>
      )}
    </>
  )
}

export default Navbar