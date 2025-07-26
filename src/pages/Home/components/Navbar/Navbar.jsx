import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import download from '../../assets/download.png';
import bell from '../../assets/bell.png';
import dotsMenu from '../../assets/dots-menu.png';

const Navbar = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    alert("Logged out");
    navigate("/"); // Redirect to login page
  };

  return (
    <div className='navbar'>
      <img src={download} alt="" className='pic' />

      <div className='navbar-left'>
        <div className='city'>UrbanLance</div>
        <div className='urbancity'>Bengaluru Live Intelligence</div>
      </div>

      <div className='datetime'>
        <div className='time'>
          {dateTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })}
        </div>
        <div className='date'>
          {dateTime.toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
          })}
        </div>
      </div>

      <button className='bell-button'>
        <img src={bell} alt="Notifications" className='bell' />
      </button>

      <button className='menu-button'>
        <img src={dotsMenu} alt="Menu" className='dots-menu' />
      </button>

      {/* 🚪 Logout Button */}
      <button className='logout-button' onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
