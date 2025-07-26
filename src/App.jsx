import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import BengaluruLive from './pages/Live/BengaluruLive';
import ReportSomething from './pages/Live/components/Reports/ReportSomething';

function App() {
  return (
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
