import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import TitlePage from './pages/TitlePage/TitlePage';
import BengaluruLive from './pages/Live/BengaluruLive';
import ReportSomething from './pages/Live/components/Reports/ReportSomething';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/title" replace />;
};

function App() {
  return (
    <Routes>
      {/* Default Route to Title Page */}
      <Route path="/" element={<TitlePage />} />

      {/* Public Routes */}
      <Route path="/title" element={<TitlePage />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route path="/home" element={<Home />} />
      <Route path="/bengaluru-live" element={<BengaluruLive />} />
      <Route path="/report" element={<ReportSomething />} />

      {/* Catch-all redirect to TitlePage */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
