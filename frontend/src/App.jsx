import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CourtSelection from './pages/client/CourtSelection';
import BookingSummary from './pages/client/BookingSummary';
import './styles/design-system.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="header-nav">
          <div className="logo-container">
            <span style={{ fontSize: '24px' }}>⚽</span>
            <span className="text-gradient">Golparche</span>
          </div>
          <div className="step-indicator">
            <span className="step-active">1. Selección</span> &gt; <span>2. Pago</span> &gt; <span>3. Confirmación</span>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<CourtSelection />} />
            <Route path="/checkout" element={<BookingSummary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
