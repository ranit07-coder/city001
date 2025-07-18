import React, { useEffect, useState } from 'react'
import './Navbar.css'
import download from '../../assets/download.png'
import bell from '../../assets/bell.png'
import dotsMenu from '../../assets/dots-menu.png'

const Navbar = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className='navbar'>
      <img src={download} alt="" className='pic' />
      <div className='navbar-left'>
        <div className='city'>UrbanLance</div>
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
      <img src={bell} alt="" className='bell' />
      <img src={dotsMenu} alt="" className='dots-menu' />
    </div>
  )
}

export default Navbar