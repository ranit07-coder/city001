import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home'
import ReportSomething from './pages/Report/ReportSomething';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<ReportSomething />} />
      </Routes>
    </Router>
  );
}

export default App
