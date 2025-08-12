import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard-navbar.css';
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
    localStorage.removeItem("token");
    alert("Logged out");
    navigate("/login");
  };

  useEffect(() => {
    document.body.style.backgroundColor = '#ECEEF3';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = 'Poppins, sans-serif';
  }, []);

  return (
    <div className='dashboard-navbar'>
      <img src={download} alt="Logo" className='pic' />

      <div className='dashboard-navbar-left'>
        <div className='city'>UrbanLens</div>
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

      <div className='dashboard-navbar-right'>
        <button className='bell-button'>
          <img src={bell} alt="Notifications" className='bell' />
        </button>

        <button className='menu-button'>
          <img src={dotsMenu} alt="Menu" className='dots-menu' />
        </button>

        <button className='logout-button' onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
