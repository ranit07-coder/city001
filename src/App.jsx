import React from 'react';
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import TitlePage from './pages/TitlePage/TitlePage';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  return isAuthenticated ? children : <Navigate to="/" replace />;
};
=======
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import BengaluruLive from './pages/Live/BengaluruLive';
import ReportSomething from './pages/Live/components/Reports/ReportSomething';
>>>>>>> sohini-after-mapeventfeed2

function App() {
  return (
<<<<<<< HEAD
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/title" element={<TitlePage />} />
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
=======
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bengaluru-live" element={<BengaluruLive />} />
        <Route path="/report" element={<ReportSomething />} />
      </Routes>
    </div>
  );
}

export default App;
>>>>>>> sohini-after-mapeventfeed2
