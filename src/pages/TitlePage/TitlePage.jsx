import React, { useEffect } from 'react';
import './TitlePage.css';
import videoBg from '../../assets/3141210-uhd_3840_2160_25fps.mp4';

const TitlePage = () => {
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      navbar.style.backgroundColor =
        window.scrollY > 50 ? 'rgba(10, 10, 10, 0.98)' : 'rgba(10, 10, 10, 0.94)';
    };

    const handleAnchorClick = (e) => {
      e.preventDefault();
      const target = document.querySelector(e.currentTarget.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => anchor.addEventListener('click', handleAnchorClick));

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      anchors.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
    };
  }, []);

  return (
    <div>
      <nav className="navbar">
        <a href="#home" className="logo">UrbanLens</a>
        <ul className="nav-links">
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#citymap">Login</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>

      <section id="home" className="hero">
        <video autoPlay muted loop playsInline className="hero-bg-video">
          <source src={videoBg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="hero-content">
          <h1>UrbanLens</h1>
          <h2>Let Your City Breathe!</h2>
          <p className="highlight">Specializing in modern web development and cyber systems</p>
          <a href="#contact" className="cta-button">Let's Connect</a>
        </div>
      </section>

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
        <p>&copy; 2025 UrbanLens. All rights Reserved</p>
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
