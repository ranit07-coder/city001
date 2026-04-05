// No change in imports
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.isSignup ? false : true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Image carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // LOGIN FLOW
      if (!formData.email || !formData.password) {
        setError("Please fill in both email and password");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("isAuthenticated", "true");
          navigate("/home");
        } else {
          setError(data.msg || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Network error. Please try again.");
      }
    } else {
      // SIGNUP FLOW
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        setError("Please fill in all fields");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName
          })
        });

        const data = await response.json();

        if (response.ok) {
          setIsLogin(true);
          setFormData({ email: "", password: "", firstName: "", lastName: "" });
          setError("✅ Signup successful! Please login now.");
        } else {
          setError(data.msg || "Signup failed");
        }
      } catch (err) {
        console.error("Signup error:", err);
        setError("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="signup-container">
      {/* LEFT SIDE (Carousel Background) */}
      <div
        className="signup-left"
        style={{
          backgroundImage: `url(${images[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="left-overlay">
          <div className="top-bar">
            <img src={downlode} alt="Logo" className="logo" />
            <button className="back-button" onClick={() => navigate('/')}>← Back</button>
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

      {/* RIGHT SIDE (Login/Signup Box) */}
      <div className="signup-right">
        <div className="login-box-wrapper">
          <div className="login-box">
            {/* HEADER */}
            <div className="signup-header">
              <div className="heading">{isLogin ? "Login" : "Create an account"}</div>
              <div className="login-prompt">
                {isLogin ? (
                  <>Don’t have an account?{" "}
                    <button className="login" onClick={() => setIsLogin(false)}>Sign up</button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button className="login" onClick={() => setIsLogin(true)}>Log in</button>
                  </>
                )}
              </div>
            </div>

            {/* ERROR / SUCCESS MESSAGE */}
            {error && <div className="error-message">{error}</div>}

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-row">
                  <input
                    type="text"
                    placeholder="First name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
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
                />
              </div>
              <div className="password-box">
                <input
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            {/* DIVIDER */}
            <div className="divider">
              <span className="divider-text">Or continue with</span>
            </div>

            {/* SOCIAL BUTTONS */}
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

            <div className="guest-login-container" style={{ marginTop: '15px' }}>
              <button 
                className="create-btn" 
                style={{ backgroundColor: '#4a5568', width: '100%' }}
                onClick={() => {
                  localStorage.setItem("token", "guest-token-123");
                  localStorage.setItem("isAuthenticated", "true");
                  navigate("/home");
                }}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
