import React, { useState, useEffect } from "react";
import "./Login.css";
import bg1 from "./assets/background1.jpg";
import bg2 from "./assets/background2.jpg";
import bg3 from "./assets/background3.jpg";
import downlode from "./assets/download1.png";
import googleIcon from "./assets/search.png";
import microsoftIcon from "./assets/microsoft.png";

const images = [bg1, bg2, bg3];

const Login = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="signup-container">
      <div className="pic">
        <div
          className="signup-left"
          style={{ backgroundImage: `url(${images[currentImage]})` }}
        >
          <div className="left-overlay">
            <div className="top-bar">
              <img src={downlode} alt="Logo" className="logo" />
              <button className="back-button">Back to website</button>
            </div>
            <div className="bottom-caption">
              <p>Capturing Moments, Creating Memories</p>
              <div className="carousel-dots">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={currentImage === index ? "active" : ""}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      <div className="signup-right">
        <div className="signup-header">
          <div className="heading">Create an account</div>
          <div className="login-prompt">
            Already have an account? <a className="login" href="#">Log in</a>
          </div>
        </div>

        <form>
          <div className="input-row">
            <input type="text" placeholder="First name" />
            <input type="text" placeholder="Last name" />
          </div>
          <div className="email-box">
            <input type="email" placeholder="Email" />
          </div>
          <div className="password-box">
            <input type="password" placeholder="Enter your password" />
          </div>
          <div className="checkbox-row">
            <input type="checkbox" />
            <label>
              I agree to the <a href="#">Terms & Conditions</a>
            </label>
          </div>
          <button type="submit" className="create-btn">Create account</button>
        </form>

        <div className="divider">
          <span className="divider-text">Or register with</span>
        </div>

        <div className="auth-buttons">
          <button className="google-btn">
            <img src={googleIcon} alt="" className="googleIcon" />
            <div className="google-text">Google</div>
          </button>

          <button className="microsoft-btn">
            <img src={microsoftIcon} alt="" className="MicrosoftIcon" />
            <div className="microsoft-text">Microsoft</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
