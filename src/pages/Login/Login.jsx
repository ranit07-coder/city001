// No change in imports
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (isLogin) {
      if (formData.email && formData.password) {
        localStorage.setItem("isAuthenticated", "true");
        navigate("/home");
      } else {
        setError("Please fill in all fields");
      }
    } else {
      if (formData.email && formData.password && formData.firstName && formData.lastName) {
        setIsLogin(true);
        setError("Signup successful! Please login.");
      } else {
        setError("Please fill in all fields");
      }
    }
  };

  return (
    <div className="signup-container">
      <div 
        className="signup-left"
        style={{ 
          backgroundImage: `url(${images[currentImage]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
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

      <div className="signup-right">
        <div className="login-box-wrapper">
          <div className="login-box">
            <div className="signup-header">
              <div className="heading">{isLogin ? "Register" : "Create an account"}</div>
              <div className="login-prompt">
                {isLogin ? (
                  <>Don't have an account? <button className="login" onClick={() => setIsLogin(false)}>Sign up</button></>
                ) : (
                  <>Already have an account? <button className="login" onClick={() => setIsLogin(true)}>Log in</button></>
                )}
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="email-box">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="password-box">
                <input
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              {!isLogin && (
                <div className="checkbox-row">
                  <input type="checkbox" required />
                  <label>
                    I agree to the <a href="#">Terms & Conditions</a>
                  </label>
                </div>
              )}
              <button type="submit" className="create-btn">
                {isLogin ? "Login" : "Create account"}
              </button>
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
      </div>
    </div>
  );
};

export default Login;
