import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import KolkataLive from './pages/Live/KolkataLive';
import ReportSomething from './pages/Live/components/Reports/ReportSomething';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kolkata-live" element={<KolkataLive />} />
        <Route path="/report" element={<ReportSomething />} />
      </Routes>
    </div>
  );
}

export default App;
