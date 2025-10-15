// src/pages/TitlePage/TitlePage.jsx
import React, { useEffect } from 'react';
import './TitlePage.css';
import videoBg from '../../assets/3141210-uhd_3840_2160_25fps.mp4';
import { useNavigate } from 'react-router-dom';

const TitlePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const navbar = document.querySelector('.landing-navbar');

    const handleScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    const handleAnchorClick = (e) => {
      e.preventDefault();
      const target = document.querySelector(e.currentTarget.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => anchor.addEventListener('click', handleAnchorClick));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      anchors.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
    };
  }, []);

  const handleDashboardClick = () => {
    navigate("/home");
  };

  return (
    <div className="titlepage-wrapper">
      <div className="video-section">
        <video autoPlay muted loop playsInline className="hero-bg-video">
          <source src={videoBg} type="video/mp4" />
        </video>

        <nav className="landing-navbar">
          <a href="#home" className="logo">UrbanLens</a>
          <ul className="nav-links">
            <li><button onClick={handleDashboardClick} className="nav-link-btn">Dashboard</button></li>
            <li><button onClick={() => navigate('/login')} className="nav-link-btn">Login</button></li>
            <li><a href="#aboutus">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        <section id="home" className="hero">
          <div className="hero-content">
            <h1>UrbanLens</h1>
            <h2>Let Your City Breathe!</h2>
            <p className="highlight">Specializing in modern web development and cyber systems</p>
            <a href="#contact" className="cta-button">Let's Connect</a>
          </div>
        </section>
      </div>

      <section id="skills" className="skills">
        <h2>Core Capabilities</h2>
        <div className="skills-grid">
          <div className="skill-card">
            <i className="fa-solid fa-chart-line"></i>
            <h3>Real-Time Data Analytics</h3>
            <p>Live dashboards for traffic, utilities, safety, and environmental data insights.</p>
          </div>
          <div className="skill-card">
            <i className="fa-solid fa-city"></i>
            <h3>Urban Infrastructure Management</h3>
            <p>Smart integration of city services like waste, roads, and emergency systems.</p>
          </div>
          <div className="skill-card">
            <i className="fa-solid fa-comments"></i>
            <h3>Civic Engagement</h3>
            <p>Citizen reporting, feedback, and updates to enhance transparency and trust.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2025 UrbanLens. All rights reserved.</p>
        <div className="social-links">
          <a href="#"><i className="fa-brands fa-github"></i></a>
          <a href="#"><i className="fa-brands fa-linkedin"></i></a>
          <a href="#"><i className="fa-brands fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-whatsapp"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default TitlePage;
